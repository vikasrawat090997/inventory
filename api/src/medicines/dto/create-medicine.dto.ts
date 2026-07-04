import { IsString, IsNotEmpty, IsNumber, IsPositive, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicineDto {
  @ApiProperty({ description: 'Name of the medicine', example: 'Paracetamol 650mg' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Generic / Salt name of the medicine', example: 'Paracetamol', required: false })
  @IsString()
  @IsOptional()
  genericName?: string;

  @ApiProperty({ description: 'Batch code/number', example: 'BAT9018' })
  @IsString()
  @IsNotEmpty()
  batchNo: string;

  @ApiProperty({ description: 'Expiry date (YYYY-MM-DD)', example: '2026-12-31' })
  @IsString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiProperty({ description: 'Current available stock quantity', example: 100 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ description: 'Minimum stock safety threshold', example: 10 })
  @IsNumber()
  @Min(0)
  minStock: number;

  @ApiProperty({ description: 'Purchase price (cost price) of the unit', example: 1.50 })
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiProperty({ description: 'Category of medicine', example: 'Tablets', required: false })
  @IsString()
  @IsOptional()
  category?: string;
}
