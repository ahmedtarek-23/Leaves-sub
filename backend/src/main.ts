import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { config } from 'dotenv';
config();   // ← add this line

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ★ Global validation pipe with automatic transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
        exposeDefaultValues: true,
      },
      whitelist: true,
      forbidNonWhitelisted: false,
      errorHttpStatusCode: 400,
      stopAtFirstError: false,
    }),
  );

  // // Serve static files from uploads directory
  // app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  //   prefix: '/uploads/',
  // });

  // ★ allow frontend origin + credentials (cookies)
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(5000);
  console.log('Nest running on http://localhost:5000  🚀');
}
bootstrap();