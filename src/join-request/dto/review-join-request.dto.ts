import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { JoinRequestStatus } from '../schemas/join-request.schema';

export class ReviewJoinRequestDto {
  @IsNotEmpty()
  @IsEnum(JoinRequestStatus)
  status: JoinRequestStatus;

  @IsOptional()
  @IsString()
  reviewNote?: string;
}
