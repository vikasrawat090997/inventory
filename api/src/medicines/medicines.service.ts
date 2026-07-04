import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicine } from './medicine.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
  ) {}

  async findAll(): Promise<Medicine[]> {
    const list = await this.medicineRepository.find();
    if (list.length === 0) {
      // Seed initial mock medicines if empty
      await this.seedMockMedicines();
      return this.medicineRepository.find();
    }
    return list;
  }

  async findOne(id: string): Promise<Medicine> {
    const medicine = await this.medicineRepository.findOneBy({ id });
    if (!medicine) {
      throw new NotFoundException(`Medicine with ID ${id} not found`);
    }
    return medicine;
  }

  async create(createMedicineDto: CreateMedicineDto): Promise<Medicine> {
    const medicine = this.medicineRepository.create(createMedicineDto);
    return this.medicineRepository.save(medicine);
  }

  async update(id: string, updateFields: Partial<Medicine>): Promise<Medicine> {
    const medicine = await this.findOne(id);
    const updated = Object.assign(medicine, updateFields);
    return this.medicineRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.medicineRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Medicine with ID ${id} not found`);
    }
  }

  private async seedMockMedicines() {
    const MOCK_MEDS: Partial<Medicine>[] = [
      {
        name: 'Paracetamol 650mg (Dolo)',
        genericName: 'Paracetamol / Acetaminophen',
        batchNo: 'DOL9028',
        expiryDate: '2026-09-15',
        stock: 80,
        minStock: 20,
        purchasePrice: 1.20,
        category: 'Tablets'
      },
      {
        name: 'Amoxicillin 500mg',
        genericName: 'Amoxicillin Trihydrate',
        batchNo: 'AMX4412',
        expiryDate: '2026-05-10',
        stock: 55,
        minStock: 15,
        purchasePrice: 4.50,
        category: 'Tablets'
      },
      {
        name: 'Cough Syrup 100ml (Benadryl)',
        genericName: 'Diphenhydramine HCl',
        batchNo: 'BEN7712',
        expiryDate: '2026-10-30',
        stock: 12,
        minStock: 5,
        purchasePrice: 95.00,
        category: 'Liquids'
      },
      {
        name: 'Digital BP Monitor (Omron)',
        genericName: 'BP Measuring Machine',
        batchNo: 'OMR3381',
        expiryDate: '2030-01-01',
        stock: 4,
        minStock: 2,
        purchasePrice: 1850.00,
        category: 'Equipments'
      },
      {
        name: 'Sterilized Disposable Syringe 5ml',
        genericName: 'Surgical Syringe',
        batchNo: 'SYR8890',
        expiryDate: '2029-04-18',
        stock: 150,
        minStock: 25,
        purchasePrice: 4.20,
        category: 'Equipments'
      }
    ];

    for (const med of MOCK_MEDS) {
      await this.medicineRepository.save(this.medicineRepository.create(med));
    }
  }
}
