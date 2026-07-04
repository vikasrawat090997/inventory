export declare class Sale {
    id: string;
    invoiceNo: string;
    customerName: string;
    subtotal: number;
    discount: number;
    total: number;
    date: string;
    time: string;
    items: SaleItem[];
}
export declare class SaleItem {
    id: string;
    medicineId: string;
    name: string;
    batchNo: string;
    salesPrice: number;
    qty: number;
    sale: Sale;
}
