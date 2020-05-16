import { NestMiddleware, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AdministratorService } from 'src/services/administrator/administrator.service';
import * as jwt from 'jsonwebtoken';
import { JwtDataAdministratorDto } from 'src/dtos/administrator/jwt.data.administrator.dto';
import { jwtSecret } from 'config/jwt.secret';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly administratorService: AdministratorService) { }

  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      throw new HttpException('Token not found', HttpStatus.UNAUTHORIZED);
    }

    const tokenParts = req.headers.authorization.split(' ');
    if (tokenParts.length !== 2) {
      throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
    }
    const tokenString = tokenParts[1];

    const jwtData: JwtDataAdministratorDto = jwt.verify(tokenString, jwtSecret);

    if (!jwtData) {
      throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
    }

    if (jwtData.ip !== req.ip.toString()) {
      throw new HttpException('IP mismath', HttpStatus.UNAUTHORIZED);
    }

    if (jwtData.ua !== req.headers['user-agent']) {
      throw new HttpException('UE mismath', HttpStatus.UNAUTHORIZED);
    }

    const administrator = await this.administratorService.getById(
      jwtData.adminstratorId,
    );

    if (!administrator) {
      throw new HttpException('Account now found', HttpStatus.UNAUTHORIZED);
    }

    const nowTimestamp = new Date().getTime() / 1000;
    if (nowTimestamp >= jwtData.ext) {
      throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
    }

    next();
  }
}
