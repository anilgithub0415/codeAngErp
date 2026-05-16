//pending- Before adding as a student ( in usermgt) dont allow to enroll
import { Component, OnInit, AfterViewInit, signal, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DragDropModule } from 'primeng/dragdrop';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';

// Your Application Specific Imports
import { UserService } from '../../../core/services/user.service';
import { User, CreateUserDto, UpdateUserDto, UserRole, urlphrases } from '../../../core/models/user.model';
import { UserContextService } from '../../../core/services/user-context.service';
import { AuthService } from '../../../core/services/auth.service';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { Observable, firstValueFrom, combineLatest, of, from, BehaviorSubject, Subscription, forkJoin, Subject } from 'rxjs';
import { map, switchMap, catchError, shareReplay, distinctUntilChanged, filter, tap, startWith, takeUntil } from 'rxjs/operators';
import { DataScopeService } from '../../../core/services/datascope.service';
import { PersonlistComponent } from '../../people/personlist/personlist.component';
import { Person } from '../../../core/models/person.model';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { FormschemaService } from '../../../core/services/formschema.service';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { ProgramService } from '../../../core/services/program.service';
import { LookupService } from '../../../core/services/lookup.service';
import { FormlySelectModule } from '@ngx-formly/core/select';
import { StudentprofileService } from '../../../core/services/studentprofile.service';
import { StudentProfile, CreateStudentprofileDto } from '../../../core/models/student-profile';
import { Program } from '../../../core/models/program';
import { EnrollService } from '../../../core/services/enroll.service';
import { Course } from '../../../core/models/course.model';
import { CourseService } from '../../../core/services/course.service';
import { CourseOffering } from '../../../core/models/course-offering';
import { CourseofferingService } from '../../../core/services/courseoffering.service';
//import { Enrollment, StudentCourseOffering, CreateStudentEnrollmentDto } from '../../../core/models/enrollment.model';
//import { Enrollment, StudentCourseOffering, CreateStudentEnrollmentDto } from '../../../core/models/enrollment';
import { CreateStudentCourseOfferingDto, CreateStudentEnrollmentDto } from '../../../core/models/enrollment.interfaces';
interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

// Define the model for the enrollment form, including the new dynamic fields
interface EnrollmentFormModel {
    tenantId?: string;
    PersonId?: number;
    studentProfileId?: number;
    ProgramId?: number;
    enrollmentDate?: string;
    completionDate?: string;
    // The model should match the field group key
    courseOfferingsGroup?: { [key: string]: number }; // key: courseId, value: courseOfferingId
}

// This is the model for displaying users in the table,
// adding computed observable properties for permissions.
export interface UserDisplayModel extends User {
  canEdit$: Observable<boolean>;
  canDelete$: Observable<boolean>;
}

@Component({
  selector: 'app-enrollment',
  standalone: true,
  // ... (imports and providers) ...imported yes
imports: [ReactiveFormsModule,FormsModule,FormlyModule,FormlyPrimeNGModule, FormlySelectModule,
      CommonModule,
      FormsModule,
      // PrimeNG Modules
      TableModule,
      ButtonModule,DropdownModule,
      RippleModule,
      ToastModule,
      ToolbarModule,
      InputTextModule,
      InputNumberModule,
      DialogModule,
      TagModule,
      InputIconModule,
      IconFieldModule,
      ConfirmDialogModule,
      DropdownModule, // Added
      CheckboxModule, // Added
      // RatingModule, TextareaModule, SelectModule, RadioButtonModule (removed as not directly applicable to user CRUD)
      NgxPermissionsModule,
      PersonlistComponent
  ],
  providers:[MessageService,ConfirmationService,DatePipe],
  templateUrl: './enrollment.component.html',
  styleUrl: './enrollment.component.scss'
})
export class EnrollmentComponent implements OnInit, OnDestroy {
    activeTenantId!: string | null; private destroy$ = new Subject<void>();

    form = new FormGroup({});
    
    // New model that reflects the enrollment form data structure
    model: EnrollmentFormModel = {};

    formFields!: Observable<FormlyFieldConfig[] | null>;
    enrolls$!: Observable<any[]>;
    
    userDialog: boolean = false;
    submitted: boolean = false;
    
    @ViewChild('dt') dt!: Table;
    cols!: Column[];
    currentUser: any | null = null;
    tenantIdFromusercontext!: string;
    private subscriptions = new Subscription();

    personSelectionDialogVisible: boolean = false;
    selectedPerson: Person | null = null;
    initialPersonSearchCriteria: { email?: string; phone?: string; firstName?: string; lastName?: string; zipCode?: string; } = {};

    constructor(
        private formschemaService: FormschemaService,
        private usercontextService: UserContextService,
        private userService: UserService,
        private studprofileService: StudentprofileService,
        private lookupService: LookupService,
        private programService: ProgramService,
        private courseService: CourseService,
        private courseOfferingService: CourseofferingService,
        private enrollService: EnrollService,
        private messageService: MessageService,
        private permissionsService: NgxPermissionsService,
        private confirmationService: ConfirmationService,
        public authService: AuthService,
        private dataScopeService: DataScopeService,
        private datePipe: DatePipe
    ) {
        this.usercontextService.currentUserProfile$.pipe(
            distinctUntilChanged(),
            filter((cuser: any) => cuser != null),
        ).subscribe(cuser => {
            this.currentUser = cuser;
            this.tenantIdFromusercontext = this.currentUser?.tenantId!;
            this.loadEnrollments();
        });
    } 

    ngOnInit() {
        this.activeTenantId = this.authService.getTenantId();
        this.model.tenantId=this.activeTenantId!;
        this.model.ProgramId = undefined; // Initialize the model

        // this.formFields = this.formschemaService.getFormschema('student-enrollment').pipe(
        //     tap((fields: FormlyFieldConfig[]) => {
        //         console.log('.........fields:',fields);
                
        //         const programField = fields.find((field: any) => field.key === 'ProgramId');
        //         if (programField) {
        //             programField.props = programField.props || {};
        //             programField.props.options = this.lookupService.getPrograms(this.activeTenantId!);
        //             // Setup the dynamic form generation here
        //             this.setupDynamicFormGeneration(fields);
        //         }
        //     }),
        //     (res:any)=> {
                
        //         return res;}
            
        //   );
          this.formschemaService.getFormschema('student-enrollment').pipe(
            takeUntil(this.destroy$)
        ).subscribe((fields: FormlyFieldConfig[]) => {
            const programField = fields.find(field => field.key === 'ProgramId');
            if (programField) {
                programField.props = programField.props || {};
                // Populate the program options once, when the form loads
                programField.props.options = this.lookupService.getPrograms(this.activeTenantId!);
            }
            this.formFields = of(fields);

            setTimeout(() => {

            // This is the correct place to listen for changes to the form's model
            this.setupDynamicFormGeneration(fields);                
            },2000);
        });
    }

    private setupDynamicFormGeneration(initialFields: FormlyFieldConfig[]): void {
      
      
        const programIdControl = this.form.get('ProgramId');

        if (!programIdControl) {
            console.error('aProgramId control not found. Cannot set up dynamic form generation.');
            return;
        }

        // Subscribe to programId changes to dynamically update the form schema
        // this.subscriptions.add(
        //     programIdControl.valueChanges.pipe(
        //         distinctUntilChanged(),
        //         filter((ProgramId) => !!ProgramId),
        //         switchMap((ProgramId) => this.courseService.getCoursesByProgram(ProgramId, this.activeTenantId!)),
        //         switchMap((courses: Course[]) => {
                    
        //             console.log('courses:',courses);
                    
        //             const courseOfferingObservables = courses.map(course => //[0].courseId
        //                 this.courseOfferingService.getCourseOfferingsByCourseId(course.course.id!, this.activeTenantId!)
        //                     .pipe(
        //                         tap(offerings => console.log('Offerings received for course', course.course.id, ':', offerings)), 
        //                      //   switchMap(innerOfferingsObservable => innerOfferingsObservable), 
        //                         map(offerings => ({ course,offerings }))
        //                     )
                
        //             );
        //             return forkJoin(courseOfferingObservables);
        //         })
        //     ).subscribe(courseOfferingsData => {
        //         const courseOfferingFields: FormlyFieldConfig[] = courseOfferingsData.map(data => ( console.log('course:',data.course.course.id, ' its data:',data,' Array.isArray(data.offerings):',Array.isArray(data.offerings),' Array length:',[data.offerings].length ),
        //          {
        //                        //offerings[0].course.courseOfferings[0]
        //                        //offerings[0].course.courseOfferings[0].offeringName
        //                        //offerings[0].offeringName
        //             key: `coursesWithOfferings.${data.course.course.id}`, // Use a unique key like 'coursesWithOfferings.1'
        //             type: 'select',
        //             className: 'col-12 md:col-6',
        //             props: {
        //                 label: `Course: ${data.course.course.courseName}`,
        //                 placeholder: 'Select a Batch',
        //                 required: true,
        //                 options: [data.offerings].map((offering:any) => ({
        //                     label: `${offering.offeringName}` ,           //
        //                     //                           .hasOwnProperty('gender')
        //                     //label: `${offering.offeringName} (${this.datePipe.transform(offering.startDate, 'MMM y')})`,                 
        //                     value: offering.id
        //                 }))
        //             }
        //         }));

        //         // Update the form fields to include the new dynamic fields
        //         this.formFields = of([
        //             ...initialFields,
        //             {
        //                 key: 'courseOfferingsGroup',
        //                 props: { label: 'Course Offerings' },
        //                 fieldGroup: courseOfferingFields,
        //                 hideExpression: '!model.ProgramId'
        //             }
        //         ]);
        //     })
        // );
        // Subscribe to programId changes to dynamically update the form schema
    this.subscriptions.add(
        programIdControl.valueChanges.pipe(
          distinctUntilChanged(),
          filter((programId) => !!programId),
          switchMap((programId) => this.courseService.getCoursesByProgram(programId, this.activeTenantId!)),
          switchMap((courses: Course[]) => {
              
            // If no courses are returned, return an empty forkJoin
            if (!courses || courses.length === 0) {
              return of([]);
            }
  
            const courseOfferingObservables = courses.map(course =>
              this.courseOfferingService.getCourseOfferingsByCourseId(course.course.id, this.activeTenantId!)
              .pipe(
                // Use catchError to handle any API failures gracefully for a single offering call
                catchError((error) => {
                  console.error(`Failed to fetch offerings for course ${course.course.id}:`, error);
                  // FIX HERE: Return an observable that emits an EMPTY ARRAY,
                  // not an object with an empty array.
                  return of([]); 
                }),
                // The map operator now consistently receives an array (either data or empty)
                map(offerings => ({ course, offerings }))
                )
            );
            return forkJoin(courseOfferingObservables);
          })
        ).subscribe(courseOfferingsData => {
          console.log('Final courseOfferingsData:', courseOfferingsData);
  
          const courseOfferingFields: FormlyFieldConfig[] = courseOfferingsData.map(data => {
             
            // This is the FIX: Don't wrap data.offerings in a new array.
            // The data.offerings property should already be the array you need.
            // The '?' in `data.offerings?.map` is a safeguard against null/undefined.

            const offeringOptions = data.offerings?.map((offering: CourseOffering) => ({
              label: `${offering.offeringName}`,
              value: offering.id
            })) || []; // Fallback to an empty array


            return {// FIX HERE: Use a key that is a simple string, e.g., `c${courseId}`
                // This prevents Formly from treating it as an array index.
              key: `courseId_${data.course.course.id}`,
              type: 'select',
              className: 'col-12 md:col-6',
              props: {
                label: `Course: ${data.course.course.courseName}`,
                placeholder: 'Select a Batch',
                required: true,
                options: offeringOptions
              }
            };
          });
  
          // Update the form fields to include the new dynamic fields
          this.formFields = of([
            ...initialFields,
            {
              key: 'courseOfferingsGroup',
              props: { label: 'Course Offerings' },
              fieldGroup: courseOfferingFields,
           //   hideExpression: '!model.ProgramId'
            }
          ]);
        })
      );
    }

    setupCompletionDateCalculation(): void {
        // Your existing completion date calculation logic remains unchanged.
        // It's a good idea to move this logic into a separate method as you've done.
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    get dialogHeader(): string {
        return 'New Enrollment';
    }

    loadEnrollments():void{
  
      // --- MODIFIED: Load users using DataScopeService ---
            // Define the base URL and all possible view permissions for user list
            const userListBasePath = '/enroll'; // Your backend API endpoint for users
            // These are the *permissions* that grant view access to different *types* of users
         //   const userViewPermissions = ['Student', 'Faculty', 'Coordinator', 'InstituteAdmin', 'all', 'createdBySelf'];
         const userViewPermissions = ['Student', 'Faculty', 'Coordinator','AdmissionsOfficer', 'InstituteAdmin','StudentSolo','Assessor','ClassTeacher','ClassStudent'];
      
            this.enrolls$ = this.dataScopeService.getScopedListUrl(
                userListBasePath,
                'enroll.view.', // The prefix for view permissions
                userViewPermissions
            ).pipe(
                switchMap(url => {
                    if (!url) { // If DataScopeService couldn't form a valid URL (e.g., no tenantId)
                        console.warn('No valid URL for user list, returning empty.');
                        return of([]); // Return an empty array
                    }                                 
                                 
                    // Call the userService to fetch data using the constructed URL
                    return this.userService.getUsersByUrl(url).pipe(
                        map((data: User[]) => { // Map backend data to UserDisplayModel
                            return data.map(userBackend => {
                                const userDisplay: UserDisplayModel = {
                                    ...userBackend,
                                    canEdit$:of(true),//this.getCanEditObservable(userBackend),
                                    canDelete$: of(true)//this.getCanDeleteObservable(userBackend)
                                };
                                return userDisplay;
                            });
                        }),
                        catchError(err => {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users with permissions.' });
                            console.error('Error loading scoped users:', err);
                            return of([]); // Return empty array on error
                        })
                    );
                }),
                shareReplay(1) // Cache the last emitted list of users
            );
      
            
            
            // --- END MODIFIED ---
           
      }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew(): void {
        // Reset form model and dialog state
        this.form.reset();
        this.model = {};this.model.tenantId=this.activeTenantId!;
        this.submitted = false;
        this.selectedPerson = null;
        this.initialPersonSearchCriteria = {};
        this.personSelectionDialogVisible = true;
    }

    onPersonSelected(person: Person): void { alert('person selected')
        this.selectedPerson = person;
        this.personSelectionDialogVisible = false;

        // Check for existing student profile or create a new one
        this.studprofileService.getStudentprofile_byIdOrPersonId(person.id!, 'byPersonId', this.activeTenantId!)
            .pipe(
                switchMap(profile => {
                    if (profile) {
                        return of(profile);
                    } else {
                        const newStudentProfile: CreateStudentprofileDto = {
                            tenantId: this.activeTenantId!,
                            personId: person.id!,
                            enrollmentDate: new Date(),
                            enrollmentStatus: 'Enrolled'
                        };
                        return this.studprofileService.createStudentprofile(newStudentProfile);
                    }
                })
            )
            .subscribe({
                next: (profile) => {
                    this.model.studentProfileId = profile.id;
                    this.model.enrollmentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || undefined;
                    
                    this.form.patchValue({ PersonId: person.id});  this.form.patchValue({ StudentProfileId: profile.id});
                    this.form.patchValue({ firstName: person.firstName, lastName:person.lastName});
                    this.userDialog = true;
                },
                error: (error) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create/load student profile.' });
                    console.error('Error in onPersonSelected:', error);
                }
            });
    }

    hideDialog(): void {
        this.userDialog = false;
        this.submitted = false;
        this.personSelectionDialogVisible = false;
    }


    // New helper method to transform the form model into the DTO
    private transformModelToDto(model: any,courseOfferingsMap1:any): CreateStudentEnrollmentDto {
        const studentCourseOfferings: CreateStudentCourseOfferingDto[] = [];
        for (const key in courseOfferingsMap1) {
            const courseOfferingId = courseOfferingsMap1[key];
            // Ensure you have a valid courseOfferingId before pushing
            if (courseOfferingId) {
            studentCourseOfferings.push({
             //   courseOfferingId: model.coursesWithOfferings[courseId],
             courseOfferingId:courseOfferingId,
                studentProfileId: model.studentProfileId,
                assignmentDate: new Date(), // New required field
                status: 'Active' // New required field
            });
        }
    }

        return {
            tenantId: this.activeTenantId!,
            studentProfileId: model.studentProfileId,
            PersonId:this.selectedPerson?.id,
            programId: model.ProgramId!,
            enrollmentDate: model.enrollmentDate || this.datePipe.transform(new Date(), 'yyyy-MM-dd')!,
            status: 'Active',
            completionDate: model.completionDate || undefined,
            studentCourseOfferings: studentCourseOfferings
        };
    }
    
    onSubmit(): void {
        this.model.tenantId=this.activeTenantId!;
        if (!this.form.valid) {
            console.log('form invalid: model',this.model);
            return;
        }
    
        // Now correctly access the coursesWithOfferings object from the model
        if (!this.model.studentProfileId ) {
            console.log('no student profile ');
            return;
        }
        // THIS IS THE KEY CHANGE
    // Assuming your dynamic fields create keys like 'courseOfferingsGroup.courseId_19'
    // in the model, the data is nested under this.model.courseOfferingsGroup.
    const courseOfferingsMap = this.model.courseOfferingsGroup;

    if (!courseOfferingsMap || Object.keys(courseOfferingsMap).length === 0) {
        console.log('No course offerings selected.');
        return;
    }

        const enrollmentData = this.transformModelToDto(this.model,courseOfferingsMap);

          console.log('submitting enrollmentData:',enrollmentData);
          

            this.enrollService.createEnrollment(enrollmentData).subscribe({
                next: (response) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Student enrolled successfully.' });
                    this.hideDialog();
                    this.loadEnrollments();
                },
                error: (error) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to enroll student.' });
                    console.error('Enrollment submission error:', error);
                }
            });
        
    }

  /**
   * Exports the table data to CSV.
   */
  exportCSV(): void {
    this.dt.exportCSV();
}

}
