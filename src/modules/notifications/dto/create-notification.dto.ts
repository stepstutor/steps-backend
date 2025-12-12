import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ReceiverGroup } from '@common/enums/notificationReceiverGroup';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'The title of the notification',
    example: 'New Course Available',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The text content of the notification',
    example: 'A new course is available for enrollment.',
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'The link URL to provide additional information (optional)',
    example: 'http://example.com/courses/new-course',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  linkUrl?: string;

  @ApiProperty({
    description: 'The text to display for the link (optional)',
    example: 'Learn More',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  linkText?: string;

  @ApiProperty({
    description: 'Receiver group (INSTRUCTOR, STUDENT, or BOTH)',
    enum: ReceiverGroup,
    example: ReceiverGroup.BOTH,
  })
  @IsEnum(ReceiverGroup)
  receiverGroup: ReceiverGroup;

  @ApiProperty({
    description: 'Receiver country (optional)',
    type: [String],
    example: 'US',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  receiverCountry?: string[];

  @ApiProperty({
    description: 'List of receiver institution IDs (optional)',
    type: [String],
    example: ['institution-id-1', 'institution-id-2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  receiverInstituteIds?: string[];

  @ApiProperty({
    description: 'List of receiver course IDs (optional)',
    type: [String],
    example: ['course-id-1', 'course-id-2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  receiverCourseIds?: string[];

  @ApiProperty({
    description: 'Scheduled date and time for the notification (optional)',
    type: String,
    format: 'date-time',
    example: '2025-02-01T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduleDate?: Date;

  @ApiProperty({
    description: 'Flag to indicate if an email should be sent',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;
}
