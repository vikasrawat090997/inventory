import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for React frontend (on port 3000 or any origin)
  app.enableCors();

  // Enable validation pipe globally
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('RxKeep API')
    .setDescription('The RxKeep Pharmacy Inventory & Sales Management system backend API description')
    .setVersion('1.0')
    .addTag('medicines')
    .addTag('sales')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Start on Port 4000
  await app.listen(4000);
  console.log(`Application is running on: http://localhost:4000`);
  console.log(`Swagger Docs available at: http://localhost:4000/api-docs`);
}
bootstrap();
