export enum RequirementFrequency {
  ONE_TIME = "One Time",
  WEEKLY = "Weekly",
  MONTHLY = "Monthly",
  REGULAR = "Regular",
  CONTRACT = "Contract"
}

export interface IClientRequirementItem {
  id?: number;
  clientRequirementId?: number;
  productCategory: string;
  productName: string;
  approxQuantity: number;
  unit: string;
  frequency: RequirementFrequency;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IClientRequirement {
  id?: number;
  tenantId: number;
  specialRequirement: string | null;
  packingRequirement: string | null;
  deliveryRequirement: string | null;
  expectedBudget: number;
  monthlyBudget: number;
  remarksNotes: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  items: IClientRequirementItem[];
}
