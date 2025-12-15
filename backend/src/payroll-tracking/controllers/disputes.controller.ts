import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { DisputesService } from '../services/disputes.service';
import { CreateDisputeDto } from '../dtos/create-dispute.dto';
import { UpdateDisputeDto } from '../dtos/update-dispute.dto';
import { disputes } from '../models/disputes.schema';

@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  create(@Body() createDisputeDto: CreateDisputeDto): Promise<disputes> {
    return this.disputesService.create(createDisputeDto);
  }

  @Get()
  findAll(): Promise<disputes[]> {
    return this.disputesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<disputes> {
    return this.disputesService.findOne(id);
  }

  @Get('by-dispute-id/:disputeId')
  findByClaimId(@Param('disputeId') disputeId: string): Promise<disputes> {
    return this.disputesService.findByDisputeId(disputeId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDisputeDto: UpdateDisputeDto,
  ): Promise<disputes> {
    return this.disputesService.update(id, updateDisputeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.disputesService.remove(id);
  }
}