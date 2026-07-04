"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicinesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const medicine_entity_1 = require("./medicine.entity");
let MedicinesService = class MedicinesService {
    constructor(medicineRepository) {
        this.medicineRepository = medicineRepository;
    }
    async findAll() {
        const list = await this.medicineRepository.find();
        if (list.length === 0) {
            await this.seedMockMedicines();
            return this.medicineRepository.find();
        }
        return list;
    }
    async findOne(id) {
        const medicine = await this.medicineRepository.findOneBy({ id });
        if (!medicine) {
            throw new common_1.NotFoundException(`Medicine with ID ${id} not found`);
        }
        return medicine;
    }
    async create(createMedicineDto) {
        const medicine = this.medicineRepository.create(createMedicineDto);
        return this.medicineRepository.save(medicine);
    }
    async update(id, updateFields) {
        const medicine = await this.findOne(id);
        const updated = Object.assign(medicine, updateFields);
        return this.medicineRepository.save(updated);
    }
    async remove(id) {
        const result = await this.medicineRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Medicine with ID ${id} not found`);
        }
    }
    async seedMockMedicines() {
        const MOCK_MEDS = [
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
};
exports.MedicinesService = MedicinesService;
exports.MedicinesService = MedicinesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(medicine_entity_1.Medicine)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MedicinesService);
//# sourceMappingURL=medicines.service.js.map