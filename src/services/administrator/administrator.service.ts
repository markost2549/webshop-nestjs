import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from '../../../entities/administrator.entity';
import { Repository } from 'typeorm';
import { AddAdministratorDto } from '../../dtos/administrator/add.administrator.dto';


@Injectable()
export class AdministratorService {
    constructor(
        @InjectRepository(Administrator)
        private readonly administrator: Repository<Administrator>
    ) { }

    getAll(): Promise<Administrator[]> {
        return this.administrator.find()
    }

    getById(id: number): Promise<Administrator> {
        return this.administrator.findOne(id)
    }

    add(data: AddAdministratorDto): Promise<Administrator> {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const crypto = require('crypto');
        const passwordHash = crypto.createHash('sha512')
        passwordHash.update(data.password)

        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        const newAdmin: Administrator = new Administrator();
        newAdmin.username = data.username;
        newAdmin.passwordHash = passwordHashString

        return this.administrator.save(newAdmin)
    }
}
