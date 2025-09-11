import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

// Determine database configuration based on DB_HIT_SERVER
const dbHitServer = process.env.DB_HIT_SERVER?.toUpperCase() || 'OFF';

let dataSourceConfig: any;

if (dbHitServer === 'ON') {
  // Server database configuration (via SSH tunnel)
  dataSourceConfig = {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: parseInt(process.env.POSTGRES_PORT || '6543'),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [join(__dirname, '../modules/**/entities/*.entity{.ts,.js}')],
    migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
    synchronize: false,
    logging: true,
  };
} else {
  // Local database configuration
  dataSourceConfig = {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'falaqmsi',
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRES_DB || 'msf_production',
    entities: [join(__dirname, '../modules/**/entities/*.entity{.ts,.js}')],
    migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
    synchronize: false,
    logging: true,
  };
}

export const AppDataSource = new DataSource(dataSourceConfig);
