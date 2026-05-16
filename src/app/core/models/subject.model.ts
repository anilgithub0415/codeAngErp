/**
 * Interface for a new Subject record to be sent to the backend.
 * This DTO includes all required fields for creation but excludes
 * auto-generated fields like `id`, `createdAt`, and `updatedAt`.
 * It also excludes the full related objects (`tenant`, `courses`, `topics`)
 * and instead uses the foreign key ID (`tenantId`).
 */
export interface CreateSubjectDto {
    tenantId: string;
    subjectName: string;
    subjectCode: string;
    isActive?: boolean; // Defaults to true on the backend, but can be specified
  }
  
  /**
   * Interface for updating an existing Subject record.
   * Using `Partial<CreateSubjectDto>` makes all fields optional,
   * allowing you to send only the fields that need to be changed.
   */
  export type UpdateSubjectDto = Partial<CreateSubjectDto>;
  
  /**
   * The complete Subject object received from the backend after
   * a successful creation or when fetching a subject.
   * This DTO includes all database columns, including auto-generated ones.
   */
  export interface Subject {
    id: number;
    tenantId: string;
    subjectName: string;
    subjectCode: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdByUserId:number;
  }