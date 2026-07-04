import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicine } from './medicine.entity';
import { MedicinesService } from './medicines.service';
import { MedicinesController } from './medicines.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine])],
  controllers: [MedicinesController],
  providers: [MedicinesService],
  exports: [TypeOrmModule] // export TypeOrmModule to allow other modules (like SalesModule) to access MedicineRepository
})
export class MedicinesModule {}
