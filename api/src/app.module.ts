import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicinesModule } from './medicines/medicines.module';
import { SalesModule } from './sales/sales.module';
import { UsersModule } from './users/users.module';
import { Medicine } from './medicines/medicine.entity';
import { Sale, SaleItem } from './sales/sales.entity';
import { User } from './users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'inventory',
      entities: [Medicine, Sale, SaleItem, User],
      synchronize: true, // auto-creates and updates database tables
    }),
    MedicinesModule,
    SalesModule,
    UsersModule,
  ],
})
export class AppModule { }
