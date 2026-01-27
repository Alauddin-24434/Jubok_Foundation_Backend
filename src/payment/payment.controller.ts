import {
  Controller,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';

import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../user/schemas/user.schema';
import { PaymentStatus } from './schemas/payment.schema';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ===============================
  // USER → INITIATE PAYMENT
  // ===============================
  @Post('initiate')
  @UseGuards(AuthGuard('jwt'))
  initiatePayment(@Body() dto: InitiatePaymentDto, @Request() req) {
    return this.paymentService.initiatePayment(req.user._id, dto);
  }

  // 🔐 ADMIN / SUPER ADMIN / MODERATOR
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  getPayments(@Query() query: any) {
    return this.paymentService.getPayments(query);
  }

  // ===============================
  // ADMIN → APPROVE PAYMENT
  // ===============================
  @Patch(':id/approve')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  approvePayment(@Param('id') paymentId: string, @Request() req) {
    return this.paymentService.approvePayment(
      paymentId,
      req.user._id, // admin id
    );
  }
}
