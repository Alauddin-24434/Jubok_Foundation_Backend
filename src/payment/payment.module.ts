import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { SslcommerzService } from './services/sslcommerz.service';

import { User, UserSchema } from '../user/schemas/user.schema';
import { FundModule } from 'src/fund/fund.module';
import {
  FundTransaction,
  FundTransactionSchema,
} from 'src/fund/schemas/fund-transaction.schema';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: FundTransaction.name, schema: FundTransactionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    FundModule,
       SocketModule,
    
  ],
  controllers: [PaymentController],
  providers: [PaymentService, SslcommerzService],
  exports: [PaymentService],
})
export class PaymentModule {}
