/**
 * DTO for creating a new Course.
 * This is what your ngx-formly form model should conform to.
 * It contains all required fields, but excludes auto-generated fields like `id`, `createdAt`, `updatedAt`.
 */
export interface CreateCourseDto {
    tenantId: number;
    courseCode: string;
    courseName: string;
    description?: string | null;
    credits?: number | null;
    subjectId: number;
    isActive: boolean;
  }
  
  /**
   * DTO for updating an existing Course.
   * All fields are optional because you may only want to update a few properties.
   */
  export type UpdateCourseDto = Partial<CreateCourseDto>;
  
  /**
   * The full Course object returned by the API after a successful operation.
   * It includes the auto-generated fields and might have relations if they are loaded.
   */
  export interface Course {
    id: number;
    tenantId: number;
    course?:any;courseOfferings?:any;
    courseCode: string;
    courseName: string;
    description?: string | null;
    credits?: number | null;
    subjectId: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdByUserId:number;
  }