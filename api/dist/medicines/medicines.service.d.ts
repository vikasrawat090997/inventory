import { Repository } from 'typeorm';
import { Medicine } from './medicine.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
export declare class MedicinesService {
    private readonly medicineRepository;
    constructor(medicineRepository: Repository<Medicine>);
    findAll(): Promise<Medicine[]>;
    findOne(id: string): Promise<Medicine>;
    create(createMedicineDto: CreateMedicineDto): Promise<Medicine>;
    update(id: string, updateFields: Partial<Medicine>): Promise<Medicine>;
    remove(id: string): Promise<void>;
    private seedMockMedicines;
}
