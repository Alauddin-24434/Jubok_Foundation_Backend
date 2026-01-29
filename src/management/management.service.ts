import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Management } from './schemas/management.schema';
import { CreateManagementDto } from './dto/create-management.dto';
import { UpdateManagementDto } from './dto/update-management.dto';

@Injectable()
export class ManagementService {
  constructor(
    @InjectModel(Management.name)
    private readonly managementModel: Model<Management>,
  ) {}

  async create(createManagementDto: CreateManagementDto): Promise<Management> {
    const createdManagement = new this.managementModel(createManagementDto);
    return createdManagement.save();
  }

  // management.service.ts
  async findAll({
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search,
  }: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    search?: string;
  }): Promise<{
    data: Management[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPage: number;
    };
  }> {
    const skip = (page - 1) * limit;

    // 🔍 Search condition
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // ↕️ Sorting
    const sortCondition: any = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [data, total] = await Promise.all([
      this.managementModel
        .find(query)
        .populate('userId')
        .sort(sortCondition)
        .skip(skip)
        .limit(limit)
        .exec(),

      this.managementModel.countDocuments(query),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Management> {
    const management = await this.managementModel
      .findById(id)
      .populate('userId')
      .exec();
    if (!management) {
      throw new NotFoundException(`Management record with ID ${id} not found`);
    }
    return management;
  }

  async update(
    id: string,
    updateManagementDto: UpdateManagementDto,
  ): Promise<Management> {
    const updatedManagement = await this.managementModel
      .findByIdAndUpdate(id, updateManagementDto, { new: true })
      .exec();
    if (!updatedManagement) {
      throw new NotFoundException(`Management record with ID ${id} not found`);
    }
    return updatedManagement;
  }

  async remove(id: string): Promise<Management> {
    const deletedManagement = await this.managementModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedManagement) {
      throw new NotFoundException(`Management record with ID ${id} not found`);
    }
    return deletedManagement;
  }
}
