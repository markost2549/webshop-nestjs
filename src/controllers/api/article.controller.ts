import { Controller, Post, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
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
          callback(new Error('Bad file extenstion!'), false);
          return;
        }
        if (!(file.mimetype.includes('jpg') || file.mimetype.includes('png'))) {
          callback(new Error('Bad file content!'), false);
          return;
        }
        callback(null, true);
      },
      limits: {
        files: 1,
        fieldSize: StorageConfig.photoMaxFileSize
      }
    })
  )
  async uploadPhoto(@Param('id') articleId: number, @UploadedFile() photo): Promise<Photo | ApiResponse> {

    console.log(photo)
    const newPhoto = new Photo();
    newPhoto.articleId = articleId;
    newPhoto.imagePath = photo.filename;

    const savedPhoto = await this.photoSevice.add(newPhoto);
    if (!savedPhoto) {
      return new ApiResponse('error', -4001);
    }
    return savedPhoto;

  }
}
