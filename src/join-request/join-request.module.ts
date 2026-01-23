import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JoinRequestService } from './join-request.service';
import { JoinRequestController } from './join-request.controller';
import {
  JoinRequest,
  JoinRequestSchema,
} from './schemas/join-request.schema';
import { Member, MemberSchema } from '../member/schemas/member.schema';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JoinRequest.name, schema: JoinRequestSchema },
      { name: Member.name, schema: MemberSchema },
    ]),
    ProjectModule,
  ],
  controllers: [JoinRequestController],
  providers: [JoinRequestService],
  exports: [JoinRequestService],
})
export class JoinRequestModule {}
