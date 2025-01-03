import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { KafkaService } from 'src/kafka/kafka.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [TransactionController],
  providers: [TransactionService, KafkaService, ConfigService],
})
export class TransactionModule {}
