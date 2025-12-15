import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration for Swagger
  const config = new DocumentBuilder()
    .setTitle('STEPS Tutor APIs')
    .setDescription('STEPS Tutor APIs')
    .setVersion('1.0')
    .addTag('STEPS Tutor')
    .addBearerAuth(undefined, 'access-token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const configService = app.get(ConfigService);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.enableCors();
  await app.listen(configService.get<number>('PORT') || 3000);
}
bootstrap();
