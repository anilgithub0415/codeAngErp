
export interface QuestionAssignmentDto {
  id:number;
  AssignmentId:number;
    questionId: number;
    points: number;
  }
  
  /**
   * DTO for creating a new Assignment.
   * This is what your ngx-formly form model should conform to. It contains all
   * required fields, excluding auto-generated fields like `id`, `createdAt`, etc.
   */
  export interface CreateAssignmentDto {
    tenantId: string;
    assignmentName: string;
    description?: string | null;
    dueDate: string; // Using string to match the date input field
    visibilityDate: string; // Using string to match the date input field
    assignmentType:string;
    assignmentQuestions: QuestionAssignmentDto[];
  }
  
  /**
   * DTO for updating an existing Assignment.
   * All fields are optional, which allows for partial updates.
   */
  export type UpdateAssignmentDto = Partial<CreateAssignmentDto>;
  
  /**
   * The full Assignment entity returned by the API after a successful operation.
   * It includes all fields from the create DTO, plus auto-generated fields
   * like `id` and timestamps.
   */
  export interface Assignment {
    id: number;
    tenantId: string;
    assignmentName: string;
    description?: string | null;
    dueDate: Date; // A full Date object is typically returned from the backend
    visibilityDate: Date; // A full Date object is typically returned from the backend
    assignmentType:string;
    courseOfferingId:number;  
    assignmentQuestions: QuestionAssignmentDto[];
    createdAt: Date;
    updatedAt: Date;
    createdByUserId: number;
  }
  