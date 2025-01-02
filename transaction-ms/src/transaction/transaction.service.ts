import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { AccountAPIResponse } from './dto/account.dto';
import { KafkaService } from 'src/kafka/kafka.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const { accountId, description } = createTransactionDto;

    const accountAPIResponse =
      await this.httpService.axiosRef.get<AccountAPIResponse>(
        `http://localhost:3001/v1/accounts/${accountId}`,
      );
    const { account } = accountAPIResponse.data;

    if (!account) {
      throw new HttpException(
        'Transaction created failed: Account not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.prisma.transaction.create({
      data: {
        accountId,
        description,
        status:
          account.status === 'active' || account.status === 'new'
            ? 'CREATED'
            : 'FAILED',
      },
    });
  }

  findAll() {
    return this.prisma.transaction.findMany();
  }

  findOne(id: number) {
    return this.prisma.transaction.findUnique({
      where: { id },
    });
  }

  async fraud(id: number) {
    const transaction = await this.findOne(id);
    if (transaction.status !== 'FRAUD' && transaction.status !== 'FAILED') {
      const newTransaction = this.prisma.transaction.update({
        where: { id },
        data: { status: 'FRAUD' },
      });

      await this.kafkaService.send(transaction, null);
      return newTransaction;
    } else {
      throw new HttpException(
        'Transaction is not a valid status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
