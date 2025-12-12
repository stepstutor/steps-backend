import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/common/enums/userRole';

export class QueryParamsInvitationsDto {
  @ApiProperty()
  role: Role;
}
