import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  thumbnail: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  intialInvestment: number;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @IsNumber()
  totalInvestment?: number;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  contactNumber: string;

  @IsOptional()
  @IsArray()
  members?: any[];
}
