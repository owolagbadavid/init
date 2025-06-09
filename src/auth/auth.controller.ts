import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  // ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiResponse } from 'src/models/api-response';
import { LoginDto } from './dtos/login.dto';
import { ResponseHelper } from 'src/services/response-helper';
import { Response } from 'express';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { CreateUserDto } from 'src/models/user/user.dto';

@ApiTags('Auth')
@Controller('auth')
@ApiBadRequestResponse({ type: ApiResponse })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({ type: ApiResponse })
  @ApiUnauthorizedResponse({ type: ApiResponse })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginResponse = await this.authService.login(loginDto);

    return ResponseHelper.ok(res, loginResponse, 'Login successful');
  }

  @ApiCreatedResponse({ type: ApiResponse<{ id: string }> })
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.authService.register(createUserDto);

    return ResponseHelper.created(
      res,
      `/users/${userId}`,
      { id: userId },
      'User registered successfully',
    );
  }

  @ApiOkResponse({ type: ApiResponse })
  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.resetPassword(resetPasswordDto);

    return ResponseHelper.defaultOk(res, 'Password reset successfully');
  }

  @ApiOkResponse({ type: ApiResponse })
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.forgotPassword(forgotPasswordDto);

    return ResponseHelper.defaultOk(res, 'Password reset email sent');
  }

  @ApiOkResponse({ type: ApiResponse })
  @Post('resend-otp')
  async resendOtp(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.resendOtp(forgotPasswordDto);

    return ResponseHelper.defaultOk(res, 'OTP resent successfully');
  }
}
