import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @IsOptional()
  @IsString()
  description?: string;
}
