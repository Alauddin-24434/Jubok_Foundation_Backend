import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  IsOptional,
} from 'class-validator';
import { PaymentMethod, PaymentType } from '../schemas/payment.schema';

export class InitiatePaymentDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentType)
  type?: PaymentType;

  @IsOptional()
  @IsString()
  description?: string;
}
