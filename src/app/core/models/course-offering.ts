// import { Assignment } from "./assignment";

// export interface CourseOffering {
//     id:number;
//     tenantId?: number
//     courseId?: number;
//     facultyProfileId?: number;
//     offeringName?: string;
//     startDate?: Date;
//     endDate?: Date;
//     schedule?: string;
//     location?: string;
//     capacity?: number;
//     enrolledStudentsCount?: number;
//     isActive?: boolean;
//     assignments?: Assignment[];

// }
/**
 * Interface for a new CourseOffering record to be sent to the backend.
 * This DTO includes all required fields for creation but excludes
 * auto-generated fields like `id`, `createdAt`, and `updatedAt`.
 * It also excludes the full related objects (`tenant`, `course`, `faculty`)
 * and instead uses their foreign key IDs (`tenantId`, `courseId`, `facultyProfileId`).
 */
export interface CreateCourseOfferingDto {
    tenantId: number;
    courseId: number;
    facultyProfileId?: number | null; // Nullable if instructor can be assigned later
    offeringName: string;
    startDate?: Date | null;
    endDate?: Date | null;
    schedule?: string | null;
    location?: string | null;
    capacity?: number | null;
    isActive?: boolean; // Defaults to true on the backend, but can be specified
  }
  
  /**
   * Interface for updating an existing CourseOffering record.
   * Using `Partial<CreateCourseOfferingDto>` makes all fields optional,
   * allowing you to send only the fields that need to be changed.
   */
  export type UpdateCourseOfferingDto = Partial<CreateCourseOfferingDto>;
  
  /**
   * The complete CourseOffering object received from the backend after
   * a successful creation or when fetching a course offering.
   * This DTO includes all database columns, including auto-generated ones.
   * Related collections like `assignments` and `studentCourseOfferings` are
   * omitted here as they are typically fetched separately or are large.
   */
  export interface CourseOffering {
    id: number;
    tenantId: number;
    courseId: number;
    facultyProfileId: number | null;
    offeringName: string;
    startDate: Date | null;
    endDate: Date | null;
    schedule: string | null;
    location: string | null;
    capacity: number | null;
    enrolledStudentsCount: number | null; // Denormalized count, managed by backend
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdByUserId:number;
  }
  