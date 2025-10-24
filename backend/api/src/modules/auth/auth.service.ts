import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { LoginDto, LoginResponseDto, UserDto } from './dto/login.dto';
import { VerifyOtpDto, VerifyOtpResponseDto } from './dto/verify-otp.dto';
import { RefreshTokenDto, RefreshTokenResponseDto } from './dto/refresh-token.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private users: Map<string, any> = new Map();
  private otpStore: Map<string, string> = new Map();

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    if (Array.from(this.users.values()).some(u => u.email === dto.email)) {
      throw new ConflictException('Email already in use');
    }

    const userId = randomUUID();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    this.users.set(userId, {
      id: userId,
      ...dto,
      verified: false,
      createdAt: new Date(),
    });
    
    this.otpStore.set(userId, otp);

    return {
      userId,
      message: `OTP sent to ${dto.phone || dto.email}`,
      otpExpiresIn: 300,
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    const storedOtp = this.otpStore.get(dto.userId);
    if (!storedOtp || storedOtp !== dto.otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const user = this.users.get(dto.userId);
    if (user) {
      user.verified = true;
    }

    this.otpStore.delete(dto.userId);

    return {
      verified: true,
      message: 'Account verified successfully',
    };
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = Array.from(this.users.values()).find(u => u.email === dto.email);
    
    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.verified) {
      throw new UnauthorizedException('Account not verified');
    }

    const accessToken = `access_${randomUUID()}`;
    const refreshToken = `refresh_${randomUUID()}`;

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user: this.toUserDto(user),
    };
  }

  async getProfile(userId: string): Promise<UserDto> {
    const user = this.users.get(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.toUserDto(user);
  }

  async refreshToken(dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    if (!dto.refreshToken.startsWith('refresh_')) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      accessToken: `access_${randomUUID()}`,
      expiresIn: 3600,
    };
  }

  private toUserDto(user: any): UserDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verified: user.verified,
      createdAt: user.createdAt,
    };
  }
}
