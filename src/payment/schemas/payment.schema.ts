import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PaymentMethod {
  CASH = 'CASH',
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  BANK = 'BANK',
  CARD = 'CARD',
}

export enum PaymentStatus {
  INITIATED = 'INITIATED',
  PENDING = 'PENDING',

  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentPurpose {
  MONTHLY = 'MONTHLY',
  ACCOUNT_ACTIVATION = 'ACCOUNT_ACTIVATION',
  ONE_TIME = 'ONE_TIME',
}

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ type: String, enum: PaymentMethod, required: true })
  method: PaymentMethod;

  @Prop({ type: String, enum: PaymentPurpose, required: true })
  purpose: PaymentPurpose;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  // bkash trx / nagad trx / bank ref / gateway trx
  @Prop({ trim: true })
  transactionId?: string;

  // manual payment sender number
  @Prop({ trim: true })
  senderNumber?: string;

  @Prop({ trim: true })
  invoiceNumber?: string;

  @Prop()
  paidAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  // ❌ REJECTION INFO (NEW)
  @Prop({ trim: true })
  rejectReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  rejectedBy?: Types.ObjectId;

  @Prop()
  approvedAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ userId: 1, createdAt: -1 });
