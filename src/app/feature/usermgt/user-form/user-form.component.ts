import { CUSTOM_ELEMENTS_SCHEMA, Component, Inject, OnInit, inject } from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms'
import {FormlyFieldConfig, FormlyModule} from '@ngx-formly/core'
import { UserService } from '../../../core/services/user.service';
import { ConfigService } from '../../../config.service';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { AuthService } from '../../../core/services/auth.service';
import { CreateUserDto } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, FormsModule,FormlyModule
    ,CommonModule
  ], 
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class UserFormComponent implements OnInit{
   
  users!:any[];

    form = new FormGroup({});
    model:Partial<CreateUserDto> = {};
    fields: FormlyFieldConfig[]=[];

    private userService=inject(UserService);
    
   private configService=inject(ConfigService);
   private config_usersCreatedby:string='';

    constructor(private authService:AuthService){
      console.log('m in constructor of userform...');
      

    }

    
    ngOnInit(): void {

      //for reading config of system like who will create logins superadmin / signup
      const globalConfigData=this.configService.config;
      
          if(globalConfigData){
              this.config_usersCreatedby=globalConfigData.config_useraddthru;
          }
console.log('ngOninit of user form');

      //getFieldsfrom db
      this.userService.getUsertableFieldsConfig(this.config_usersCreatedby).subscribe((dbFields:any[])=>{

          this.fields = dbFields.map(dbField=>{
            if (dbField.FieldType=='input'){
            return {
              key: dbField.FieldName,
              type: dbField.FieldType,
              props: {
                label:dbField.FieldLabel,
                required: dbField.IsRequired,
                type:dbField.FieldName==='password'?'password':'text'
                
              },


            }
          } 
         else if (dbField.FieldType=='select'){
            return {
              key: dbField.FieldName,
              type: dbField.FieldType,
              props: {
                label:dbField.FieldLabel,
                required: dbField.IsRequired,
               // options:JSON.parse({"label":"DataEntry","value":"DataEntry"})
              // options:[{"label":"DataEntry","value":"DataEntry"},{"label":"purchaserole","value":"purchaserole"}]
               options:JSON.parse(dbField.SelectOptions)
                
              },


            }
          }
          else return {}
          
          })
          console.log(this.fields);
          
      })

      this.getUsers();

    }//ngOnInit


     getUsers(){
      var tid=this.authService.getTenantId();
    this.userService.getUsers(tid!).subscribe(usrs=>{
      this.users=usrs; console.log('usrs:',usrs);
      
    })
  }
  

    onSubmit(){
     if(this.form.valid){
      const createDto: CreateUserDto = {
        userName: this.model.userName!,
        displayName: this.model.displayName,
        password: this.model.password!,
        initialRoleName: this.model.initialRoleName,
        //tenantId: this.authService.getTenantId()!, // Assuming current user's tenant
        isActive: true, // Default to active
        isEmailVerified: false, // Default to not verified
        createdByUserId: 1,//this.authService.currentUserId$,
      //  personId: this.selectedPerson!.id! // Use the ID of the selected/created person
        initialTenantId:   this.authService.getTenantId()

        
        
    };


    console.log('creating user :',createDto);
    
     this.userService.createUser(createDto).subscribe(res=>console.log('User saved successfully!',res)   )
     }
      
    }

}
