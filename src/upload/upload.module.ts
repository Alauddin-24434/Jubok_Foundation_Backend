import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';
import { UploadController } from './upload.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // 🔥 VERY IMPORTANT LOGS
        console.log('📦 UploadModule initialized');
        console.log(
          '☁️ CLOUDINARY_CLOUD_NAME:',
          configService.get('CLOUDINARY_CLOUD_NAME'),
        );
        console.log(
          '🔑 CLOUDINARY_API_KEY:',
          configService.get('CLOUDINARY_API_KEY'),
        );
        console.log(
          '🔐 CLOUDINARY_API_SECRET:',
          configService.get('CLOUDINARY_API_SECRET')
            ? '✔️ EXISTS'
            : '❌ MISSING',
        );

        cloudinary.config({
          cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
          api_key: configService.get('CLOUDINARY_API_KEY'),
          api_secret: configService.get('CLOUDINARY_API_SECRET'),
        });

        return {
          storage: new CloudinaryStorage({
            cloudinary: cloudinary,
            params: {
              folder: 'alhamdulillah-foundation',
              allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'],
              public_id: (req, file) =>
                `${Date.now()}-${file.originalname.split('.')[0]}`,
            } as any,
          }),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CloudinaryProvider, CloudinaryService],
  controllers: [UploadController],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class UploadModule {}

