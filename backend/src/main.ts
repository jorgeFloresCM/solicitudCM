import "reflect-metadata";
import { config } from "dotenv";
config(); // carga .env antes de que los módulos lean process.env

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";

async function bootstrap() {
  // Import diferido: AppModule lee process.env al cargarse
  const { AppModule } = await import("./app.module");
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // Con el proxy /api de Next no hace falta CORS; solo se activa si se configura un origen
  if (process.env.CORS_ORIGIN) {
    app.enableCors({ origin: process.env.CORS_ORIGIN.split(","), credentials: true });
  }

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  console.log(`SGI backend escuchando en http://localhost:${port}/api`);
}
bootstrap();
