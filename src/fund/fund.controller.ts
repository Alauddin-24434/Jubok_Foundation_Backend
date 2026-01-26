import { Controller, Post, Get, Body, UseGuards, Request, Query } from '@nestjs/common';
import { FundService } from './fund.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';

@Controller('funds')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FundController {
  constructor(private readonly fundService: FundService) {}

  @Post('transaction')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  addTransaction(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    return this.fundService.addTransaction(createTransactionDto, req.user._id);
  }

  @Get('summary')
  getSummary() {
    return this.fundService.getSummary();
  }

  @Get('history')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR)
  getHistory(@Query('limit') limit: number) {
    return this.fundService.getHistory(limit);
  }
}
