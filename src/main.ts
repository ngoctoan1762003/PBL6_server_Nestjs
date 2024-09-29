import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'https://pbl6-server-nestjs.onrender.com', // Hoặc dùng '*' để cho phép tất cả domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,  // Nếu bạn muốn cho phép cookie, thông tin xác thực
  });

  await app.listen(3000);
}

bootstrap();
