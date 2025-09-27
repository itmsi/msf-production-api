import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Client } from 'ssh2';
import { ConfigService } from '@nestjs/config';
import { createServer } from 'net';
import { execSync } from 'child_process';

@Injectable()
export class SshTunnelService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SshTunnelService.name);
  private sshClient: Client;
  private tunnelServer: any;
  private isTunnelActive = false;

  constructor(private configService: ConfigService) {
    this.logger.log('🔧 SSH Tunnel Service constructor called');
  }

  async onModuleInit() {
    this.logger.log('🚀 SSH Tunnel Service initializing...');

    // Check if we should use server database or local database
    const dbHitServer = this.configService.get<string>('DB_HIT_SERVER', 'OFF').toUpperCase();

    if (dbHitServer === 'OFF') {
      this.logger.log('🏠 Using LOCAL database configuration');
      this.logger.log('SSH tunnel will be skipped');
      this.isTunnelActive = false;
      return;
    }

    this.logger.log('🌐 Using SERVER database configuration');
    this.logger.log('Setting up SSH tunnel...');

    const sshHost = this.configService.get<string>('SSH_HOST', '162.11.0.232');
    const sshPort = this.configService.get<number>('SSH_PORT', 22);
    const sshUsername = this.configService.get<string>('SSH_USERNAME', 'msiserver');
    const sshPassword = this.configService.get<string>('SSH_PASSWORD', 'm0t0r519ht5!@#');
    const dbHost = this.configService.get<string>('DB_HOST', '127.0.0.1');
    const dbPort = this.configService.get<number>('DB_PORT', 5432);
    const localPort = this.configService.get<number>('LOCAL_TUNNEL_PORT', 6543);

    this.logger.log(`📋 Configuration loaded:`);
    this.logger.log(`   SSH: ${sshUsername}@${sshHost}:${sshPort}`);
    this.logger.log(`   DB: ${dbHost}:${dbPort}`);
    this.logger.log(`   Local Port: ${localPort}`);

    try {
      this.logger.log('Creating SSH tunnel...');
      this.logger.log(`SSH: ${sshUsername}@${sshHost}:${sshPort}`);
      this.logger.log(`Tunnel: localhost:${localPort} -> ${dbHost}:${dbPort}`);

      // Create SSH client
      this.sshClient = new Client();

      // Create tunnel server
      this.tunnelServer = createServer((localConnection) => {
        this.sshClient.forwardOut(
          localConnection.remoteAddress || '127.0.0.1',
          localConnection.remotePort || localPort,
          dbHost,
          dbPort,
          (err, sshStream) => {
            if (err) {
              this.logger.error('SSH forward error:', err.message);
              localConnection.end();
              return;
            }

            localConnection.pipe(sshStream).pipe(localConnection);
          },
        );
      });

      // Connect to SSH server
      await new Promise((resolve, reject) => {
        this.sshClient.on('ready', () => {
          this.logger.log('SSH connection established');

          // Start tunnel server
          this.tunnelServer.listen(localPort, '127.0.0.1', () => {
            this.logger.log('✅ SSH tunnel established successfully');
            this.logger.log(`Database accessible at: localhost:${localPort}`);
            this.isTunnelActive = true;

            // Update environment variables
            process.env.POSTGRES_HOST = '127.0.0.1';
            process.env.POSTGRES_PORT = localPort.toString();

            resolve(true);
          });
        });

        this.sshClient.on('error', (err) => {
          this.logger.error('SSH connection error:', err.message);
          this.logger.error('SSH error details:', err);
          reject(new Error(err.message ?? String(err)));
        });

        this.sshClient.on('close', () => {
          this.logger.warn('SSH connection closed');
        });

        this.sshClient.on('end', () => {
          this.logger.warn('SSH connection ended');
        });

        this.sshClient.connect({
          host: sshHost,
          port: sshPort,
          username: sshUsername,
          password: sshPassword,
          readyTimeout: 20000,
          keepaliveInterval: 1000,
          authHandler: ['password'],
          algorithms: {
            kex: ['diffie-hellman-group1-sha1', 'diffie-hellman-group14-sha1'],
            cipher: ['aes128-ctr', 'aes192-ctr', 'aes256-ctr'],
            hmac: ['hmac-sha2-256', 'hmac-sha1'],
            compress: ['none'],
          },
        });
      });
    } catch (error) {
      this.logger.error('Failed to establish SSH tunnel:', error.message);
      this.logger.warn('Application will continue without SSH tunnel');
      this.logger.warn('Make sure database is accessible directly');

      // Fallback: try to use manual tunnel if available
      this.logger.log('Checking for existing manual tunnel...');
      if (this.checkManualTunnel(localPort)) {
        this.logger.log('✅ Found existing manual tunnel, using it');
        this.isTunnelActive = true;
        process.env.POSTGRES_HOST = '127.0.0.1';
        process.env.POSTGRES_PORT = localPort.toString();
      }
    }
  }

  onModuleDestroy() {
    this.logger.log('🛑 SSH Tunnel Service destroying...');
    if (this.isTunnelActive) {
      try {
        if (this.tunnelServer) {
          this.tunnelServer.close();
          this.logger.log('Tunnel server closed');
        }

        if (this.sshClient) {
          this.sshClient.end();
          this.logger.log('SSH connection closed');
        }

        this.isTunnelActive = false;
      } catch (error) {
        this.logger.error('Error closing SSH tunnel:', error.message);
      }
    }
  }

  isTunnelReady(): boolean {
    return this.isTunnelActive;
  }

  getTunnelInfo(): { localPort: number; isActive: boolean } {
    const localPort = this.configService.get<number>('LOCAL_TUNNEL_PORT', 6543);
    return {
      localPort,
      isActive: this.isTunnelActive,
    };
  }

  private checkManualTunnel(port: number): boolean {
    try {
      const result = execSync(`lsof -i :${port}`, { encoding: 'utf8' });
      return result.includes('ssh');
    } catch (error) {
      return false;
    }
  }
}
