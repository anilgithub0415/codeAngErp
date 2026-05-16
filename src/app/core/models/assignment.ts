import { AssignmentAttempt } from "./assignment-attempt";
import { AssignmentQuestion } from "./assignment-question";

export interface Assignment {
    id:number;
    tenantId?: string;
    courseOfferingId?: number;
    assignmentName?: string;
    description?: string|null;
    dueDate?: Date;
    visibilityDate?: Date;
    maxScore?: number;
    assignmentType?: string;
    assignmentPurpose?: string;
    isActive?: boolean;
    assignmentAttempts?: AssignmentAttempt[];
    assignmentQuestions?: AssignmentQuestion[];
    quizTimeLimitSeconds?:number;
    questionTimeLimitSeconds?:number;
    createdByUserId?:number;
}
