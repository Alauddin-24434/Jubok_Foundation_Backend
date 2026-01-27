import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateManagementDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsDateString()
  @IsNotEmpty()
  startAt: string;

  @IsDateString()
  @IsOptional()
  endAt?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
