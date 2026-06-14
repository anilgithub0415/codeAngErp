import { AssignmentAttempt } from "./assignment-attempt";
import { Enrollment } from "./enrollment.interfaces";


export interface StudentProfile {
    id:number; 
    tenantId?: number
    personId?:number;
    studentIdNumber?:number;
    enrollmentStatus?:string;
    enrollmentDate?:Date;
    enrollments?: Enrollment[];
    assignmentAttempts?: AssignmentAttempt[];

}


export interface CreateStudentprofileDto {
    
    tenantId: number;
    personId:number;
    studentIdNumber?:number;
    enrollmentStatus?:string;
    enrollmentDate:Date;
    

}
