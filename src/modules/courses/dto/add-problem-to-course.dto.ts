import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  Validate,
  IsBoolean,
  IsOptional,
  IsDateString,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'PlanningDatesOrder', async: false })
class PlanningDatesOrderConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const dto = args.object as AddProblemToCourseDto;

    if (!dto.hasPlanning || dto.isOptional) {
      return true;
    }

    if (!dto.planningReleaseDate || !dto.planningDueDate) {
      return false;
    }

    const planningRelease = Date.parse(dto.planningReleaseDate);
    const planningDue = Date.parse(dto.planningDueDate);

    if (Number.isNaN(planningRelease) || Number.isNaN(planningDue)) {
      return false;
    }

    return planningRelease < planningDue;
  }

  defaultMessage(): string {
    return 'planningReleaseDate must be earlier than planningDueDate when planning is enabled';
  }
}

@ValidatorConstraint({ name: 'ReflectionDatesOrder', async: false })
class ReflectionDatesOrderConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const dto = args.object as AddProblemToCourseDto;

    if (!dto.hasReflection || dto.isOptional) {
      return true;
    }

    if (!dto.reflectionReleaseDate || !dto.reflectionDueDate) {
      return false;
    }

    const reflectionRelease = Date.parse(dto.reflectionReleaseDate);
    const reflectionDue = Date.parse(dto.reflectionDueDate);

    if (Number.isNaN(reflectionRelease) || Number.isNaN(reflectionDue)) {
      return false;
    }

    if (reflectionRelease >= reflectionDue) {
      return false;
    }

    if (dto.hasPlanning) {
      if (!dto.planningDueDate) {
        return false;
      }

      const planningDue = Date.parse(dto.planningDueDate);

      if (Number.isNaN(planningDue)) {
        return false;
      }

      if (reflectionRelease < planningDue) {
        return false;
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const dto = args.object as AddProblemToCourseDto;

    if (dto.hasPlanning) {
      return 'reflectionReleaseDate must be earlier than reflectionDueDate and not earlier than planningDueDate when both workflows are enabled';
    }

    return 'reflectionReleaseDate must be earlier than reflectionDueDate when reflection is enabled';
  }
}

export class AddProblemToCourseDto {
  @ApiPropertyOptional({
    description: 'Enable planning workflow for the problem',
  })
  @IsOptional()
  @IsBoolean()
  hasPlanning?: boolean;

  @ApiPropertyOptional({
    description: 'Enable reflection workflow for the problem',
  })
  @IsOptional()
  @IsBoolean()
  hasReflection?: boolean;

  @ApiPropertyOptional({
    description: 'Release date for the planning portion',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  planningReleaseDate?: string | null;

  @ApiPropertyOptional({
    description: 'Due date for the planning portion',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  @Validate(PlanningDatesOrderConstraint)
  planningDueDate?: string | null;

  @ApiPropertyOptional({
    description: 'Release date for the reflection portion',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  reflectionReleaseDate?: string | null;

  @ApiPropertyOptional({
    description: 'Due date for the reflection portion',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  @Validate(ReflectionDatesOrderConstraint)
  reflectionDueDate?: string | null;

  @ApiPropertyOptional({
    description: 'Mark the reflection as optional for students',
  })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @ApiPropertyOptional({
    description: 'Mark the problem as a draft within the course',
  })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @ApiPropertyOptional({
    description: 'Require solution submission for the problem',
  })
  @IsOptional()
  @IsBoolean()
  requireSolution?: boolean;

  @ApiPropertyOptional({
    description: 'Require feedback for the attempted solution',
  })
  @IsOptional()
  @IsBoolean()
  requireFeedback?: boolean;
}
