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

  async findAll(): Promise<Management[]> {
    return this.managementModel.find().populate('userId').exec();
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
