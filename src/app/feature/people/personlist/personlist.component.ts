
import { Component, OnInit,AfterViewInit, signal, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyModule } from '@ngx-formly/core';
//import { Observable, firstValueFrom } from 'rxjs'; // For handling Observable to Promise conversion

// PrimeNG Modules
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DragDropModule } from 'primeng/dragdrop';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber'; // For numerical IDs if needed
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown'; // For selecting roles
import { CheckboxModule } from 'primeng/checkbox'; // For isActive

// Your Application Specific Imports
//import { UserService } from '../../../core/services/user.service'; // Angular-side UserService
//import { User, CreateUserDto, UpdateUserDto, UserRole, urlphrases } from '../../../core/models/user.model'; // User interfaces/DTOs

//import { UserContextService } from '../../../core/services/user-context.service';
//import { AuthService } from '../../../core/services/auth.service';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { Observable, firstValueFrom,combineLatest, of, from, BehaviorSubject } from 'rxjs';
import { map, switchMap, catchError, shareReplay , debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DataScopeService } from '../../../core/services/datascope.service';
import { CreatePersonDto, Person, UpdatePersonDto } from '../../../core/models/person.model';
import { PersonService } from '../../../core/services/person.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';

                                                     // or import from backend entity if convenient.

// Interfaces for PrimeNG Table columns
interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface PersonTableColumn {
    title: string;
    dataKey: string;
}


// This is the model for displaying users in the table,
// adding computed observable properties for permissions.
export interface PersonDisplayModel extends Person {
    // canEdit$: Observable<boolean>;
    // canDelete$: Observable<boolean>;
}
interface PrimeNgDropdownOption {
    label: string; // Display label in dropdown
    value: string; // Actual enum value
}

// Define an extended UserFormModel that includes all possible fields needed for the form
// and frontend-only flags.
interface PersonFormModel extends Partial<Person> { // Partial<User> makes all User fields optional
  firstName?:string;
  lastName?:string;
  contactEmail?:string;
  contactPhone?:string;
  dateOfBirth?:Date;
  gender?:string;
  addressLine1?:string;
  addressLine2?:string;
  city?:string;
  state?:string;
  zipCode?:string;
  country?:string;    
}
interface PersonFormModel extends Partial<Person> { // Partial<Person> makes all Person fields optional
    firstName?:string;
    lastName?:string;
    contactEmail?:string;
    contactPhone?:string;
    dateOfBirth?:Date;
    gender?:string;
    addressLine1?:string;
    addressLine2?:string;
    city?:string;
    state?:string;
    zipCode?:string;
    country?:string;  
}

@Component({
  selector: 'app-personlist',
  standalone: true,
  // ... (imports and providers) ...imported yes
imports: [ReactiveFormsModule,FormsModule,FormlyModule,FormlyPrimeNGModule, 
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
      NgxPermissionsModule
  ],
providers:[MessageService,ConfirmationService],
  templateUrl: './personlist.component.html',
  styleUrl: './personlist.component.scss'
})
export class PersonlistComponent implements OnInit{
    

    //if this component is displayed from usermgt only 3 fields are showing while adding new person firstName, lastName,contactEmail
     // Input property to indicate if this component is used within User Management
    @Input() fromUserMgt: boolean = false;
    // Input for initial search criteria when opened from User Management
    @Input() initialSearchCriteria: { email?: string; phone?: string; firstName?: string; lastName?: string; zipCode?: string; } = {};
    // Output event to emit the selected or newly created Person object
    @Output() personSelected = new EventEmitter<Person>();

  //  isButtonDisabled$!: Observable<boolean>;
  persons$!: Observable<PersonDisplayModel[]>;
 filteredPersons$!: Observable<PersonDisplayModel[]>; // For filtered list in selection mode
    private searchTerms = new BehaviorSubject<string>(''); // For search input

    personDialog: boolean = false;
    persons = signal<PersonDisplayModel[]>([]);//persons = signal<User[]>([]);
    person: PersonFormModel = {}; // <--- THIS IS CRUCIAL: Type is UserFormModel now
    selectedUsers: Person[] | null = null;
    submitted: boolean = false;
    userRoles: PrimeNgDropdownOption[] = [];
    @ViewChild('dt') dt!: Table;
    exportColumns!: PersonTableColumn[];
    cols!: Column[];

    searchTerm: string = ''; // Unified search input for selection mode
    canCloseSearch:boolean=false;    
    constructor(
      // private usercontextService:UserContextService,
       private personService: PersonService,
       private messageService: MessageService,
      // private permissionsService: NgxPermissionsService, 
      // private confirmationService: ConfirmationService,
       public authService:AuthService,
      private dataScopeService:DataScopeService
  
  ) { }

    ngOnInit(): void {
        this.loadPersons();

        this.filterbysearchtems();

        
    }

    filterbysearchtems(){
         // Initialize filteredPersons$ for search functionality
         this.filteredPersons$ = combineLatest([
            this.persons$,
            this.searchTerms.pipe(debounceTime(300), distinctUntilChanged())
        ]).pipe(
            map(([persons, term]) => {
                if (!term) {
                    return persons;
                }
                term = term.toLowerCase();
                return persons.filter(p =>
                    (p.firstName && p.firstName.toLowerCase().startsWith(term[0])) || // Match first char of firstName
                    (p.lastName && p.lastName.toLowerCase().startsWith(term[0])) ||   // Match first char of lastName
                    (p.contactEmail && p.contactEmail.toLowerCase().includes(term)) || // Match contactEmail
                    (p.contactPhone && p.contactPhone.includes(term)) ||              // Match phone number
                    (p.zipCode && p.zipCode.includes(term))                           // Match zipCode
                );
            })
        );

        // Apply initial search criteria if provided (when opened from UserMgt)
        if (this.fromUserMgt && Object.keys(this.initialSearchCriteria).length > 0) {
            this.applyInitialSearch();
        }
    }
    
    applyInitialSearch(): void {
        const criteria = this.initialSearchCriteria;
        let combinedSearchTerm = '';

        if (criteria.email) {
            combinedSearchTerm += criteria.email;
        }
        if (criteria.phone) {
            combinedSearchTerm += (combinedSearchTerm ? ' ' : '') + criteria.phone;
        }
        if (criteria.firstName && criteria.lastName) {
            combinedSearchTerm += (combinedSearchTerm ? ' ' : '') + criteria.firstName[0] + criteria.lastName[0];
        } else if (criteria.firstName) {
            combinedSearchTerm += (combinedSearchTerm ? ' ' : '') + criteria.firstName[0];
        } else if (criteria.lastName) {
            combinedSearchTerm += (combinedSearchTerm ? ' ' : '') + criteria.lastName[0];
        }
        if (criteria.zipCode) {
            combinedSearchTerm += (combinedSearchTerm ? ' ' : '') + criteria.zipCode;
        }

        this.searchTerm = combinedSearchTerm.trim();
        this.searchTerms.next(this.searchTerm);
    }


   // --- New Getters to simplify HTML conditions ---
   get dialogHeader(): string {
    return (this.person && this.person.id) ? 'Edit Person' : 'New Person'; // Direct access to person.id
}

get isExistingPerson(): boolean {
    return !!this.person && typeof this.person.id !== 'undefined'; // Direct access to person.id
}

 loadPersons():void{
   // --- MODIFIED: Load Persons using DataScopeService ---
          // Define the base URL and all possible view permissions for Person list
          const personListBasePath = '/person'; // Your backend API endpoint for persons
          // These are the *permissions* that grant view access to different *types* of persons
       //   const personViewPermissions = ['Student', 'Faculty', 'Coordinator', 'InstituteAdmin', 'all', 'createdBySelf'];
       const personViewPermissions = ['Student', 'Faculty', 'Coordinator','AdmissionsOfficer', 'InstituteAdmin','StudentSolo','Assessor','ClassTeacher','ClassStudent'];
         
          this.persons$ = this.personService.getPersons().pipe(
            (res:any)=> {return res;}
          );
  
          
          
          // --- END MODIFIED ---
         
   }

   onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onSearchInput(event: Event): void {
        this.searchTerms.next((event.target as HTMLInputElement).value);
    } 

    openNew(): void {
       

        //pending tag:defaultrolefornewuser: default role must be depend on tenantype like below
        // for Institute - InstititeAdmin
        // for Individual_Student - Student_Solo
        // for Individual+Teacher - Teacher
        // Initialize with default values for a new user, and set passwordChange flag
        this.person = { };//UserRole.STUDENT
     
        this.submitted = false;
        this.personDialog = true;
    }

    editPerson(person: Person): void {
       
        // Create a copy and add the passwordChange flag for UI
         this.person = { ...person }; // Create a copy for editing
         this.submitted = false;
        this.personDialog = true;
    }

    hideDialog(): void {
        this.personDialog = false;
        this.submitted = false;
    }

    savePerson(): void {
        
        this.submitted = true;

        // Basic form validation for required fields
        if (typeof this.person.firstName === 'string' && this.person.firstName.trim()  ) { 
               
            if (this.isExistingPerson) { // Existing person - Perform Update
                            
                const personId = this.person.id!; // 'id' is guaranteed for existing persons via isExistingPerson
                const updateDto: UpdatePersonDto = {
                    firstName: this.person.firstName,
                    lastName: this.person.lastName,
                    contactEmail: this.person.contactEmail,
                    contactPhone:this.person.contactPhone,
                    dateOfBirth:this.person.dateOfBirth,
                    gender:this.person.gender,
                    addressLine1:this.person.addressLine1,
                    addressLine2:this.person.addressLine2,
                    city:this.person.city,
                    state:this.person.state,
                    zipCode:this.person.zipCode,
                    country:this.person.zipCode,
                };
                
       
                this.personService.updatePerson(personId, updateDto).subscribe({
                    next: (updatedPerson) => {
                        this.loadPersons()//this.loadPersons(this.currentPerson?.tenantId!);
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Person Updated', life: 3000 });
                        this.personDialog = false;
                        this.person = {};
                    },
                    error: (err) => {
                        console.error('Error updating person:', err);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to update person. ${err.error?.message || ''}`, life: 3000 });
                    }
                });
            } else { // New person - Perform Create


                //finding logged in personId for createdByPersonid updating
                var personId=this.authService.getUserId();
                var isLoggedIn=this.authService.isLoggedIn(); 
                if(!personId && isLoggedIn){ //pendng- need here some changes, while regiering this code was adjusted
                    throw new Error('Failed to find Logged in personId . isLoggedIn'+isLoggedIn);
                }
          
          
                const createDto: CreatePersonDto = {
                    firstName: this.person.firstName!,
                    lastName: this.person.lastName,
                    contactEmail:this.person.contactEmail,
                    contactPhone:this.person.contactPhone,
                    dateOfBirth:this.person.dateOfBirth,
                    gender:this.person.gender,
                    addressLine1:this.person.addressLine1,
                    addressLine2:this.person.addressLine2,
                    city:this.person.city,
                    state:this.person.state,
                    zipCode:this.person.zipCode,
                    country:this.person.zipCode,
                  //  CreatedByUserId:personId
                };

                

                this.personService.createPerson(createDto).subscribe({
                    next: (createdPerson) => { this.searchTerms.next(createdPerson.firstName?.toString()!); console.log('.........is it really getting called after add person?',createdPerson.firstName?.toString());
                    
                       this.loadPersons();// this.loadPersons(this.currentPerson?.tenantId!);
                       this.searchTerms.next(createDto.firstName!)
                       this.filterbysearchtems()
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Person Created', life: 3000 });
                        this.personDialog = false;
                        this.person = {};
                    },
                    error: (err) => {
                        console.error('Error creating person:', err);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to create person. ${err.error?.message || ''}`, life: 3000 });
                    }
                });
            }
        } else {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.', life: 3000 });
        }
    }
    
selectPerson(person: Person): void { 
        this.personSelected.emit(person); // Emit the selected person
        this.canCloseSearch=true;
    }
    getSeverity(isActive: boolean): string {
        return isActive ? 'success' : 'danger';
    }

    /**
     * Exports the table data to CSV.
     */
    exportCSV(): void {
        this.dt.exportCSV();
    }

}
