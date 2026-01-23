import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentStatus } from './schemas/payment.schema';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { SslcommerzService } from './services/sslcommerz.service';
import { ProjectService } from '../project/project.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    private sslcommerzService: SslcommerzService,
    private projectService: ProjectService,
  ) {}

  async initiatePayment(
    initiatePaymentDto: InitiatePaymentDto,
    userId: string,
    userDetails: any,
  ) {
    const { projectId, amount, method } = initiatePaymentDto;

    // Verify project exists
    const project = await this.projectService.findOne(projectId);

    // Create payment record
    const transactionId = `TXN-${Date.now()}-${uuidv4().substring(0, 8)}`;

    const payment = new this.paymentModel({
      userId,
      projectId,
      amount,
      method,
      transactionId,
      description: `Investment for ${project.name}`,
    });

    await payment.save();

    // Initiate SSLCommerz payment
    const paymentData = {
      transactionId,
      amount,
      productName: `Investment: ${project.name}`,
      customerName: userDetails.name,
      customerEmail: userDetails.email,
      customerPhone: userDetails.phone,
      customerAddress: userDetails.address,
      customerCity: 'Dhaka',
    };

    const gatewayResponse = await this.sslcommerzService.initiatePayment(
      paymentData,
    );

    // Update payment with gateway response
    payment.gatewayResponse = gatewayResponse;
    await payment.save();

    return {
      payment,
      gatewayUrl: gatewayResponse.GatewayPageURL,
    };
  }

  async handleSuccess(transactionId: string, gatewayData: any) {
    const payment = await this.paymentModel
      .findOne({ transactionId })
      .exec();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Validate with SSLCommerz
    const validation = await this.sslcommerzService.validatePayment(
      gatewayData.val_id,
    );

    if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
      payment.status = PaymentStatus.PAID;
      payment.paidAt = new Date();
      payment.gatewayTransactionId = gatewayData.tran_id;
      payment.bankTranId = gatewayData.bank_tran_id;
      payment.gatewayResponse = { ...payment.gatewayResponse, validation };

      await payment.save();

      // Update project total investment
      await this.projectService.updateTotalInvestment(
        payment.projectId.toString(),
        payment.amount,
      );
    }

    return payment;
  }

  async handleFail(transactionId: string) {
    const payment = await this.paymentModel
      .findOne({ transactionId })
      .exec();

    if (payment) {
      payment.status = PaymentStatus.FAILED;
      await payment.save();
    }

    return payment;
  }

  async findByUser(userId: string) {
    return this.paymentModel
      .find({ userId })
      .populate('projectId', 'name thumbnail')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByProject(projectId: string) {
    return this.paymentModel
      .find({ projectId, status: PaymentStatus.PAID })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }
}
