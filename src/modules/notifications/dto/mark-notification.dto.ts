import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MarkNotificationsDto {
  @ApiProperty({
    description:
      'Array of notification IDs to mark as seen. Accepts both string and array.',
    type: [String],
    example: [
      'd0214bc2-47ad-486b-99d6-dc12f54ca9e1',
      'fcca6139-16ea-4edd-b38c-bbd9cfe4a934',
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true }) // Ensure every item in the array is a valid UUID
  @Transform(({ value }) => (Array.isArray(value) ? value : [value])) // Force single string into an array
  notificationIds: string[];
}
