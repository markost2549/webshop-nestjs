import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Feature } from '../../entities/feature.entity';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';

@Injectable()
export class FeatureService extends TypeOrmCrudService<Feature> {
    constructor(
        @InjectRepository(Feature) private readonly feature: Repository<Feature>
    ) { super(feature) }

}