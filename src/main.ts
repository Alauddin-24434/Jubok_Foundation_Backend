import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  const configService = app.get(ConfigService);

  app.use(cookieParser());
  app.use(helmet());

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') || '*',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: error.constraints ? Object.values(error.constraints)[0] : 'Invalid value',
        }));
        return new BadRequestException(result);
      },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Alhamdulillah Foundation API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // THIS IS THE KEY CHANGE FOR VERCEL:
  // We don't call app.listen() if we're running as a serverless function
  if (process.env.NODE_ENV !== 'production') {
    const port = configService.get<number>('PORT') || 5000;
    await app.listen(port);
  }

  // Export the express instance for Vercel
  await app.init();
  return app.getHttpAdapter().getInstance();
}

// Export a handler for Vercel
export default bootstrap();