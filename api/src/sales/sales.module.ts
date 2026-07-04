import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale, SaleItem } from './sales.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { MedicinesModule } from '../medicines/medicines.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, SaleItem]),
    MedicinesModule
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
