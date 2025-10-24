import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserDto;
}

export class UserDto {
  id: string;
  email: string;
  phone?: string;
  role: string;
  verified: boolean;
  createdAt: Date;
}
