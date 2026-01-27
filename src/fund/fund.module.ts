import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FundController } from './fund.controller';
import { FundService } from './fund.service';
import {
  FundTransaction,
  FundTransactionSchema,
} from './schemas/fund-transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FundTransaction.name, schema: FundTransactionSchema },
    ]),
  ],
  controllers: [FundController],
  providers: [FundService],
  exports: [FundService, MongooseModule],
})
export class FundModule {}
