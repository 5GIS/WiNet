import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  TECHNICIAN = 'technician',
  MERCHANT = 'merchant',
  CUSTOMER = 'customer',
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(UserRole)
  role: UserRole;
}

export class RegisterResponseDto {
  userId: string;
  message: string;
  otpExpiresIn: number;
}
