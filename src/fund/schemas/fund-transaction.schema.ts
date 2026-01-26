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

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop({ required: true })
  balanceSnapshot: number; // Balance AFTER this transaction

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const FundTransactionSchema = SchemaFactory.createForClass(FundTransaction);

// Index for getting recent history efficiently
FundTransactionSchema.index({ date: -1 });
