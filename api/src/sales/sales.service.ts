import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale, SaleItem } from './sales.entity';
import { Medicine } from '../medicines/medicine.entity';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
  ) {}

  async findAll(): Promise<Sale[]> {
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

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const count = await this.saleRepository.count();
    const invoiceNo = `INV-${1000 + count + 1}`;

    // Validate stock and deduct inventory levels
    for (const item of createSaleDto.items) {
      const medicine = await this.medicineRepository.findOneBy({ id: item.medicineId });
      if (!medicine) {
        // Fallback search by name if ID was local mock code
        const alternativeMed = await this.medicineRepository.findOneBy({ name: item.name });
        if (!alternativeMed) {
          throw new BadRequestException(`Medicine '${item.name}' not found in inventory.`);
        }
        item.medicineId = alternativeMed.id; // Map back to true MySQL UUID
        
        if (alternativeMed.stock < item.qty) {
          throw new BadRequestException(`Insufficient stock for '${item.name}'! Available: ${alternativeMed.stock}`);
        }
        alternativeMed.stock = Math.max(0, alternativeMed.stock - item.qty);
        await this.medicineRepository.save(alternativeMed);
      } else {
        if (medicine.stock < item.qty) {
          throw new BadRequestException(`Insufficient stock for '${medicine.name}'! Available: ${medicine.stock}`);
        }
        medicine.stock = Math.max(0, medicine.stock - item.qty);
        await this.medicineRepository.save(medicine);
      }
    }

    // Map DTO to Entity
    const sale = new Sale();
    sale.invoiceNo = invoiceNo;
    sale.customerName = createSaleDto.customerName || 'Walk-in Customer';
    sale.subtotal = createSaleDto.subtotal;
    sale.discount = createSaleDto.discount || 0.00;
    sale.total = createSaleDto.total;
    sale.date = new Date().toISOString().split('T')[0];
    sale.time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    sale.items = createSaleDto.items.map(itemDto => {
      const item = new SaleItem();
      item.medicineId = itemDto.medicineId;
      item.name = itemDto.name;
      item.batchNo = itemDto.batchNo;
      item.salesPrice = itemDto.salesPrice;
      item.qty = itemDto.qty;
      return item;
    });

    return this.saleRepository.save(sale);
  }

  private async seedMockSales() {
    const medicines = await this.medicineRepository.find();
    if (medicines.length === 0) return; // Cannot seed sales if no medicines exist

    const m3 = medicines.find(m => m.name.includes('Atorvastatin')) || medicines[0];
    const m4 = medicines.find(m => m.name.includes('Metformin')) || medicines[0];

    const sale1 = new Sale();
    sale1.invoiceNo = 'INV-1001';
    sale1.customerName = 'Amit Sharma';
    sale1.subtotal = 285.00;
    sale1.discount = 15.00;
    sale1.total = 270.00;
    sale1.date = new Date().toISOString().split('T')[0];
    sale1.time = '10:30 AM';

    const item1 = new SaleItem();
    item1.medicineId = m3.id;
    item1.name = m3.name;
    item1.batchNo = m3.batchNo;
    item1.salesPrice = m3.purchasePrice;
    item1.qty = 10;

    const item2 = new SaleItem();
    item2.medicineId = m4.id;
    item2.name = m4.name;
    item2.batchNo = m4.batchNo;
    item2.salesPrice = m4.purchasePrice;
    item2.qty = 30;

    sale1.items = [item1, item2];
    await this.saleRepository.save(sale1);
  }
}
