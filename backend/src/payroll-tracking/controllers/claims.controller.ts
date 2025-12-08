import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ClaimsService } from '../services/claims.service';
import { CreateClaimDto } from '../dtos/create-claim.dto';
import { UpdateClaimDto } from '../dtos/update-claim.dto';
import { claims } from '../models/claims.schema';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  create(@Body() createClaimDto: CreateClaimDto): Promise<claims> {
    return this.claimsService.create(createClaimDto);
  }

  @Get()
  findAll(): Promise<claims[]> {
    return this.claimsService.findAll();
  }

  // GET /claims/:id (Mongo _id)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<claims> {
    return this.claimsService.findOne(id);
  }

  // Optional: GET /claims/by-claim-id/:claimId (business id)
  @Get('by-claim-id/:claimId')
  findByClaimId(@Param('claimId') claimId: string): Promise<claims> {
    return this.claimsService.findByClaimId(claimId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClaimDto: UpdateClaimDto,
  ): Promise<claims> {
    return this.claimsService.update(id, updateClaimDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.claimsService.remove(id);
  }
}