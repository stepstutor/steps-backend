import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from 'src/common/enums/userRole';

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
