import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ManagementService } from './management.service';
import { CreateManagementDto } from './dto/create-management.dto';
import { UpdateManagementDto } from './dto/update-management.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('management')
@ApiBearerAuth()
@Controller('management')
export class ManagementController {
  constructor(private readonly managementService: ManagementService) {}

  @Post()
  create(@Body() createManagementDto: CreateManagementDto) {
    return this.managementService.create(createManagementDto);
  }

// management.controller.ts
@Get()
findAll(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @Query('sortBy') sortBy: string = 'createdAt',
  @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  @Query('search') search?: string,
) {
  return this.managementService.findAll({
    page: Number(page),
    limit: Number(limit),
    sortBy,
    sortOrder,
    search,
  });
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.managementService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateManagementDto: UpdateManagementDto,
  ) {
    return this.managementService.update(id, updateManagementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.managementService.remove(id);
  }
}
