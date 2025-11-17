import { Module } from '@nestjs/common';
import { ExceptionsService } from './exceptions.service';
import { ExceptionsController } from './exceptions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Exception, ExceptionSchema } from './schemas/excetions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exception.name, schema: ExceptionSchema },
    ]),
  ],
  controllers: [ExceptionsController],
  providers: [ExceptionsService],
})
export class ExceptionsModule {}