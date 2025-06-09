import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'src/models/user/user-role';
import { HelperService } from 'src/services/helper.service';

export class LoginDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @HelperService.Normalize()
  emailAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @HelperService.Normalize()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  token: string;
  @ApiProperty()
  role: UserRole;
}
