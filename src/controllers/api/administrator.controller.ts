import { Controller, Get, Param, Put, Body, Post } from "@nestjs/common";
import { AdministratorService } from "../../services/administrator/administrator.service";
import { Administrator } from "../../../dist/entities/administrator.entity";
import { AddAdministratorDto } from "../../dtos/administrator/add.administrator.dto";

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



} 