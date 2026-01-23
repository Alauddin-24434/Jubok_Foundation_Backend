import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../user/schemas/user.schema';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @UseGuards(AuthGuard('jwt'))
  initiatePayment(
    @Body() initiatePaymentDto: InitiatePaymentDto,
    @Request() req,
  ) {
    return this.paymentService.initiatePayment(
      initiatePaymentDto,
      req.user._id,
      req.user,
    );
  }

  @Post('success')
  handleSuccess(@Body() body: any, @Query() query: any) {
    const transactionId = query.tran_id || body.tran_id;
    return this.paymentService.handleSuccess(transactionId, body);
  }

  @Post('fail')
  handleFail(@Query() query: any) {
    const transactionId = query.tran_id;
    return this.paymentService.handleFail(transactionId);
  }

  @Post('cancel')
  handleCancel(@Query() query: any) {
    const transactionId = query.tran_id;
    return this.paymentService.handleFail(transactionId);
  }

  @Get('my-payments')
  @UseGuards(AuthGuard('jwt'))
  findMyPayments(@Request() req) {
    return this.paymentService.findByUser(req.user._id);
  }

  @Get('project/:projectId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR)
  findByProject(@Param('projectId') projectId: string) {
    return this.paymentService.findByProject(projectId);
  }
}
