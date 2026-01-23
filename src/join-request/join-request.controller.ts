import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JoinRequestService } from './join-request.service';
import { CreateJoinRequestDto } from './dto/create-join-request.dto';
import { ReviewJoinRequestDto } from './dto/review-join-request.dto';
import { JoinRequestStatus } from './schemas/join-request.schema';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../user/schemas/user.schema';

@Controller('join-requests')
@UseGuards(AuthGuard('jwt'))
export class JoinRequestController {
  constructor(private readonly joinRequestService: JoinRequestService) {}

  @Post()
  create(@Body() createJoinRequestDto: CreateJoinRequestDto, @Request() req) {
    return this.joinRequestService.create(createJoinRequestDto, req.user._id);
  }

  @Get('my-requests')
  findMyRequests(@Request() req) {
    return this.joinRequestService.findByUser(req.user._id);
  }

  @Get('project/:projectId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR)
  findByProject(
    @Param('projectId') projectId: string,
    @Query('status') status?: JoinRequestStatus,
  ) {
    return this.joinRequestService.findByProject(projectId, status);
  }

  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR)
  review(
    @Param('id') id: string,
    @Body() reviewDto: ReviewJoinRequestDto,
    @Request() req,
  ) {
    return this.joinRequestService.review(id, reviewDto, req.user._id);
  }
}
