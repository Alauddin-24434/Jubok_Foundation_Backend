import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { FundService } from './fund.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { CreateFundTransactionDto } from './dto/create-transaction.dto';

@ApiTags('Funds')
@ApiBearerAuth()
@Controller('funds')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FundController {
  constructor(private readonly fundService: FundService) {}

  @Post('transaction')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  addTransaction(
    @Body() createFundTransactionDto: CreateFundTransactionDto,
    @Request() req,
  ) {
    return this.fundService.addTransaction(
      createFundTransactionDto,
      req.user._id,
    );
  }

  @Get('summary')
  getSummary() {
    return this.fundService.getSummary();
  }

  @Get('history')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getHistory(@Query('limit') limit: number) {
    return this.fundService.getHistory(limit);
  }
}
