import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FundTransaction,
  TransactionType,
} from './schemas/fund-transaction.schema';
import { CreateFundTransactionDto } from './dto/create-transaction.dto';

interface FundAggregateResult {
  totalIncome: number;
  totalExpense: number;
}

@Injectable()
export class FundService {
  constructor(
    @InjectModel(FundTransaction.name)
    private fundModel: Model<FundTransaction>,
  ) {}

  async addTransaction(
    createFundTransactionDto: CreateFundTransactionDto,
    userId: string,
  ) {
    const {
      type,
      amount,
      reason,
      evidenceImages = [],
    } = createFundTransactionDto;

    // 1️⃣ Get current balance (last transaction)
    const lastTransaction = await this.fundModel
      .findOne()
      .sort({ createdAt: -1 });

    const currentBalance = lastTransaction
      ? lastTransaction.balanceSnapshot
      : 0;

    // 2️⃣ Calculate new balance
    let newBalance = currentBalance;

    if (type === TransactionType.INCOME) {
      newBalance += amount;
    } else {
      newBalance -= amount;
    }

    // ❗ Optional safety: prevent negative balance
    if (newBalance < 0) {
      throw new BadRequestException('Insufficient fund balance');
    }

    // 3️⃣ Create transaction
    const transaction = new this.fundModel({
      type,
      amount,
      reason,
      evidenceImages, // ✅ added
      balanceSnapshot: newBalance,
      createdBy: userId,
    });

    return transaction.save();
  }

  async getSummary() {
    const result = await this.fundModel.aggregate([
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', TransactionType.INCOME] }, '$amount', 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [
                { $eq: ['$type', TransactionType.EXPENSE] },
                '$amount',
                0,
              ],
            },
          },
        },
      },
    ]);

    const lastTransaction = await this.fundModel
      .findOne()
      .sort({ date: -1, createdAt: -1 });
    const currentBalance = lastTransaction
      ? lastTransaction.balanceSnapshot
      : 0;

    if (!result.length) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        currentBalance: 0,
      };
    }
    const aggregateData = (result as FundAggregateResult[])[0];
    console.log({
      totalIncome: aggregateData.totalIncome,
      totalExpense: aggregateData.totalExpense,
      currentBalance,
    });

    return {
      totalIncome: aggregateData.totalIncome,
      totalExpense: aggregateData.totalExpense,
      currentBalance,
    };
  }

  async getHistory(limit = 20) {
    return this.fundModel
      .find()
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .populate('createdBy', 'name email')
      .exec();
  }
}
