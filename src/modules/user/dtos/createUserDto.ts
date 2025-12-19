import { Role } from 'src/common/enums/userRole';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @IsEnum([Role.INSTRUCTOR, Role.STUDENT], {
    message: 'Role must be either INSTRUCTOR or STUDENT',
  })
  @IsNotEmpty()
  @ApiPropertyOptional()
  role: Role;
}
