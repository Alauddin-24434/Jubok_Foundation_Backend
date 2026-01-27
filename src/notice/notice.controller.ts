import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NoticeService } from './notice.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/user/schemas/user.schema';
import { CreateNoticeDto } from './dto/create-notice.dto';

@ApiTags('Notices')
@ApiBearerAuth()
@Controller('notices')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  // ===========create notice================
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  createNotice(@Body() createNoticeDto: CreateNoticeDto, @Req() req) {
    const userId = req.user?._id;
    return this.noticeService.createNotice(createNoticeDto, userId);
  }

  // ===========get all notices================
  @Get()
  findAll() {
    return this.noticeService.findAll();
  }
}
