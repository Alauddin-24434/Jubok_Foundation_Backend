import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../schemas/payment.schema';

export class InitiatePaymentDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
