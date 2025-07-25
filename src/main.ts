import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GlobalHttpExceptionFilter } from './interceptors/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Marketplace API')
    .setDescription('Documentation')
    .setVersion('1.0')
    .build();

  app.setGlobalPrefix('api/v1');

  const configuration = app.get(ConfigService);

  const originStrings = configuration.get<string>('ORIGINS');
  let origins: string[] = [];

  if (originStrings) {
    origins = originStrings.split(',');
  }

  console.log(origins);

  //! Cors
  app.enableCors({
    credentials: true,
    origin: origins,
  });

  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/api/v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showRequestDuration: true,
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
