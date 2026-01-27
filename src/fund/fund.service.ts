import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FundTransaction, TransactionType } from './schemas/fund-transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class FundService {
  constructor(
    @InjectModel(FundTransaction.name) private fundModel: Model<FundTransaction>,
  ) {}

  async addTransaction(createTransactionDto: CreateTransactionDto, userId: string) {
    const { type, amount, reason, date } = createTransactionDto;

    // Get current balance
    const lastTransaction = await this.fundModel.findOne().sort({ date: -1, createdAt: -1 });
    const currentBalance = lastTransaction ? lastTransaction.balanceSnapshot : 0;

    // Calculate new balance
    let newBalance = currentBalance;
    if (type === TransactionType.INCOME) {
      newBalance += amount;
    } else {
      newBalance -= amount;
    }

    const transaction = new this.fundModel({
      type,
      amount,
      reason,
      date: date ? new Date(date) : new Date(),
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
              $cond: [{ $eq: ['$type', TransactionType.EXPENSE] }, '$amount', 0],
            },
          },
        },
      },
    ]);

    const lastTransaction = await this.fundModel.findOne().sort({ date: -1, createdAt: -1 });
    const currentBalance = lastTransaction ? lastTransaction.balanceSnapshot : 0;

    if (!result.length) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        currentBalance: 0,
      };
    }
    console.log({
       totalIncome: result[0].totalIncome,
      totalExpense: result[0].totalExpense,
      currentBalance,
    })

    return {
      totalIncome: result[0].totalIncome,
      totalExpense: result[0].totalExpense,
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
