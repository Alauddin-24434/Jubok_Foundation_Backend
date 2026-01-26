import { IsEnum, IsNotEmpty, IsNumber, IsString, IsDateString, Min, IsOptional } from 'class-validator';
import { TransactionType } from '../schemas/fund-transaction.schema';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
