import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/schemas/user.schema';
import * as mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  const adminData = {
    name: 'Super Admin',
    email: 'admin@alhamdulillah.com',
    password: 'adminpassword123',
    role: UserRole.SUPER_ADMIN,
  };

  try {
    console.log('🌱 Seeding Super Admin...');
    
    const userModel = (userService as any).userModel;
    if (!userModel) {
      throw new Error('Could not access user model from UserService');
    }

    // Delete existing user if it exists
    const existing = await userModel.findOne({ email: adminData.email });
    if (existing) {
      console.log('🗑️  Deleting existing Super Admin...');
      await userModel.deleteOne({ email: adminData.email });
    }

    const newUser = new userModel(adminData);
    await newUser.save();
    
    console.log('✅ Super Admin created successfully!');
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔑 Password: ${adminData.password}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
    process.exit();
  }
}

bootstrap();
