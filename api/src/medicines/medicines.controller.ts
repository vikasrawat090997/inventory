import { Controller, Get, Post, Body, Param, Put, Delete, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../users/jwt-auth.guard';
import { MedicinesService } from './medicines.service';
import { Medicine } from './medicine.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';

@ApiTags('medicines')
@UseGuards(JwtAuthGuard)
@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Get('export-csv')
  @ApiOperation({ summary: 'Export medicines report as CSV' })
  async exportCsv(@Query('type') type: string, @Res() res: Response) {
    const medicines = await this.medicinesService.findAll();
    let csvContent = '\uFEFF'; // Add UTF-8 BOM
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
    } else {
      // Default: Stock report
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

  @Get()
  @ApiOperation({ summary: 'Get all medicines in inventory' })
  @ApiResponse({ status: 200, description: 'Return all medicines.' })
  findAll(): Promise<Medicine[]> {
    return this.medicinesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a medicine by ID' })
  @ApiResponse({ status: 200, description: 'Return a single medicine.' })
  findOne(@Param('id') id: string): Promise<Medicine> {
    return this.medicinesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new medicine to inventory' })
  @ApiResponse({ status: 201, description: 'The medicine has been successfully added.' })
  create(@Body() createMedicineDto: CreateMedicineDto): Promise<Medicine> {
    return this.medicinesService.create(createMedicineDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update medicine details by ID' })
  @ApiResponse({ status: 200, description: 'The medicine has been successfully updated.' })
  update(@Param('id') id: string, @Body() updateFields: Partial<Medicine>): Promise<Medicine> {
    return this.medicinesService.update(id, updateFields);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a medicine from inventory' })
  @ApiResponse({ status: 200, description: 'The medicine has been successfully deleted.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.medicinesService.remove(id);
  }
}
