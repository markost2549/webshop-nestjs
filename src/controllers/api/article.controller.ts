import { Controller, Post, Body, Param, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Article } from 'entities/article.entity';
import { ArticleService } from 'src/services/article/article.service';
import { AddArticleDto } from 'src/dtos/article/add.article.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'
import { StorageConfig } from 'config/storage.config';
import { PhotoSevice } from 'src/services/photo/photo.service';
import { Photo } from 'entities/photo.entity';
import { ApiResponse } from 'src/misc/api.response.class';
import * as fileType from 'file-type'
import * as fs from 'fs';
import * as sharp from 'sharp'

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
})
export class ArticleController {
  constructor(
    public service: ArticleService,
    public photoSevice: PhotoSevice,
  ) { }

  @Post('createFull') // Post http://localhost:3000/api/article/createFull/
  createFullArticle(@Body() data: AddArticleDto) {
    return this.service.createFullArtice(data);
  }

  @Post(':id/uploadPhoto') //
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: StorageConfig.photoDestination,
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
        fileSize: StorageConfig.photoMaxFileSize
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

    await this.createThumb(photo);
    await this.createSmallImage(photo);

    const newPhoto: Photo = new Photo();
    newPhoto.articleId = articleId;
    newPhoto.imagePath = photo.filename;

    const savedPhoto = await this.photoSevice.add(newPhoto);
    if (!savedPhoto) {
      return new ApiResponse('error', -4001);
    }
    return savedPhoto;
  }

  async createThumb(photo) {
    const originalFilePath = photo.path;
    const fileName = photo.filename;

    const destinationFilePath = StorageConfig.photoDestination + 'thumb/' + fileName;

    await sharp(originalFilePath)
      .resize({
        fit: 'cover',
        width: StorageConfig.photoThumbSize.width,
        height: StorageConfig.photoThumbSize.height,
        background: {
          r: 255, g: 255, b: 255, alpha: 0.0
        }
      })
      .toFile(destinationFilePath)
  }

  async createSmallImage(photo) {
    const originalFilePath = photo.path;
    const fileName = photo.filename;

    const destinationFilePath = StorageConfig.photoDestination + 'small/' + fileName;

    await sharp(originalFilePath)
      .resize({
        fit: 'cover',
        width: StorageConfig.photoSmallSize.width,
        height: StorageConfig.photoSmallSize.height,
        background: {
          r: 255, g: 255, b: 255, alpha: 0.0
        },
      })
      .toFile(destinationFilePath)
  }
}
