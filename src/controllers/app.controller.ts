import { Controller, Get } from '@nestjs/common';
import { AdministratorService } from '../services/administrator/administrator.service';

@Controller()
export class AppController {
  constructor(private administratorSevice: AdministratorService) {}

  @Get()
  getHello(): string {
    return 'Home page!';
  }
}
