// src/app/models/assignment-attempt.model.ts

/**
 * Represents the data to be submitted for a student's assignment attempt.
 */
export interface AssignmentAttemptSubmit {
    assignmentId: number;
    studentProfileId: number;
    submissionDate: Date;
    studentQuestionAnswers: StudentQuestionAnswerSubmit[];
  }
  
  /**
   * Represents a single question's answer to be submitted.
   */
  export interface StudentQuestionAnswerSubmit {
    questionId: number;
    // Use a union type to allow either a single string or an array of strings
    studentAnswer: string | string[];
  }