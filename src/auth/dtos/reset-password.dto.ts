import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { HelperService } from 'src/services/helper.service';

export class ResetPasswordDto {
  @ApiPropertyOptional()
  @IsString()
  @HelperService.Normalize()
  emailAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  @HelperService.Normalize()
  username?: string;

  @ApiPropertyOptional()
  @IsString()
  @HelperService.Normalize()
  phoneNumber?: string;

  @IsString()
  @HelperService.Trim()
  @ApiProperty()
  otp: string;

  @IsString()
  @ApiProperty()
  password: string;
}
