import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AiModule } from './modules/ai/ai.module';
import { FragmentsService } from './modules/fragments/fragments.service';
import { FragmentsController } from './modules/fragments/fragments.controller';
import { FragmentsModule } from './modules/fragments/fragments.module';
import { DailyMemoryModule } from './modules/daily-memory/daily-memory.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CloudinaryProvider } from './lib/cloudinary';
import { UserController } from './user/user.controller';


@Module({
  imports: [ScheduleModule.forRoot(),AuthModule, UserModule, PrismaModule, AiModule, FragmentsModule, DailyMemoryModule],
  controllers: [AppController, AuthController, FragmentsController, UserController],
  providers: [AppService, AuthService, PrismaService, FragmentsService, CloudinaryProvider],
})
export class AppModule {}
