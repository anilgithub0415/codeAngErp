export interface StudentQuestionAnswer {
    id:number;
    tenantId?: number
    assignmentAttemptId?: number;
    questionId?: number;
    studentAnswerContent?: string;
    isCorrect?: boolean;
    scoreEarned?: number;
    teacherFeedback?: string;
    
}
