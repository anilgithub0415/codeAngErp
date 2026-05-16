import { AssignmentAttempt } from "./assignment-attempt";
import { Enrollment } from "./enrollment.interfaces";


export interface StudentProfile {
    id:number; 
    tenantId?: string;
    personId?:number;
    studentIdNumber?:number;
    enrollmentStatus?:string;
    enrollmentDate?:Date;
    enrollments?: Enrollment[];
    assignmentAttempts?: AssignmentAttempt[];

}


export interface CreateStudentprofileDto {
    
    tenantId: string;
    personId:number;
    studentIdNumber?:number;
    enrollmentStatus?:string;
    enrollmentDate:Date;
    

}
