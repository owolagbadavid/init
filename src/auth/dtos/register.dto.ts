import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { HelperService } from 'src/services/helper.service';

export class RegisterDto {
  @HelperService.Normalize()
  @IsString()
  @IsEmail()
  @ApiProperty()
  emailAddress: string;

  @HelperService.Trim()
  @IsString()
  @ApiProperty()
  firstName: string;

  @HelperService.Trim()
  @IsString()
  @ApiProperty()
  lastName: string;
}
