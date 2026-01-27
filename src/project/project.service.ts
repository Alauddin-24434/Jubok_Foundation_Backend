import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectStatus } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const project = new this.projectModel({
      ...createProjectDto,
      createdBy: userId,
    });

    return project.save();
  }

  async findAll(query?: {
    search?: string;
    status?: ProjectStatus;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, status, category, page = 1, limit = 10 } = query || {};
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.projectModel
        .find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.projectModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const project = await this.projectModel
      .findById(id)
      .populate('createdBy', 'name email avatar')
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const project = await this.findOne(id);

    // Only creator or super admin can update
    if (project.createdBy._id.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this project',
      );
    }

    Object.assign(project, updateProjectDto);
    return project.save();
  }

  async remove(id: string, userId: string) {
    const project = await this.findOne(id);

    // Only creator or super admin can delete
    if (project.createdBy._id.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this project',
      );
    }

    return this.projectModel.findByIdAndDelete(id).exec();
  }

  async updateMemberCount(projectId: string, increment: number) {
    return this.projectModel
      .findByIdAndUpdate(
        projectId,
        { $inc: { memberCount: increment } },
        { new: true },
      )
      .exec();
  }

  async updateTotalInvestment(projectId: string, amount: number) {
    return this.projectModel
      .findByIdAndUpdate(
        projectId,
        { $inc: { totalInvestment: amount } },
        { new: true },
      )
      .exec();
  }
}
