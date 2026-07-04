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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Medicine = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
let Medicine = class Medicine {
};
exports.Medicine = Medicine;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, swagger_1.ApiProperty)({ description: 'The unique ID of the medicine' }),
    __metadata("design:type", String)
], Medicine.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, swagger_1.ApiProperty)({ description: 'Name of the medicine' }),
    __metadata("design:type", String)
], Medicine.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, swagger_1.ApiProperty)({ description: 'Generic / Salt name of the medicine', required: false }),
    __metadata("design:type", String)
], Medicine.prototype, "genericName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, swagger_1.ApiProperty)({ description: 'Batch code/number' }),
    __metadata("design:type", String)
], Medicine.prototype, "batchNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, swagger_1.ApiProperty)({ description: 'Expiry date of the medicine' }),
    __metadata("design:type", String)
], Medicine.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    (0, swagger_1.ApiProperty)({ description: 'Current available stock quantity' }),
    __metadata("design:type", Number)
], Medicine.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 10 }),
    (0, swagger_1.ApiProperty)({ description: 'Minimum stock safety threshold' }),
    __metadata("design:type", Number)
], Medicine.prototype, "minStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0.00 }),
    (0, swagger_1.ApiProperty)({ description: 'Purchase price (cost price) of the unit' }),
    __metadata("design:type", Number)
], Medicine.prototype, "purchasePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Tablets' }),
    (0, swagger_1.ApiProperty)({ description: 'Category of product: Tablets, Liquids, or Equipments', example: 'Tablets' }),
    __metadata("design:type", String)
], Medicine.prototype, "category", void 0);
exports.Medicine = Medicine = __decorate([
    (0, typeorm_1.Entity)()
], Medicine);
//# sourceMappingURL=medicine.entity.js.map