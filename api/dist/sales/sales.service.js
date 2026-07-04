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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sales_entity_1 = require("./sales.entity");
const medicine_entity_1 = require("../medicines/medicine.entity");
let SalesService = class SalesService {
    constructor(saleRepository, medicineRepository) {
        this.saleRepository = saleRepository;
        this.medicineRepository = medicineRepository;
    }
    async findAll() {
        const list = await this.saleRepository.find({
            relations: ['items'],
            order: { date: 'DESC', time: 'DESC' }
        });
        if (list.length === 0) {
            await this.seedMockSales();
            return this.saleRepository.find({
                relations: ['items'],
                order: { date: 'DESC', time: 'DESC' }
            });
        }
        return list;
    }
    async create(createSaleDto) {
        const count = await this.saleRepository.count();
        const invoiceNo = `INV-${1000 + count + 1}`;
        for (const item of createSaleDto.items) {
            const medicine = await this.medicineRepository.findOneBy({ id: item.medicineId });
            if (!medicine) {
                const alternativeMed = await this.medicineRepository.findOneBy({ name: item.name });
                if (!alternativeMed) {
                    throw new common_1.BadRequestException(`Medicine '${item.name}' not found in inventory.`);
                }
                item.medicineId = alternativeMed.id;
                if (alternativeMed.stock < item.qty) {
                    throw new common_1.BadRequestException(`Insufficient stock for '${item.name}'! Available: ${alternativeMed.stock}`);
                }
                alternativeMed.stock = Math.max(0, alternativeMed.stock - item.qty);
                await this.medicineRepository.save(alternativeMed);
            }
            else {
                if (medicine.stock < item.qty) {
                    throw new common_1.BadRequestException(`Insufficient stock for '${medicine.name}'! Available: ${medicine.stock}`);
                }
                medicine.stock = Math.max(0, medicine.stock - item.qty);
                await this.medicineRepository.save(medicine);
            }
        }
        const sale = new sales_entity_1.Sale();
        sale.invoiceNo = invoiceNo;
        sale.customerName = createSaleDto.customerName || 'Walk-in Customer';
        sale.subtotal = createSaleDto.subtotal;
        sale.discount = createSaleDto.discount || 0.00;
        sale.total = createSaleDto.total;
        sale.date = new Date().toISOString().split('T')[0];
        sale.time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        sale.items = createSaleDto.items.map(itemDto => {
            const item = new sales_entity_1.SaleItem();
            item.medicineId = itemDto.medicineId;
            item.name = itemDto.name;
            item.batchNo = itemDto.batchNo;
            item.salesPrice = itemDto.salesPrice;
            item.qty = itemDto.qty;
            return item;
        });
        return this.saleRepository.save(sale);
    }
    async seedMockSales() {
        const medicines = await this.medicineRepository.find();
        if (medicines.length === 0)
            return;
        const m3 = medicines.find(m => m.name.includes('Atorvastatin')) || medicines[0];
        const m4 = medicines.find(m => m.name.includes('Metformin')) || medicines[0];
        const sale1 = new sales_entity_1.Sale();
        sale1.invoiceNo = 'INV-1001';
        sale1.customerName = 'Amit Sharma';
        sale1.subtotal = 285.00;
        sale1.discount = 15.00;
        sale1.total = 270.00;
        sale1.date = new Date().toISOString().split('T')[0];
        sale1.time = '10:30 AM';
        const item1 = new sales_entity_1.SaleItem();
        item1.medicineId = m3.id;
        item1.name = m3.name;
        item1.batchNo = m3.batchNo;
        item1.salesPrice = m3.purchasePrice;
        item1.qty = 10;
        const item2 = new sales_entity_1.SaleItem();
        item2.medicineId = m4.id;
        item2.name = m4.name;
        item2.batchNo = m4.batchNo;
        item2.salesPrice = m4.purchasePrice;
        item2.qty = 30;
        sale1.items = [item1, item2];
        await this.saleRepository.save(sale1);
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sales_entity_1.Sale)),
    __param(1, (0, typeorm_1.InjectRepository)(medicine_entity_1.Medicine)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SalesService);
//# sourceMappingURL=sales.service.js.map