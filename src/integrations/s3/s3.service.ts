import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') || 'msf-production';
    this.region = this.configService.get<string>('MINIO_REGION') || 'us-east-1';

    this.s3Client = new S3Client({
      region: this.region,
      endpoint: this.configService.get<string>('MINIO_ENDPOINT') || 'http://localhost:9000',
      credentials: {
        accessKeyId: this.configService.get<string>('MINIO_ACCESS_KEY_ID') || 'minioadmin',
        secretAccessKey: this.configService.get<string>('MINIO_SECRET_ACCESS_KEY') || 'minioadmin',
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  async uploadFile(
    key: string,
    fileBuffer: Buffer,
    contentType: string = 'text/csv',
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);
      this.logger.log(`File uploaded successfully: ${key}`);

      return key;
    } catch (error) {
      this.logger.error(`Failed to upload file ${key}:`, error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async generateDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate download URL for ${key}:`, error);
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }
  }

  async uploadErrorFile(
    fileName: string,
    fileBuffer: Buffer,
  ): Promise<{ key: string; downloadUrl: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const key = `population_import_error/${timestamp}_${fileName}`;
    
    await this.uploadFile(key, fileBuffer);
    const downloadUrl = await this.generateDownloadUrl(key);
    
    return { key, downloadUrl };
  }
}
