import { Controller, Get, Param, Put, Body, Post, SetMetadata, UseGuards, Patch } from '@nestjs/common';
import { AdministratorService } from '../../services/administrator/administrator.service';
import { Administrator } from '../../entities/administrator.entity';
import { AddAdministratorDto } from '../../dtos/administrator/add.administrator.dto';
import { EditAdministratorDto } from '../../dtos/administrator/edit.administrator.dto';
import { ApiResponse } from 'src/misc/api.response.class';
import { AllowToRoles } from 'src/misc/allow.to.roles.descriptor';
import { RoleCheckerGuard } from '../../misc/role.checker.guard';

@Controller('api/administrator')
export class AdministratorController {
  constructor(private administratorService: AdministratorService) { }

  @Get()
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator')
  getAll(): Promise<Administrator[]> {
    return this.administratorService.getAll();
  }

  @Get(':id')
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator')
  getAllById(
    @Param('id') administratorId: number,
  ): Promise<Administrator | ApiResponse> {
    return this.administratorService.getById(administratorId);
  }

  @Post()
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator')
  add(@Body() data: AddAdministratorDto): Promise<Administrator | ApiResponse> {
    return this.administratorService.add(data);
  }

  @Patch(':id')
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator')
  edit(
    @Param('id') id: number,
    @Body() data: EditAdministratorDto,
  ): Promise<Administrator | ApiResponse> {
    return this.administratorService.editById(id, data);
  }
}
