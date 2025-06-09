import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ResponseHelper } from 'src/services/response-helper';
import { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponse } from 'src/models/api-response';
import { ChangeUsernameDto } from './dtos/change-username.dto';
import { Public, UserContext } from 'src/decorators';
import { AuthGuard } from 'src/auth/guards';
import { GetUserProfileDto, UpdateUserProfile } from 'src/models/user/user.dto';

// swagger auth
@ApiBearerAuth()
@ApiTags('Users')
@ApiBadRequestResponse({ type: ApiResponse })
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @ApiOkResponse({ type: ApiResponse<{ exists: boolean }> })
  @Get('username/exists/:username')
  async checkUsernameExists(
    @Param('username') username: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const exists = await this.usersService.userNameExists(
      username.trim().toUpperCase(),
    );

    return ResponseHelper.ok(res, { exists }, 'Username check completed');
  }

  @Patch('username')
  @ApiOkResponse({ type: ApiResponse })
  async createUsername(
    @Res({ passthrough: true }) res: Response,
    @Body() changeUsernameDto: ChangeUsernameDto,
    @UserContext('sub') userId: string,
  ) {
    await this.usersService.changeUsername(
      userId,
      changeUsernameDto.newUsername,
    );

    return ResponseHelper.defaultOk(res, 'Username changed successfully');
  }

  @Patch('profile')
  @ApiOkResponse({ type: ApiResponse })
  async updateProfile(
    @Res({ passthrough: true }) res: Response,
    @Body() updateProfileDto: UpdateUserProfile,
    @UserContext('sub') userId: string,
  ) {
    await this.usersService.updateUserProfile(userId, updateProfileDto);

    return ResponseHelper.defaultOk(res, 'Profile updated successfully');
  }

  @Get('profile')
  @ApiOkResponse({ type: ApiResponse<GetUserProfileDto> })
  async getProfile(
    @Res({ passthrough: true }) res: Response,
    @UserContext('sub') userId: string,
  ) {
    const profile = await this.usersService.getUserProfile(userId);
    return ResponseHelper.ok(
      res,
      profile,
      'User profile retrieved successfully',
    );
  }
}
