import { Controller, Get, Post, Body, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../users/jwt-auth.guard';
import { SalesService } from './sales.service';
import { Sale } from './sales.entity';
import { CreateSaleDto } from './dto/create-sale.dto';

@ApiTags('sales')
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('export-csv')
  @ApiOperation({ summary: 'Export sales reports as CSV' })
  async exportCsv(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response
  ) {
    const sales = await this.salesService.findAll();
    // Filter sales in date range
    const filteredSales = sales.filter(s => {
      return (!startDate || s.date >= startDate) && (!endDate || s.date <= endDate);
    });

    let csvContent = '\uFEFF'; // Add UTF-8 BOM
    csvContent += 'Date,Time,Invoice ID,Customer Name,Subtotal,Discount,Total\n';

    filteredSales.forEach(s => {
      csvContent += `"${s.date}","${s.time}","${s.invoiceNo}","${s.customerName}",${s.subtotal},${s.discount},${s.total}\n`;
    });

    const filename = `Sales_Report_${startDate || 'start'}_to_${endDate || 'end'}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales history' })
  @ApiResponse({ status: 200, description: 'Return all sales.' })
  findAll(): Promise<Sale[]> {
    return this.salesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Log a new sales transaction and update inventory stock' })
  @ApiResponse({ status: 201, description: 'The sale has been successfully recorded.' })
  create(@Body() createSaleDto: CreateSaleDto): Promise<Sale> {
    return this.salesService.create(createSaleDto);
  }
}
