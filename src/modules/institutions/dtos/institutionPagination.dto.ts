import { PaginationDTO } from '@common/dto/pagination.dto';

export class InstitutionPaginationDto extends PaginationDTO<
  'name' | 'country' | 'isActive'
> {}
