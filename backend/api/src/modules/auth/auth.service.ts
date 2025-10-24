import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { LoginDto, LoginResponseDto, UserDto } from './dto/login.dto';
import { VerifyOtpDto, VerifyOtpResponseDto } from './dto/verify-otp.dto';
import { RefreshTokenDto, RefreshTokenResponseDto } from './dto/refresh-token.dto';
import { PrismaService } from '../../common/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private otpStore: Map<string, string> = new Map();

  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          ...(dto.phone ? [{ phone: dto.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or phone already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: 'CUSTOMER',
      },
    });
    
    this.otpStore.set(user.id, otp);

    return {
      userId: user.id,
      message: `OTP sent to ${dto.phone || dto.email}`,
      otpExpiresIn: 300,
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    const storedOtp = this.otpStore.get(dto.userId);
    if (!storedOtp || storedOtp !== dto.otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.otpStore.delete(dto.userId);

    return {
      verified: true,
      message: 'Account verified successfully',
    };
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
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

  async getMe(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toUserDto(user);
  }

  async refreshToken(dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    const newAccessToken = `access_${randomUUID()}`;

    return {
      accessToken: newAccessToken,
      expiresIn: 3600,
    };
  }

  private toUserDto(user: any): UserDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verified: true,
      createdAt: user.createdAt,
    };
  }
}
