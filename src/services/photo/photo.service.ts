import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Injectable } from "@nestjs/common";
import { Photo } from "src/entities/photo.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class PhotoSevice extends TypeOrmCrudService<Photo> {
    constructor(
        @InjectRepository(Photo)
        private readonly photo: Repository<Photo>
    ) {
        super(photo)
    }

    add(newPhoto: Photo): Promise<Photo> {
        return this.photo.save(newPhoto);
    }
}
