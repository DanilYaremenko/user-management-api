import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.enableCors({
    origin: 'https://user-management-front.onrender.com',
    methods: 'GET,POST',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  await app.listen(3000);
}
bootstrap();
