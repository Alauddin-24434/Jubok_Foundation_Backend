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

  // 🔗 REAL RELATION WITH PAYMENT
  @Prop({ type: Types.ObjectId, ref: 'Payment', required: true })
  paymentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

// ✅ CREATE SCHEMA
export const FundTransactionSchema =
  SchemaFactory.createForClass(FundTransaction);

// ✅ UNIQUE INDEX (VERY IMPORTANT)
FundTransactionSchema.index(
  { paymentId: 1 },
  { unique: true }
);

// optional but recommended
FundTransactionSchema.index({ createdAt: -1 });
