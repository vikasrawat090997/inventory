import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique ID of the sale transaction' })
  id: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'Unique Invoice Number (e.g. INV-1001)' })
  invoiceNo: string;

  @Column({ default: 'Walk-in Customer' })
  @ApiProperty({ description: 'Name of the customer' })
  customerName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ description: 'Subtotal before discount' })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  @ApiProperty({ description: 'Applied discount amount' })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ description: 'Grand total paid' })
  total: number;

  @Column({ type: 'date' })
  @ApiProperty({ description: 'Date of the transaction (YYYY-MM-DD)' })
  date: string;

  @Column()
  @ApiProperty({ description: 'Time of the transaction (e.g. 10:30 AM)' })
  time: string;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  @ApiProperty({ type: () => [SaleItem], description: 'Items included in this invoice' })
  items: SaleItem[];
}

@Entity()
export class SaleItem {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique ID of the sale item' })
  id: string;

  @Column()
  @ApiProperty({ description: 'The related medicine ID' })
  medicineId: string;

  @Column()
  @ApiProperty({ description: 'Name of the medicine' })
  name: string;

  @Column()
  @ApiProperty({ description: 'Batch number of the medicine' })
  batchNo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ description: 'Unit retail price' })
  salesPrice: number;

  @Column({ type: 'int' })
  @ApiProperty({ description: 'Quantity sold' })
  qty: number;

  @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'saleId' })
  sale: Sale;
}
