import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateNested, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SaleItemDto {
  @ApiProperty({ description: 'The medicine ID', example: 'm1' })
  @IsString()
  @IsNotEmpty()
  medicineId: string;

  @ApiProperty({ description: 'Name of the medicine', example: 'Paracetamol 650mg' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Batch number', example: 'DOL9028' })
  @IsString()
  @IsNotEmpty()
  batchNo: string;

  @ApiProperty({ description: 'Unit retail price', example: 2.00 })
  @IsNumber()
  @Min(0)
  salesPrice: number;

  @ApiProperty({ description: 'Quantity sold', example: 5 })
  @IsNumber()
  @Min(1)
  qty: number;
}

export class CreateSaleDto {
  @ApiProperty({ description: 'Name of the customer', example: 'Amit Sharma', required: false })
  @IsString()
  @IsOptional()
  customerName: string;

  @ApiProperty({ description: 'Subtotal before discount', example: 10.00 })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiProperty({ description: 'Applied discount amount', example: 1.00, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discount: number;

  @ApiProperty({ description: 'Grand total paid', example: 9.00 })
  @IsNumber()
  @Min(0)
  total: number;

  @ApiProperty({ type: [SaleItemDto], description: 'Items included in the invoice' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
