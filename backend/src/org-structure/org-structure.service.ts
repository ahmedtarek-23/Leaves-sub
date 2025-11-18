import { Injectable } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-dep.dto';
import { CreatePositionDto } from './dto/create-pos.dto';
import { RenameDepartmentDto } from './dto/rename-dep.dto';
import { UpdateReportingLineDto } from './dto/update-reporting-line.dto';
import { DeactivatePositionDto } from './dto/deactivate-pos.dto';

@Injectable()
export class OrgStructureService {
  getOrgChart() {
    return { ok: true, msg: 'dummy org chart fetched', data: [] };
  }

  createDept(dto: CreateDepartmentDto) {
    return { ok: true, msg: 'dummy dept created', input: dto };
  }

  createPos(dto: CreatePositionDto) {
    return { ok: true, msg: 'dummy position created', input: dto };
  }

  updateReportingLine(id: string, dto: UpdateReportingLineDto) {
    return {
      ok: true,
      msg: 'dummy reporting line updated',
      input: dto,
    };
  }

  deactivatePosition(id: string, dto: DeactivatePositionDto) {
    return {
      ok: true,
      msg: 'dummy pos deactivated',
      input: dto,
    };
  }

  renameDept(id: string, dto: RenameDepartmentDto) {
    return {
      ok: true,
      msg: 'dummy dept renamed',
      id,
      input: dto,
    };
  }
}
