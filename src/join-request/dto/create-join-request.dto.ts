import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateJoinRequestDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  message?: string;
}
