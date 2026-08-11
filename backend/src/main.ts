import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  // 禁用内置 body-parser，手动设置更大的限制
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // 增大 body 限制至 10MB，以支持 base64 封面图上传
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // CORS：开发允许 localhost，生产允许所有同源请求（由 Nginx 反代）
  const isProd = process.env.NODE_ENV === 'production';
  app.enableCors({
    origin: isProd
      ? true
      : ['http://localhost:5173', 'http://192.168.31.240:5173'],
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
