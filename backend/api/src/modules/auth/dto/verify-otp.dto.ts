import { IsString, IsUUID, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsUUID()
  userId: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}

export class VerifyOtpResponseDto {
  verified: boolean;
  message: string;
}
