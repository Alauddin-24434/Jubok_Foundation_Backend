import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { SslcommerzService } from './services/sslcommerz.service';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    ProjectModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, SslcommerzService],
  exports: [PaymentService],
})
export class PaymentModule {}
