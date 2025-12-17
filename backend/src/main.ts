import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin:[ process.env.FRONTEND_URL, 'my-app://'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  })

   app.setGlobalPrefix('api'); 

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
