import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Avatar } from './avatar';
import { IsEmail, IsString } from 'class-validator';
import { HelperService } from 'src/services/helper.service';

export class UserDto {
  @ApiProperty()
  id: string;

  @HelperService.Normalize()
  @IsString()
  @IsEmail()
  @ApiProperty()
  emailAddress: string;

  @IsString()
  @ApiProperty()
  firstName: string;

  @IsString()
  @ApiProperty()
  lastName: string;

  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  avatar: Avatar;

  @HelperService.Normalize()
  @ApiProperty()
  username: string;
  @ApiProperty()
  dateActivated: Date;
}

export class NullableUserDto {
  @ApiPropertyOptional()
  firstName?: string;
  @ApiPropertyOptional()
  lastName?: string;
  @ApiPropertyOptional()
  avatar?: Avatar;

  @HelperService.Normalize()
  @ApiPropertyOptional()
  username?: string;
  @ApiPropertyOptional()
  dateActivated?: Date;
}

export class CreateUserDto extends PickType(UserDto, [
  'emailAddress',
  'firstName',
  'lastName',
]) {}

export class GetUserDto extends IntersectionType(
  PickType(UserDto, ['id', 'emailAddress', 'createdAt', 'updatedAt']),
  PickType(NullableUserDto, [
    'firstName',
    'lastName',
    'avatar',
    'username',
    'dateActivated',
  ]),
) {}

export class UpdateUserProfile extends PartialType(
  PickType(UserDto, ['firstName', 'lastName', 'avatar']),
) {}

export class GetUserProfileDto extends PartialType(
  PickType(UserDto, [
    'username',
    'firstName',
    'lastName',
    'avatar',
    'emailAddress',
  ]),
) {}

export interface UserContextDto {
  sub: string;
  emailAddress: string;
  role: string;
  jti: string;
}
