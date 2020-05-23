import { Controller, Post, Body, Req, Put } from '@nestjs/common';
import { AdministratorService } from 'src/services/administrator/administrator.service';
import { LoginAdministratorDto } from 'src/dtos/administrator/login.administrator.dto';
import { ApiResponse } from 'src/misc/api.response.class';
import { LoginInfoAdministratorDto } from 'src/dtos/administrator/login.info.administrator.dto';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { JwtDataAdministratorDto } from 'src/dtos/administrator/jwt.data.administrator.dto';
import { Request } from 'express';
import { jwtSecret } from 'config/jwt.secret';
import { UserRegistrationDto } from '../../dtos/user/user.registration.dto';
import { UserService } from '../../services/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    public administratorService: AdministratorService,
    public UserService: UserService
  ) { }

  @Post('login') //http://localhost:3000/auth/login
  async doLogin(
    @Body() data: LoginAdministratorDto,
    @Req() req: Request,
  ): Promise<LoginInfoAdministratorDto | ApiResponse> {
    const administrator = await this.administratorService.getByUsername(
      data.username,
    );
    if (!administrator) {
      return new Promise(resolve => resolve(new ApiResponse('error', -3001)));
    }

    const passwordHash = crypto.createHash('sha512');
    passwordHash.update(data.password);
    const passwordHashString = passwordHash.digest('hex').toUpperCase();

    if (administrator.passwordHash !== passwordHashString) {
      return new Promise(resolve => resolve(new ApiResponse('error', -3002)));
    }

    // JWT
    const jwtData = new JwtDataAdministratorDto();
    jwtData.adminstratorId = administrator.administratorId;
    jwtData.username = administrator.username;

    const now = new Date();
    now.setDate(now.getDate() + 14);
    const istekTimestamp = now.getTime() / 1000;
    jwtData.exp = istekTimestamp;
    jwtData.ip = req.ip.toString();
    jwtData.ua = req.headers['user-agent'];

    const token: string = jwt.sign(jwtData.toPlainObject(), jwtSecret);

    const responseObject = new LoginInfoAdministratorDto(
      administrator.administratorId,
      administrator.username,

      token,
    );

    return new Promise(resolve => resolve(responseObject));
  }

  @Put('user/register')
  async userRegister(@Body() data: UserRegistrationDto) {
    return await this.UserService.register(data)
  }

}
