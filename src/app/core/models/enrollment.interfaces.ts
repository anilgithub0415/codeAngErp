// A DTO for the individual StudentCourseOffering
export interface CreateStudentCourseOfferingDto {
    courseOfferingId: number;
    studentProfileId: number;
    assignmentDate?: Date; // Set a default on the backend
    status?: string; // Set a default on the backend
}

// The main DTO for creating a new enrollment
export interface CreateStudentEnrollmentDto {
    tenantId: string;
    studentProfileId: number;
    PersonId?:number;
    programId: number;
    enrollmentDate: string;
    status: string;
    completionDate?: string;
    studentCourseOfferings: CreateStudentCourseOfferingDto[];
}

// The full Enrollment entity returned from the backend (what the HttpClient expects)
export interface Enrollment {
    id: number;
    tenantId: string;
    studentProfileId: number;
    programId: number;
    enrollmentDate: string;
    status: string;
    completionDate?: string;
    // We expect the full entity with nested studentCourseOfferings
    studentCourseOfferings?: StudentCourseOffering[];
    createdByUserId?: number;
    createdAt: string;
    updatedAt: string;
}

// The full StudentCourseOffering entity returned from the backend
export interface StudentCourseOffering {
    id: number;
    tenantId: string;
    studentProfileId: number;
    courseOfferingId: number;
    assignmentDate: string;
    status: string;
    finalGrade?: number;
    createdAt: string;
    updatedAt: string;
}