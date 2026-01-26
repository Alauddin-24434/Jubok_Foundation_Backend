import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyPaymentDto {
  @IsNotEmpty()
  @IsString()
  @Length(11, 14) // Bkash numbers are usually 11 digits
  bkashNumber: string;

  @IsNotEmpty()
  @IsString()
  transactionId: string;
}
