import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JoinRequest, JoinRequestStatus } from './schemas/join-request.schema';
import { Member, MemberPosition } from '../member/schemas/member.schema';
import { CreateJoinRequestDto } from './dto/create-join-request.dto';
import { ReviewJoinRequestDto } from './dto/review-join-request.dto';
import { ProjectService } from '../project/project.service';

@Injectable()
export class JoinRequestService {
  constructor(
    @InjectModel(JoinRequest.name)
    private joinRequestModel: Model<JoinRequest>,
    @InjectModel(Member.name) private memberModel: Model<Member>,
    private projectService: ProjectService,
  ) {}

  async create(createJoinRequestDto: CreateJoinRequestDto, userId: string) {
    const { projectId, message } = createJoinRequestDto;

    // Check if project exists
    await this.projectService.findOne(projectId);

    // Check if already a member
    const existingMember = await this.memberModel
      .findOne({ userId, projectId })
      .exec();

    if (existingMember) {
      throw new ConflictException('You are already a member of this project');
    }

    // Check if already has a pending request
    const existingRequest = await this.joinRequestModel
      .findOne({
        userId,
        projectId,
        status: JoinRequestStatus.PENDING,
      })
      .exec();

    if (existingRequest) {
      throw new ConflictException(
        'You already have a pending request for this project',
      );
    }

    const joinRequest = new this.joinRequestModel({
      userId,
      projectId,
      message,
    });

    return joinRequest.save();
  }

  async findByProject(projectId: string, status?: JoinRequestStatus) {
    const filter: any = { projectId };
    if (status) {
      filter.status = status;
    }

    return this.joinRequestModel
      .find(filter)
      .populate('userId', 'name email avatar')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string) {
    return this.joinRequestModel
      .find({ userId })
      .populate('projectId', 'name thumbnail status')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async review(
    requestId: string,
    reviewDto: ReviewJoinRequestDto,
    reviewerId: string,
  ) {
    const request = await this.joinRequestModel.findById(requestId).exec();

    if (!request) {
      throw new NotFoundException('Join request not found');
    }

    if (request.status !== JoinRequestStatus.PENDING) {
      throw new BadRequestException('This request has already been reviewed');
    }

    request.status = reviewDto.status;
    request.reviewedBy = reviewerId as any;
    request.reviewedAt = new Date();
    request.reviewNote = reviewDto.reviewNote || '';

    await request.save();

    // If approved, create member record
    if (reviewDto.status === JoinRequestStatus.APPROVED) {
      const member = new this.memberModel({
        userId: request.userId,
        projectId: request.projectId,
        position: MemberPosition.MEMBER,
      });

      await member.save();

      // Update project member count
      await this.projectService.updateMemberCount(
        request.projectId.toString(),
        1,
      );
    }

    return request;
  }
}
