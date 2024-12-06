/* eslint-disable prettier/prettier */
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS from all sources  
  app.useWebSocketAdapter(new WsAdapter(app));

  app.enableCors({
    origin: "*", // Cho phép tất cả nguồn
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Nếu bạn muốn cho phép cookie, thông tin xác thực
  });

  await app.listen(3001);
}

bootstrap();
