import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT', 8080);

  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.ALL }],
  });

  app.enableCors({
    origin: configService.get<string>('ORIGIN', 'http://localhost:5173'),
  });

  await app.listen(port);
}
bootstrap();
