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
exports.SaleItem = exports.Sale = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
let Sale = class Sale {
};
exports.Sale = Sale;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, swagger_1.ApiProperty)({ description: 'The unique ID of the sale transaction' }),
    __metadata("design:type", String)
], Sale.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, swagger_1.ApiProperty)({ description: 'Unique Invoice Number (e.g. INV-1001)' }),
    __metadata("design:type", String)
], Sale.prototype, "invoiceNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Walk-in Customer' }),
    (0, swagger_1.ApiProperty)({ description: 'Name of the customer' }),
    __metadata("design:type", String)
], Sale.prototype, "customerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    (0, swagger_1.ApiProperty)({ description: 'Subtotal before discount' }),
    __metadata("design:type", Number)
], Sale.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0.00 }),
    (0, swagger_1.ApiProperty)({ description: 'Applied discount amount' }),
    __metadata("design:type", Number)
], Sale.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    (0, swagger_1.ApiProperty)({ description: 'Grand total paid' }),
    __metadata("design:type", Number)
], Sale.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, swagger_1.ApiProperty)({ description: 'Date of the transaction (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], Sale.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, swagger_1.ApiProperty)({ description: 'Time of the transaction (e.g. 10:30 AM)' }),
    __metadata("design:type", String)
], Sale.prototype, "time", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => SaleItem, (item) => item.sale, { cascade: true }),
    (0, swagger_1.ApiProperty)({ type: () => [SaleItem], description: 'Items included in this invoice' }),
    __metadata("design:type", Array)
], Sale.prototype, "items", void 0);
exports.Sale = Sale = __decorate([
    (0, typeorm_1.Entity)()
], Sale);
let SaleItem = class SaleItem {
};
exports.SaleItem = SaleItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, swagger_1.ApiProperty)({ description: 'The unique ID of the sale item' }),
    __metadata("design:type", String)
], SaleItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, swagger_1.ApiProperty)({ description: 'The related medicine ID' }),
    __metadata("design:type", String)
], SaleItem.prototype, "medicineId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, swagger_1.ApiProperty)({ description: 'Name of the medicine' }),
    __metadata("design:type", String)
], SaleItem.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, swagger_1.ApiProperty)({ description: 'Batch number of the medicine' }),
    __metadata("design:type", String)
], SaleItem.prototype, "batchNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    (0, swagger_1.ApiProperty)({ description: 'Unit retail price' }),
    __metadata("design:type", Number)
], SaleItem.prototype, "salesPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    (0, swagger_1.ApiProperty)({ description: 'Quantity sold' }),
    __metadata("design:type", Number)
], SaleItem.prototype, "qty", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sale, (sale) => sale.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'saleId' }),
    __metadata("design:type", Sale)
], SaleItem.prototype, "sale", void 0);
exports.SaleItem = SaleItem = __decorate([
    (0, typeorm_1.Entity)()
], SaleItem);
//# sourceMappingURL=sales.entity.js.map