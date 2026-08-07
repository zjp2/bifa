import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS：允许前端 http://localhost:5173 访问
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // 全局校验管道：基于 class-validator 装饰器校验入参
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  new Logger('Bootstrap').log(
    `墨笺 · Inkwell 后端已启动：http://localhost:${port}`,
  );
}
bootstrap();
