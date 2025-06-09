import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { HelperService } from 'src/services/helper.service';

export class ChangeUsernameDto {
  @ApiProperty()
  @IsString()
  @HelperService.Normalize()
  newUsername: string;
}
