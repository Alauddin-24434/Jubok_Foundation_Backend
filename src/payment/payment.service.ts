import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';

import { Payment, PaymentStatus } from './schemas/payment.schema';

import {
  FundTransaction,
  TransactionType,
} from '../fund/schemas/fund-transaction.schema';

import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { User, UserRole, UserStatus } from '../user/schemas/user.schema';
import { AppGateway } from 'src/socket/socket.gateway';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<Payment>,

    @InjectModel(FundTransaction.name)
    private readonly fundModel: Model<FundTransaction>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectConnection()
    private readonly connection: Connection,
    private readonly gateway: AppGateway
  ) {}

  // ===============================
  // USER → INITIATE PAYMENT
  // ===============================
  async initiatePayment(userId: Types.ObjectId, dto: InitiatePaymentDto) {
    if (!dto.transactionId) {
      throw new BadRequestException('Transaction ID is required');
    }

    const exists = await this.paymentModel.findOne({
      transactionId: dto.transactionId,
    });

    if (exists) {
      throw new BadRequestException('Transaction already used');
    }

    const payment = await this.paymentModel.create({
      userId,
      amount: dto.amount,
      method: dto.method,
      purpose: dto.purpose,
      transactionId: dto.transactionId,
      status: PaymentStatus.PENDING,
      senderNumber: dto.senderNumber,
    });

 

    return {
      message:
        'Payment initiated successfully. Waiting for admin confirmation.',
      paymentId: payment._id,
    };
  }

  // ===============================
  // ADMIN → APPROVE PAYMENT
  // ===============================
  async approvePayment(paymentId: string, adminId: Types.ObjectId) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const payment = await this.paymentModel
        .findById(paymentId)
        .session(session);

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException('Payment already processed');
      }

      // 🔢 Get last balance
      const lastTx = await this.fundModel
        .findOne()
        .sort({ createdAt: -1 })
        .session(session);

      const previousBalance = lastTx?.balanceSnapshot || 0;
      const newBalance = previousBalance + payment.amount;

      // 🧾 Generate invoice
      const invoiceNumber = this.generateInvoiceNumber();

      // ✅ Update payment
      payment.status = PaymentStatus.PAID;
      payment.paidAt = new Date();
      payment.invoiceNumber = invoiceNumber;
      await payment.save({ session });

      // 💰 Create fund transaction
      await this.fundModel.create(
        [
          {
            type: TransactionType.INCOME,
            amount: payment.amount,
            reason: `Payment approved (${payment.purpose})`,
            balanceSnapshot: newBalance,
            paymentId: payment._id,
            createdBy: adminId,
          },
        ],
        { session },
      );

      // 👤 ACTIVATE USER (🔥 NEW PART)
      await this.userModel.updateOne(
        { _id: payment.userId },
        { $set: { status: UserStatus.ACTIVE, role: UserRole.MEMBER } },
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return {
        message: 'Payment approved successfully',
        invoiceNumber,
        balance: newBalance,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async getPayments(query: any) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    // 🔍 search by name, email, phone (user)
    if (search) {
      filter.$or = [
        { 'userId.name': { $regex: search, $options: 'i' } },
        { 'userId.email': { $regex: search, $options: 'i' } },
        { 'userId.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const payments = await this.paymentModel
      .find(filter)
      .populate('userId', 'name email phone')
      .populate('approvedBy', 'name role')
      .populate('rejectedBy', 'name role')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await this.paymentModel.countDocuments(filter);

    return {
      data: payments,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ===============================
  // INVOICE GENERATOR
  // ===============================
  private generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `INV-${year}-${random}`;
  }
}
