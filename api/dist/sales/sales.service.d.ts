import { Repository } from 'typeorm';
import { Sale } from './sales.entity';
import { Medicine } from '../medicines/medicine.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
export declare class SalesService {
    private readonly saleRepository;
    private readonly medicineRepository;
    constructor(saleRepository: Repository<Sale>, medicineRepository: Repository<Medicine>);
    findAll(): Promise<Sale[]>;
    create(createSaleDto: CreateSaleDto): Promise<Sale>;
    private seedMockSales;
}
