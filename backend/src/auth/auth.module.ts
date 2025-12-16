import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthController } from './auth.controller.js';

@Module({
  controllers: [AuthController],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req, res, next) => next())
      .forRoutes({ path: 'api/auth/*path', method: RequestMethod.ALL });
  }
}
