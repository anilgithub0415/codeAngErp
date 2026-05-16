
// Helper interfaces for related entities
interface ITopic {
    id: number;
    topicName: string;
    description?: string | null;
}

interface IQuestionType {
    typeName: string;
    description?: string | null;
}

interface IQuestionCategory {
    categoryName: string;
    description?: string | null;
}

interface IQuestionPurpose {
    purposeName: string;
    description?: string | null;
}

// Assumes an Option interface exists for MCQs.
export interface IOption {
    id: number;
    optionText: string;
    isCorrect: boolean;
}
/**
 * DTO for creating a new Question.
 * It contains all required fields, but excludes auto-generated fields like `id`, `createdAt`, `updatedAt`.
 */
export interface CreateQuestionDto {
    tenantId: string;
    questionText: string;
    options?: string | null; // For MCQs, this might be a JSON string of option data or IDs.
    correctAnswer?: string | null;
    defaultPoints?: number | null;
    explanation?: string | null;
    
    // Foreign key properties as strings
    questionTypeName: string;
    questionCategoryName: string;
    questionPurposeName: string;
    topicId?: number | null;

    isActive: boolean;
}

/**
 * DTO for updating an existing Question.
 * All fields are optional because you may only want to update a few properties.
 */
export type UpdateQuestionDto = Partial<CreateQuestionDto>;

/**
 * The full Question object returned by the API after a successful operation.
 * It includes the auto-generated fields and might have relations if they are loaded.
 */

export interface Optionofquestion{
    questionId?:number;
    optionText: string;
    isCorrect: boolean;
    createdAt?:Date;
    updatedAt?:Date;
}
export interface Question {
    id: number;
    tenantId: string;
    
    questionText: string;
    options?: any[]; //string | null;
    correctAnswer?: string | null;
    defaultPoints?: number | null;
    explanation?: string | null;

    questionTypeName: string;
    questionCategoryName: string;
    questionPurposeName: string;
    topicId?: number | null;
    sourceQuestionId?:number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    
    // Optional relations that might be loaded by TypeORM
    tenant?: any;
    questionType?: any;
    questionCategory?: any;
    questionPurpose?: any;
    topic?: any;
    assignmentQuestions?: any;
    questionExamTypes?: any;
    studentQuestionAnswers?: any;
    createdByUserId?:any;

    //added for Assignment Crud
    selected?: boolean;
    orderInAssignment?:number;
    points?:number;
}