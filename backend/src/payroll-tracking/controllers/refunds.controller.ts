import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { RefundsService } from '../services/refunds.service';
import { CreateRefundDto } from '../dtos/create-refund.dto';
import { UpdateRefundDto } from '../dtos/update-refund.dto';
import { refunds } from '../models/refunds.schema';

@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  create(@Body() createRefundDto: CreateRefundDto): Promise<refunds> {
    return this.refundsService.create(createRefundDto);
  }

  @Get()
  findAll(): Promise<refunds[]> {
    return this.refundsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<refunds> {
    return this.refundsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRefundDto: UpdateRefundDto,
  ): Promise<refunds> {
    return this.refundsService.update(id, updateRefundDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.refundsService.remove(id);
  }
}