import { NestFactory } from '@nestjs/core';
import { AccumulationSystemModule } from './accumulation-system.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AccumulationSystemModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3001);
}
bootstrap();
