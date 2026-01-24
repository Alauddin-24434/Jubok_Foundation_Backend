import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UnauthorizedException,
  Get,
  UseGuards,
  Request as ReqDecorator,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
export interface JwtUser {
  _id: string;
  email: string;
  role: string;
  permissions?: string[];
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* ================= REGISTER ================= */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.register(registerDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // dev → false
      sameSite: 'lax', // 🔥 KEY FIX
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      message: 'Registration successful',
      data: {
        user,
        accessToken: accessToken,
      },
    };
  }

  /* ================= ME ================= */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@ReqDecorator() req: Request) {
    console.log('✅ req.user:', req.user);

    const user = req.user as JwtUser;

    const userId = user._id; // ✅ NO TS ERROR

    return this.authService.validateUser(userId);
  }

  /* ================= LOGIN ================= */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.login(loginDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // dev → false
      sameSite: 'lax', // 🔥 KEY FIX
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      message: 'Login successful',
      data: {
        user,
        accessToken: accessToken,
      },
    };
  }

  /* ================= REFRESH TOKEN ================= */
  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) _res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const { accessToken, user } =
      await this.authService.refreshAccessToken(refreshToken);

    return {
      success: true,
      data: {
        user,
        accessToken: accessToken,
      },
    };
  }
}
