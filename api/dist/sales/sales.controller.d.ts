import { Response } from 'express';
import { SalesService } from './sales.service';
import { Sale } from './sales.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    exportCsv(startDate: string, endDate: string, res: Response): Promise<Response<any, Record<string, any>>>;
    findAll(): Promise<Sale[]>;
    create(createSaleDto: CreateSaleDto): Promise<Sale>;
}
