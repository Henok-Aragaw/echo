import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

export default async function handler(req, res) {
  const app = await NestFactory.create(AppModule);
  await app.init();
  
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
}