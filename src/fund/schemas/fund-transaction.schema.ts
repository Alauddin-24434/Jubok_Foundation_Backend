import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

@Schema({ timestamps: true })
export class FundTransaction extends Document {
  @Prop({ type: String, enum: TransactionType, required: true })
  type: TransactionType;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, trim: true })
  reason: string;

  @Prop({ required: true })
  balanceSnapshot: number;

  // 🧾 Evidence images (receipts, bills, vouchers)
  @Prop({ type: [String], default: [] })
  evidenceImages: string[];

  // 🔗 REAL RELATION WITH PAYMENT
  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  paymentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

// ✅ CREATE SCHEMA
export const FundTransactionSchema =
  SchemaFactory.createForClass(FundTransaction);
