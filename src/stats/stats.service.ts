import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from '../user/schemas/user.schema';
import { Project, ProjectStatus } from '../project/schemas/project.schema';
import { Payment, PaymentStatus } from '../payment/schemas/payment.schema';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    
  ) {}

  async getAdminStats() {
    const [
      totalUsers,
      totalProjects,
      activeProjects,
      totalRaisedResult,
      
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.projectModel.countDocuments(),
      this.projectModel.countDocuments({ status: ProjectStatus.ONGOING }),
      this.paymentModel.aggregate([
        { $match: { status: PaymentStatus.PAID } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    
    ]);

    const totalRaised = totalRaisedResult[0]?.total || 0;

    return {
      totalUsers,
      totalProjects,
      activeProjects,
      totalRaised,
    
      // Mapping to frontend expected keys if necessary
      projectsActive: activeProjects,
      totalInvested: totalRaised,
      membersCount: totalUsers,
      
    };
  }

  async getUserStats(userId: string) {
    const [
      myInvestmentsResult,
    
    
    ] = await Promise.all([
      this.paymentModel.aggregate([
        { $match: { userId: new Types.ObjectId(userId), status: PaymentStatus.PAID } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    
      
    ]);

    const myInvestments = myInvestmentsResult[0]?.total || 0;

    return {
      totalInvested: myInvestments,
      myInvestments,
   
    };
  }
}
