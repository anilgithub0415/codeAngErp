// --- DTOs for API Requests ---
// Use this interface when creating a new ProgramCourse.
// It contains only the fields the user is allowed to set.
export interface CreateProgramCourseDto {
    programId: number;
    courseId: number;
    tenantId: string;
    orderInProgram?: number;
}

// Use this interface when updating an existing ProgramCourse.
// Typically includes an ID and allows for optional fields for partial updates.
export interface UpdateProgramCourseDto {
    id: number;
    programId?: number; // Optional if not changing the parent program
    courseId?: number;  // Optional if not changing the course
    tenantId?: string;
    orderInProgram?: number;
}


// --- API Response Interfaces ---
// The full ProgramCourse entity as it's returned from the backend.
// Note the `?` on the relationships, as they might not be included in every API call.
export interface ProgramCourse {
    id: number;
    tenantId: string;
    programId: number;
    courseId: number;
    orderInProgram?: number | null;
    createdAt: string; // Dates are often sent as strings from the API
    updatedAt: string;

    // These are the related entities, which may be included depending on the API call (e.g., eager loading)
    program?: {
        id: number;
        programName: string;
        // ... other Program properties
    };
    course?: {
        id: number;
        courseName: string;
        // ... other Course properties
    };
    tenant?: {
        id: string;
        // ... other Tenant properties
    };

    createdByUserId?:number;
}