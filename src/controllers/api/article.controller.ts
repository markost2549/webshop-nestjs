import { Controller, Post, Body, Param, UseInterceptors, UploadedFile, Req, Delete, Patch, UseGuards } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Article } from 'src/entities/article.entity';
import { ArticleService } from 'src/services/article/article.service';
import { AddArticleDto } from 'src/dtos/article/add.article.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'
import { StorageConfig } from 'config/storage.config';
import { PhotoSevice } from 'src/services/photo/photo.service';
import { Photo } from 'src/entities/photo.entity';
import { ApiResponse } from 'src/misc/api.response.class';
import * as fileType from 'file-type'
import * as fs from 'fs';
import * as sharp from 'sharp'
import { EditArticleDto } from '../../dtos/article/edit.article.dto';
import { AllowToRoles } from '../../misc/allow.to.roles.descriptor';
import { RoleCheckerGuard } from '../../misc/role.checker.guard';
import { on } from 'cluster';
import { ArticleSearchDto } from '../../dtos/article/article.search.dto';


@Controller('api/article')
@Crud({
  model: {
    type: Article,
  },
  params: {
    id: {
      field: 'articleId',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      category: { eager: true },
      photos: { eager: true },
      articlePrices: { eager: true },
      articleFeatures: { eager: true },
      features: { eager: true },
    },
  },
  routes: {
    only: [
      'getOneBase',
      'getManyBase'
    ],
    getOneBase: {
      decorators: [
        UseGuards(RoleCheckerGuard),
        AllowToRoles('administrator', 'user')
      ]
    },
    getManyBase: {
      decorators: [
        UseGuards(RoleCheckerGuard),
        AllowToRoles('administrator', 'user')
      ]
    }
  }
})
export class ArticleController {
  constructor(
    public service: ArticleService,
    public photoSevice: PhotoSevice,
  ) { }

  @Post() // Post http://localhost:3000/api/article/createFull/
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator')
  createFullArticle(@Body() data: AddArticleDto) {
    return this.service.createFullArtice(data);
  }

  @Patch(':id')
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator')
  editFullArticle(@Param('id') id: number, @Body() data: EditArticleDto) {
    return this.service.editFullArticle(id, data);
  }

  @Post(':id/uploadPhoto') //
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: StorageConfig.photo.destination,
        filename: (req, file, callback) => {
          const original: string = file.originalname;
          const normalized = original.replace(/\s+/g, '-');
          const now = new Date();
          let datePart = '';
          datePart += (now.getFullYear()).toString();
          datePart += (now.getMonth() + 1).toString();
          datePart += (now.getDate()).toString();

          const randomPart: string =
            new Array(10)
              .fill(0)
              .map(e => (Math.random() * 9).toFixed(0).toString())
              .join('')

          const fileName = datePart + '-' + randomPart + '-' + normalized;
          callback(null, fileName);
        }

      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.toLowerCase().match(/\.(jpg|png)$/)) {
          callback(null, false);
          req.fileFilterError = 'Bad file extension';
          return;
        }
        if (!(file.mimetype.includes('jpg') || file.mimetype.includes('png'))) {
          req.fileFilterError = 'Bad file content!';
          callback(null, false);
          return;
        }
        callback(null, true);
      },
      limits: {
        files: 1,
        fileSize: StorageConfig.photo.maxSize,
      }
    })
  )
  async uploadPhoto(
    @Param('id') articleId: number,
    @UploadedFile() photo,
    @Req() req,
  ): Promise<Photo | ApiResponse> {
    if (req.fileFilterError) {
      return new ApiResponse('error', -4002, req.fileFilterError)
    }

    if (!photo) {
      return new ApiResponse('error', -4002, 'File not uploaded');
    }


    const fileTypeResult = await fileType.fromFile(photo.path);
    if (!fileTypeResult) {
      fs.unlinkSync(photo.path)
      return new ApiResponse('error', -4002, 'Cannot dectect file type');
    }

    const realMimeType = fileTypeResult.mime;
    if (!(realMimeType.includes('jpeg') || realMimeType.includes('png'))) {
      fs.unlinkSync(photo.path)
      return new ApiResponse('error', -4002, 'Bad filecontent type!');
    }

    await this.createResizedImage(photo, StorageConfig.photo.resize.thumb)
    await this.createResizedImage(photo, StorageConfig.photo.resize.small)

    const newPhoto: Photo = new Photo();
    newPhoto.articleId = articleId;
    newPhoto.imagePath = photo.filename;

    const savedPhoto = await this.photoSevice.add(newPhoto);
    if (!savedPhoto) {
      return new ApiResponse('error', -4001);
    }
    return savedPhoto;
  }

  async createResizedImage(photo, resizeSettings) {
    const originalFilePath = photo.path;
    const fileName = photo.filename;

    const destinationFilePath =
      StorageConfig.photo.destination +
      resizeSettings.directory +
      fileName;

    await sharp(originalFilePath)
      .resize({
        fit: 'cover',
        width: resizeSettings.width,
        height: resizeSettings.height,

      })
      .toFile(destinationFilePath)
  }

  @Delete(':articleId/deletePhoto/:photoId')
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator')
  public async deletePhoto(
    @Param('articleId') articleId: number,
    @Param('photoId') photoId: number
  ) {
    const photo = await this.photoSevice.findOne({
      articleId: articleId,
      photoId: photoId,
    })

    if (!photo) {
      return new ApiResponse('error', -4004, 'Photo not found')
    }

    try {
      fs.unlinkSync(StorageConfig.photo.destination + photo.imagePath)
      fs.unlinkSync(StorageConfig.photo.destination + StorageConfig.photo.resize.thumb.directory + photo.imagePath)
      fs.unlinkSync(StorageConfig.photo.destination + StorageConfig.photo.resize.small.directory + photo.imagePath)
    } catch (e) {

    }

    const deleteResult = await this.photoSevice.deleteById(photoId);

    if (deleteResult.affected === 0) {
      return new ApiResponse('error', -4004, 'Photo not found')
    }

    return new ApiResponse('Ok', 0, 'One photo deleted!');
  }

  @Post('search')
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator', 'user')
  async search(@Body() data: ArticleSearchDto): Promise<Article[] | ApiResponse> {
    return await this.service.search(data)
  }


}
