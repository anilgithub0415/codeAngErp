
/**
 * DTO for creating a new Program.
 * This is what your ngx-formly form model should conform to.
 * It contains all required fields, but excludes auto-generated fields like `id`, `createdAt`, `updatedAt`.
 */
export interface CreateProgramDto {
    tenantId?: string;
    programName?:string;
    programCode?:string;
    description?:string;
    durationMonths:number;
    targetExam?:string;
    isActive:boolean;
  }
  
  /**
   * DTO for updating an existing Program.
   * All fields are optional because you may only want to update a few properties.
   */
  export type UpdateProgramDto = Partial<CreateProgramDto>;
  
export interface Program {
    id:number;
    tenantId?: string;
    programName?:string;
    programCode?:string;
    description?:string;
    durationMonths:number;
    targetExam?:string;
    isActive:boolean;
    createdAt: Date;
    updatedAt: Date;
    createdByUserId:number;

}
