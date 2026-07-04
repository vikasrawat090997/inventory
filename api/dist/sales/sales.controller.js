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
exports.SalesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../users/jwt-auth.guard");
const sales_service_1 = require("./sales.service");
const create_sale_dto_1 = require("./dto/create-sale.dto");
let SalesController = class SalesController {
    constructor(salesService) {
        this.salesService = salesService;
    }
    async exportCsv(startDate, endDate, res) {
        const sales = await this.salesService.findAll();
        const filteredSales = sales.filter(s => {
            return (!startDate || s.date >= startDate) && (!endDate || s.date <= endDate);
        });
        let csvContent = '\uFEFF';
        csvContent += 'Date,Time,Invoice ID,Customer Name,Subtotal,Discount,Total\n';
        filteredSales.forEach(s => {
            csvContent += `"${s.date}","${s.time}","${s.invoiceNo}","${s.customerName}",${s.subtotal},${s.discount},${s.total}\n`;
        });
        const filename = `Sales_Report_${startDate || 'start'}_to_${endDate || 'end'}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(csvContent);
    }
    findAll() {
        return this.salesService.findAll();
    }
    create(createSaleDto) {
        return this.salesService.create(createSaleDto);
    }
};
exports.SalesController = SalesController;
__decorate([
    (0, common_1.Get)('export-csv'),
    (0, swagger_1.ApiOperation)({ summary: 'Export sales reports as CSV' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sales history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all sales.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Log a new sales transaction and update inventory stock' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The sale has been successfully recorded.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sale_dto_1.CreateSaleDto]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "create", null);
exports.SalesController = SalesController = __decorate([
    (0, swagger_1.ApiTags)('sales'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sales'),
    __metadata("design:paramtypes", [sales_service_1.SalesService])
], SalesController);
//# sourceMappingURL=sales.controller.js.map