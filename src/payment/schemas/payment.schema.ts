import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PaymentMethod {
  BKASH = 'bkash',
  NAGAD = 'nagad',
  BANK = 'bank',
  CARD = 'card',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentType {
  MEMBERSHIP = 'membership',
  PROJECT = 'project',
}

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: false })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: String, enum: PaymentMethod, required: true })
  method: PaymentMethod;

  @Prop({ type: String, enum: PaymentType, default: PaymentType.PROJECT })
  type: PaymentType;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ default: null })
  transactionId: string;

  @Prop({ default: null })
  bkashNumber: string;

  @Prop({ default: null })
  gatewayTransactionId: string;

  @Prop({ default: null })
  bankTranId: string;

  @Prop({ type: Object, default: {} })
  gatewayResponse: Record<string, any>;

  @Prop({ default: null })
  paidAt: Date;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: null })
  invoiceNumber: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Index for efficient queries
PaymentSchema.index({ userId: 1, projectId: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
