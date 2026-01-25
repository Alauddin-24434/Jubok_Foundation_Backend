import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { ProjectService } from '../project/project.service';
import { ProjectStatus } from '../project/schemas/project.schema';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('SeedProjects');
  
  try {
    const userService = app.get(UserService);
    const projectService = app.get(ProjectService);

    // 1. Find a user to assign as creator
    // We try to find the super admin created by the main seed script
    const userModel = (userService as any).userModel;
    const adminUser = await userModel.findOne({ email: 'admin@alhamdulillah.com' });

    if (!adminUser) {
      logger.error('❌ Admin user not found. Please run "npm run seed" first to create the admin user.');
      process.exit(1);
    }

    const creatorId = adminUser._id.toString();
    logger.log(`👤 Using creator: ${adminUser.name} (${creatorId})`);

    // 2. Define Dummy Projects
    const projects = [
      {
        name: 'Organic Rice Cultivation',
        category: 'Agriculture',
        status: ProjectStatus.ONGOING,
        targetAmount: 500000,
        raisedAmount: 350000,
        description: 'Large scale organic rice farming in Dinajpur using sustainable methods. Weekly updates provided.',
        location: 'Dinajpur, Bangladesh',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        thumbnail: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=2944&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1586771107445-d3ca888129ff'],
        contactNumber: '+8801711223344',
      },
      {
        name: 'Biofloc Fish Farming',
        category: 'Fish Farming',
        status: ProjectStatus.ONGOING,
        targetAmount: 300000,
        raisedAmount: 120000,
        description: 'High-density fish farming using Biofloc technology in Mymensingh. Expected ROI 20%.',
        location: 'Mymensingh, Bangladesh',
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-08-15'),
        thumbnail: 'https://images.unsplash.com/photo-1524704054469-44931d7e234e?q=80&w=2848&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1524704054469-44931d7e234e'],
        contactNumber: '+8801711223345',
      },
      {
        name: 'Halal Real Estate Tower',
        category: 'Real Estate',
        status: ProjectStatus.UPCOMING,
        targetAmount: 5000000,
        raisedAmount: 0,
        description: '10-story residential building in Uttara, Dhaka. Shariah-compliant investment model.',
        location: 'Uttara, Dhaka',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2026-05-01'),
        thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2873&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa'],
        contactNumber: '+8801711223346',
      },
      {
        name: 'Mango Orchard Expansion',
        category: 'Agriculture',
        status: ProjectStatus.EXPIRED,
        targetAmount: 200000,
        raisedAmount: 200000,
        description: 'Expansion of existing mango orchard in Rajshahi. Fully funded and operational.',
        location: 'Rajshahi, Bangladesh',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        thumbnail: 'https://images.unsplash.com/photo-1596463990833-289b43936630?q=80&w=2874&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1596463990833-289b43936630'],
        contactNumber: '+8801711223347',
      },
      {
        name: 'Poultry Farm Modernization',
        category: 'Agriculture',
        status: ProjectStatus.ONGOING,
        targetAmount: 150000,
        raisedAmount: 75000,
        description: 'Upgrading equipment for a 5000-bird capacity poultry farm in Gazipur.',
        location: 'Gazipur, Bangladesh',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-09-01'),
        thumbnail: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=2070&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1541625602330-2277a4c46182'],
        contactNumber: '+8801711223348',
      },
      {
        name: 'Dairy Farm Project',
        category: 'Agriculture',
        status: ProjectStatus.UPCOMING,
        targetAmount: 800000,
        raisedAmount: 50000,
        description: 'Setting up a modern dairy farm with high-yield breed cows in Pabna.',
        location: 'Pabna, Bangladesh',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-06-01'),
        thumbnail: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=2948&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1500595046743-cd271d694d30'],
        contactNumber: '+8801711223349',
      },
      {
        name: 'Commercial Plot Development',
        category: 'Real Estate',
        status: ProjectStatus.ONGOING,
        targetAmount: 2500000,
        raisedAmount: 1500000,
        description: 'Developing commercial plots near Purbachal New Town. High appreciation potential.',
        location: 'Purbachal, Dhaka',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2025-01-15'),
        thumbnail: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2896&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1582407947304-fd86f028f716'],
        contactNumber: '+8801711223350',
      },
      {
        name: 'Rooftop Gardening Initiative',
        category: 'Agriculture',
        status: ProjectStatus.ONGOING,
        targetAmount: 100000,
        raisedAmount: 80000,
        description: 'Community rooftop gardening project in Dhaka city to promote green living.',
        location: 'Mirpur, Dhaka',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-01'),
        thumbnail: 'https://images.unsplash.com/photo-1622383563227-044011358d20?q=80&w=2787&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1622383563227-044011358d20'],
        contactNumber: '+8801711223351',
      },
      {
        name: 'Shrimp Processing Plant',
        category: 'Fish Farming',
        status: ProjectStatus.UPCOMING,
        targetAmount: 1200000,
        raisedAmount: 0,
        description: 'Establishing a modern shrimp processing plant for export in Khulna.',
        location: 'Khulna, Bangladesh',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2025-07-01'),
        thumbnail: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=2874&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1565680018434-b513d5e5fd47'],
        contactNumber: '+8801711223352',
      },
      {
        name: 'Lemon Orchard',
        category: 'Agriculture',
        status: ProjectStatus.EXPIRED,
        targetAmount: 80000,
        raisedAmount: 80000,
        description: 'High-yield lemon orchard project in Tangail. Completed successfully.',
        location: 'Tangail, Bangladesh',
        startDate: new Date('2023-03-01'),
        endDate: new Date('2023-09-01'),
        thumbnail: 'https://images.unsplash.com/photo-1595855709915-393ae1c55536?q=80&w=2940&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1595855709915-393ae1c55536'],
        contactNumber: '+8801711223353',
      },
      {
        name: 'Urban Vertical Farming',
        category: 'Agriculture',
        status: ProjectStatus.ONGOING,
        targetAmount: 400000,
        raisedAmount: 100000,
        description: 'Pilot project for vertical farming of leafy greens in Bashundhara R/A.',
        location: 'Bashundhara, Dhaka',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-10-01'),
        thumbnail: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=2940&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8'],
        contactNumber: '+8801711223354',
      },
      {
        name: 'Mud Crab Fattening',
        category: 'Fish Farming',
        status: ProjectStatus.UPCOMING,
        targetAmount: 250000,
        raisedAmount: 20000,
        description: 'Sustainable mud crab fattening project in Satkhira coastal region.',
        location: 'Satkhira, Bangladesh',
        startDate: new Date('2024-05-15'),
        endDate: new Date('2024-11-15'),
        thumbnail: 'https://images.unsplash.com/photo-1551817958-8686a3782c3d?q=80&w=2070&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1551817958-8686a3782c3d'],
        contactNumber: '+8801711223355',
      },
    ];

    logger.log(`🏗️  Seeding ${projects.length} projects...`);

    for (const projectData of projects) {
      // Use create method or model directly
      // Since ProjectService.create requires CreateProjectDto and userId
      
      const newProject = await projectService.create({
        ...projectData,
        images: projectData.images || [],
        videos: [],
        notice: '',
        members: [],
        memberCount: 0,
        totalInvestment: 0
      } as any, creatorId);
      
      logger.log(`✅ Created project: ${newProject.name}`);
    }

    logger.log('🎉 Project seeding completed successfully!');

  } catch (error) {
    logger.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
    process.exit();
  }
}

bootstrap();
