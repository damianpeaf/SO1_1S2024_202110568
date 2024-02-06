import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envConfiguration } from './config/app.config';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  const config = envConfiguration();
  await app.listen(config.port);
}
bootstrap();
