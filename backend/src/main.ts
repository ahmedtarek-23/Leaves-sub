import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 // Enable cookie parser middleware
 app.use(cookieParser());

 // Global validation pipe
 app.useGlobalPipes(
   new ValidationPipe({
     whitelist: true,
     forbidNonWhitelisted: true,
     transform: true,
   })
 );

 // CORS
 app.enableCors({
   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
   credentials: true,
 });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
