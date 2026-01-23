import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum MemberPosition {
  PRESIDENT = 'President',
  SECRETARY = 'Secretary',
  TREASURER = 'Treasurer',
  MEMBER = 'Member',
}

@Schema({ timestamps: true })
export class Member extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: String, enum: MemberPosition, default: MemberPosition.MEMBER })
  position: MemberPosition;

  @Prop({ default: Date.now })
  joinedAt: Date;

  @Prop({ default: 0 })
  totalContribution: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const MemberSchema = SchemaFactory.createForClass(Member);

// Compound index to prevent duplicate memberships
MemberSchema.index({ userId: 1, projectId: 1 }, { unique: true });
MemberSchema.index({ projectId: 1, position: 1 });
