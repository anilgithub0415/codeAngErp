// src/app/shared/models/user-roles.enum.ts

/**
 * Defines the possible roles a user can have within an educational software tenant.
 * These roles control access to features and data.
 *
 * IMPORTANT: This enum MUST EXACTLY match the UserRole enum defined in your
 * backend's src/entity/User.ts file for consistent type checking and data handling.
 */
export enum UserRole {
    INSTITUTE_ADMIN = 'InstituteAdmin',        // Admin role for a specific Institute tenant
    TEACHER = 'Teacher',                       // Standard teacher role
    STUDENT = 'Student',                       // Standard student role
    TEACHER_ADMIN = 'TeacherAdmin',            // Admin role for an Individual Teacher's tenant
    STUDENT_SOLO = 'StudentSolo',              // Role for a student in their own personal learning tenant
    SHARED_ACCESS_TEACHER = 'SharedAccessTeacher', // For teachers granted limited access to an individual student's tenant
    // Add more roles as your application's needs evolve
}