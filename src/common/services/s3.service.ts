import { S3Client } from '@aws-sdk/client-s3';
import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.DEFAULT })
export class S3Service {
  private client: S3Client;

  constructor(private readonly configService: ConfigService) {
    const s3_region = this.configService.get('AWS_REGION');

    if (!s3_region) {
      throw new Error('AWS_REGION not found in environment variables');
    }

    this.client = new S3Client({
      region: s3_region,
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  get s3Client(): S3Client {
    return this.client;
  }
}
