
import { StudentQuestionAnswer } from "./student-question-answer";
export interface CreateAssignmentAttemptDto {
    tenantId: number;
    studentProfileId: number;
    assignmentId: number;
    submissionDate: Date;
    status?: string | null;
    studentQuestionAnswers: any[];
  }
  
  /**
   * DTO for updating an existing AssignmentAttempt.
   * All fields are optional because you may only want to update a few properties,
   * like the score or status, after the initial submission.
   */
  export type UpdateAssignmentAttemptDto = Partial<CreateAssignmentAttemptDto> & {
    score?: number | null;
    status?: string | null;
    feedback?: string | null;
    submissionContentUrl?: string | null;
  };
  
  /**
   * The full AssignmentAttempt object returned by the API.
   * This includes the auto-generated fields and is what you'll typically
   * receive when retrieving an attempt from the backend.
   */
  export interface AssignmentAttempt {
    id: number;
    tenantId: number;
    studentProfileId: number;
    assignmentId: number;
    submissionDate: Date;
    score?: number | null;
    status?: string | null;
    feedback?: string | null;
    submissionContentUrl?: string | null;
    studentQuestionAnswers?: any; // The backend may send a complex object here
    createdAt: Date;
    updatedAt: Date;
  }
  



