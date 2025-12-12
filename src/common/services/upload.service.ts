import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ObjectCannedACL, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid'; // For unique file names
import { S3Service } from './s3.service';

@Injectable()
export class UploadService {
  constructor(
    private readonly s3ClientService: S3Service,
    @Inject('AWS_S3_BUCKET_NAME') private readonly bucketName: string,
  ) {}

  async uploadFileToS3(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }

    const fileKey = `${uuid()}-${file.originalname}`;

    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.public_read,
    };

    try {
      await this.s3ClientService.s3Client.send(new PutObjectCommand(params));
      return `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new BadRequestException('File upload failed.');
    }
  }
}
