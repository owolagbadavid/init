import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { HelperService } from 'src/services/helper.service';

export class ForgotPasswordDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEmail()
  @HelperService.Normalize()
  emailAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @HelperService.Normalize()
  username?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  @HelperService.Normalize()
  phoneNumber?: string;
}
