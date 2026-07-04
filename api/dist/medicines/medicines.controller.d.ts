import { Response } from 'express';
import { MedicinesService } from './medicines.service';
import { Medicine } from './medicine.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
export declare class MedicinesController {
    private readonly medicinesService;
    constructor(medicinesService: MedicinesService);
    exportCsv(type: string, res: Response): Promise<Response<any, Record<string, any>>>;
    findAll(): Promise<Medicine[]>;
    findOne(id: string): Promise<Medicine>;
    create(createMedicineDto: CreateMedicineDto): Promise<Medicine>;
    update(id: string, updateFields: Partial<Medicine>): Promise<Medicine>;
    remove(id: string): Promise<void>;
}
