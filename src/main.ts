import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { StorageConfig } from '../config/storage.config';
import { Index } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(StorageConfig.photo.destination, {
    prefix: StorageConfig.photo.urlPrefix,
    maxAge: StorageConfig.photo.maxAge,
    index: false //7 dana
  })
  await app.listen(3000);
}
bootstrap();
