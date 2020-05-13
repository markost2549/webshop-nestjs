import { Controller, Get, Param, Put, Body, Post } from "@nestjs/common";
import { AdministratorService } from "../../services/administrator/administrator.service";
import { Administrator } from "../../../entities/administrator.entity";
import { AddAdministratorDto } from "../../dtos/administrator/add.administrator.dto";
import { EditAdministratorDto } from "../../dtos/administrator/edit.administrator.dto";

@Controller('api/administrator')
export class AdministratorController {
    constructor(private administratorService: AdministratorService) { }

    @Get()
    getAll(): Promise<Administrator[]> {
        return this.administratorService.getAll();
    }

    @Get(':id')
    getAllById(@Param('id') administratorId: number): Promise<Administrator> {
        return this.administratorService.getById(administratorId);
    }

    @Put()
    add(@Body() data: AddAdministratorDto): Promise<Administrator> {
        return this.administratorService.add(data);
    }

    @Post(':id')
    edit(@Param('id') id: number, @Body() data: EditAdministratorDto): Promise<Administrator> {
        return this.administratorService.editById(id, data)
    }

} 