import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseComponent } from './course/course.component';
import { SubjectComponent } from './subject/subject.component';
import { ProgramComponent } from './program/program.component';
import { CourseOfferingComponent } from './course-offering/course-offering.component';
import { ProgramcourseComponent } from './programcourse/programcourse.component';

const routes: Routes = [
  {path:'',component:CourseOfferingComponent},
  {path:'subject',component:SubjectComponent},
  {path:'course',component:CourseComponent},
  {path:'program',component:ProgramComponent},
  {path:'programcourse',component:ProgramcourseComponent},
  {path:'courseoffering',component:CourseOfferingComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoursemgtRoutingModule { }
