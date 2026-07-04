export declare class SaleItemDto {
    medicineId: string;
    name: string;
    batchNo: string;
    salesPrice: number;
    qty: number;
}
export declare class CreateSaleDto {
    customerName: string;
    subtotal: number;
    discount: number;
    total: number;
    items: SaleItemDto[];
}
