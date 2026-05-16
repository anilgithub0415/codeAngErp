// //pending-
// //this might not be using currently, if yes delete this file
// import { Program } from "./program";
// import { StudentProfile } from "./student-profile";

// export interface Enrollment {
//     id:number;
//     tenantId?: string;
//     studentProfileId?: number;
    
//     programId?: number;
//     enrollmentDate?: Date;
//     status?: string;
//     completionDate?: Date;
    
// }

// export interface CreateEnrollmentDto{
//     tenantId?: string;
//     studentProfileId?: number;
//     program?: Program;
//     programId: number;
//     enrollmentDate?: string;
//     status?: string;
//     completionDate?: string;
//     createdByUserId?:number;
//     studentCourseOfferings:any[]
// }

// export type UpdateEnrollmentDto = Partial<Omit<Enrollment, 'id' | 'tenantId'>> & {
//      // TenantId typically not changed via a standard update DTO.
    
// };



// export interface StudentCourseOffering{
//     courseOfferingId: number;
//     studentProfileId: number;
//     programId:number
// }

// export interface CreateStudentEnrollmentDto{
//     tenantId?:string;
//     PersonId?:number;
//     studentProfileId: number;
//     programId: number;
//     enrollmentDate: string;
//     status?:string;
//     completionDate?: string;
//     studentCourseOfferings:any[]
// }