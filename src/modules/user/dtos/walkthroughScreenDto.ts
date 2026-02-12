import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { WalkthroughScreenEnum } from '@common/enums/walkthrough-screens';

export class WalkthroughScreenDto {
  @ApiProperty()
  @IsEnum(WalkthroughScreenEnum)
  @IsNotEmpty()
  screenName: WalkthroughScreenEnum;
}
