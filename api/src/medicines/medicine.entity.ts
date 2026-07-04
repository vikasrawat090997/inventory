import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Medicine {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique ID of the medicine' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Name of the medicine' })
  name: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Generic / Salt name of the medicine', required: false })
  genericName?: string;

  @Column()
  @ApiProperty({ description: 'Batch code/number' })
  batchNo: string;

  @Column({ type: 'date' })
  @ApiProperty({ description: 'Expiry date of the medicine' })
  expiryDate: string;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ description: 'Current available stock quantity' })
  stock: number;

  @Column({ type: 'int', default: 10 })
  @ApiProperty({ description: 'Minimum stock safety threshold' })
  minStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  @ApiProperty({ description: 'Purchase price (cost price) of the unit' })
  purchasePrice: number;

  @Column({ default: 'Tablets' })
  @ApiProperty({ description: 'Category of product: Tablets, Liquids, or Equipments', example: 'Tablets' })
  category: string;
}
