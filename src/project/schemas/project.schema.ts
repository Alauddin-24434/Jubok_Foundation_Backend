import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ProjectStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  EXPIRED = 'expired',
}

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  thumbnail: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  videos: string[];

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: '' })
  notice: string;

  @Prop({ type: String, enum: ProjectStatus, default: ProjectStatus.UPCOMING })
  status: ProjectStatus;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: 0 })
  memberCount: number;

  @Prop({ default: 0 })
  totalInvestment: number;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Middleware to update status based on dates
ProjectSchema.pre('save', function (next: Function) {
  const now = new Date();

  if (this.startDate > now) {
    this.status = ProjectStatus.UPCOMING;
  } else if (this.endDate < now) {
    this.status = ProjectStatus.EXPIRED;
  } else {
    this.status = ProjectStatus.ONGOING;
  }

  next();
});

// Index for efficient queries
ProjectSchema.index({ status: 1, startDate: -1 });
ProjectSchema.index({ createdBy: 1 });
