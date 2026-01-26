import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentStatus, PaymentMethod, PaymentType } from './schemas/payment.schema';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { SslcommerzService } from './services/sslcommerz.service';
import { ProjectService } from '../project/project.service';
import { v4 as uuidv4 } from 'uuid';
import { User, UserStatus } from '../user/schemas/user.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(User.name) private userModel: Model<User>,
    private sslcommerzService: SslcommerzService,
    private projectService: ProjectService,
  ) {}

  // ... existing initiatePayment method ...

  async verifyMembershipPayment(
    verifyPaymentDto: VerifyPaymentDto,
    userId: string,
  ) {
    const { bkashNumber, transactionId } = verifyPaymentDto;

    // Check for duplicate transaction ID
    const existingPayment = await this.paymentModel.findOne({ transactionId });
    if (existingPayment) {
      throw new BadRequestException('Transaction ID already submitted');
    }

    const payment = new this.paymentModel({
      userId,
      amount: 500, // Fixed membership fee
      method: PaymentMethod.BKASH,
      type: PaymentType.MEMBERSHIP,
      status: PaymentStatus.PENDING,
      bkashNumber,
      transactionId,
      description: 'Monthly Membership Due',
    });

    return payment.save();
  }

  async approvePayment(paymentId: string) {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Payment already approved');
    }

    // Approve Payment
    payment.status = PaymentStatus.PAID;
    payment.paidAt = new Date();
    await payment.save();

    // Activate User if Membership Payment
    if (payment.type === PaymentType.MEMBERSHIP) {
      await this.userModel.findByIdAndUpdate(payment.userId, {
        status: UserStatus.ACTIVE,
      });
    }

    return payment;
  }

  // ... existing handler methods ...

  async initiatePayment(
    initiatePaymentDto: InitiatePaymentDto,
    userId: string,
    userDetails: any,
  ) {
    const { projectId, amount, method, type, description } = initiatePaymentDto;

    let project: any = null;
    if (projectId) {
      // Verify project exists
      project = await this.projectService.findOne(projectId);
    }

    // Create payment record
    const transactionId = `TXN-${Date.now()}-${uuidv4().substring(0, 8)}`;

    const payment = new this.paymentModel({
      userId,
      projectId,
      amount,
      method,
      type: type || (projectId ? PaymentType.PROJECT : PaymentType.MEMBERSHIP),
      transactionId,
      description: description || (project ? `Investment for ${project.name}` : 'Monthly Membership Due'),
    });

    await payment.save();

    // Initiate SSLCommerz payment
    const paymentData = {
      transactionId,
      amount,
      productName: project ? `Investment: ${project.name}` : 'Membership Payment',
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

      // Update project total investment if it's a project payment
      if (payment.type === PaymentType.PROJECT && payment.projectId) {
        await this.projectService.updateTotalInvestment(
          payment.projectId.toString(),
          payment.amount,
        );
      }

      // Activate user if it's a membership payment
      if (payment.type === PaymentType.MEMBERSHIP) {
        await this.userModel.findByIdAndUpdate(payment.userId, {
          status: UserStatus.ACTIVE,
        });
      }
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

  async findPendingMembershipPayments() {
    return this.paymentModel
      .find({
        type: PaymentType.MEMBERSHIP,
        status: PaymentStatus.PENDING,
      })
      .populate('userId', 'name email phone avatar')
      .sort({ createdAt: -1 })
      .exec();
  }
}
