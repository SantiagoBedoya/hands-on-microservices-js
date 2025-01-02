import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransactionModule } from './transaction/transaction.module';

async function bootstrap() {
  const app = await NestFactory.create(TransactionModule);

  const config = new DocumentBuilder()
    .setTitle('Transaction API')
    .setDescription('Transaction API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();