import { Product, CreateProductDto } from './product.model';

export interface Variant {
	id?: number;
	sku?: string | null;
	variantName: string;
	basePrice: number;
	customAttributes?: any;
	conversionFactor: number; // base units (e.g., grams) per variant unit
	currentStockBaseUnits?: number; // stored in base units (grams)
	createdByUserId?: number;
	[key: string]: any;
}

export interface ProductWithVariantsDto {
	product: Product;
	variants: Variant[];
	[key: string]: any;
}

export interface CreateProductWithVariantsDto {
	tenantId: number ;
	product: CreateProductDto;
	variants?: Partial<Variant>[];
	[key: string]: any;
}
