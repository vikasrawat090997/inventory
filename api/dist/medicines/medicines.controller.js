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
exports.MedicinesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../users/jwt-auth.guard");
const medicines_service_1 = require("./medicines.service");
const create_medicine_dto_1 = require("./dto/create-medicine.dto");
let MedicinesController = class MedicinesController {
    constructor(medicinesService) {
        this.medicinesService = medicinesService;
    }
    async exportCsv(type, res) {
        const medicines = await this.medicinesService.findAll();
        let csvContent = '\uFEFF';
        let filename = '';
        const today = new Date();
        if (type === 'expiry') {
            csvContent += 'Medicine Name,Category,Generic Name,Batch No,Expiry Date,Current Stock,Estimated Loss\n';
            medicines.forEach(med => {
                const exp = new Date(med.expiryDate);
                const isExpired = exp < today;
                const estLoss = isExpired ? (med.stock * med.purchasePrice) : 0;
                csvContent += `"${med.name}","${med.category || 'Tablets'}","${med.genericName || '-'}","${med.batchNo}","${med.expiryDate}",${med.stock},${estLoss}\n`;
            });
            filename = `Expiry_Report_${today.toISOString().split('T')[0]}.csv`;
        }
        else {
            const lowStockData = medicines.filter(m => m.stock <= (m.minStock || 10));
            csvContent += 'Medicine Name,Category,Generic Name,Batch No,Current Stock,Safety Threshold,Unit Cost,Status\n';
            lowStockData.forEach(med => {
                const status = med.stock === 0 ? 'Out of Stock' : 'Low Stock';
                csvContent += `"${med.name}","${med.category || 'Tablets'}","${med.genericName || '-'}","${med.batchNo}",${med.stock},${med.minStock || 10},${med.purchasePrice},"${status}"\n`;
            });
            filename = `Low_Stock_Report_${today.toISOString().split('T')[0]}.csv`;
        }
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(csvContent);
    }
    findAll() {
        return this.medicinesService.findAll();
    }
    findOne(id) {
        return this.medicinesService.findOne(id);
    }
    create(createMedicineDto) {
        return this.medicinesService.create(createMedicineDto);
    }
    update(id, updateFields) {
        return this.medicinesService.update(id, updateFields);
    }
    remove(id) {
        return this.medicinesService.remove(id);
    }
};
exports.MedicinesController = MedicinesController;
__decorate([
    (0, common_1.Get)('export-csv'),
    (0, swagger_1.ApiOperation)({ summary: 'Export medicines report as CSV' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MedicinesController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all medicines in inventory' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all medicines.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MedicinesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a medicine by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return a single medicine.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MedicinesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add a new medicine to inventory' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The medicine has been successfully added.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_medicine_dto_1.CreateMedicineDto]),
    __metadata("design:returntype", Promise)
], MedicinesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update medicine details by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The medicine has been successfully updated.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MedicinesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a medicine from inventory' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The medicine has been successfully deleted.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MedicinesController.prototype, "remove", null);
exports.MedicinesController = MedicinesController = __decorate([
    (0, swagger_1.ApiTags)('medicines'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('medicines'),
    __metadata("design:paramtypes", [medicines_service_1.MedicinesService])
], MedicinesController);
//# sourceMappingURL=medicines.controller.js.map