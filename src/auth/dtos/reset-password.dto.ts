import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { HelperService } from 'src/services/helper.service';

export class ResetPasswordDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @HelperService.Normalize()
  emailAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @HelperService.Normalize()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
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
