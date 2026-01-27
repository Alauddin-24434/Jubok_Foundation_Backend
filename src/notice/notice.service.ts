import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notice } from './schemas/notice.schemas';
import { CreateNoticeDto } from './dto/create-notice.dto';

@Injectable()
export class NoticeService {
  constructor(
    @InjectModel(Notice.name)
    private readonly noticeModel: Model<Notice>,
  ) {}

  async createNotice(createNoticeDto: CreateNoticeDto, userId: string) {
    // duplicate check (same title same day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const exists = await this.noticeModel.findOne({
      title: createNoticeDto.title,
      date: { $gte: startOfDay, $lte: endOfDay },
      isActive: true,
    });

    if (exists) {
      throw new ConflictException('Notice already exists today');
    }

    const notice = new this.noticeModel({
      ...createNoticeDto,
      submitBy: userId,
    });

    return notice.save();
  }

  async findAll() {
    return this.noticeModel
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }
}
