import { Controller, Get } from '@nestjs/common';
import { Administrator } from 'entities/administrator.entity';
import { AdministratorService } from './services/administrator/administrator.service';


@Controller()
export class AppController {

  constructor(
    private administratorSevice: AdministratorService
  ) { }

  @Get()
  getHello(): string {
    return 'Home page!';
  }

  @Get('api/administrator') // http://localhost:3000/api/administrator
  getAllAdmins(): Promise<Administrator[]> {
    return this.administratorSevice.getAll();
  }



}
