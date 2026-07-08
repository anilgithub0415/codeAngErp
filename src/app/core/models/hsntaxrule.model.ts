export interface HSNTaxRule{
     hsnCode: string;
    description: string;
    cgstRate?: number;
    sgstRate?: number;
    igstRate?: number;
    [key: string]: any;
}