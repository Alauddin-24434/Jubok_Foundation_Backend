import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { PaymentMethod, PaymentPurpose } from '../schemas/payment.schema';

export class InitiatePaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsEnum(PaymentPurpose)
  purpose: PaymentPurpose;

  // manual payments only
  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  senderNumber?: string;
}
