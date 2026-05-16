import { Component } from '@angular/core';
import { UserContextService } from '../../../core/services/user-context.service';
import { distinctUntilChanged, filter } from 'rxjs';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  currentUser: User | null = null; 
  constructor(
    private usercontextService:UserContextService){
      this.usercontextService.currentUserProfile$.pipe(
        distinctUntilChanged(),
        filter((cuser:any) => cuser!=null),
      ).subscribe(cuser=>{
              this.currentUser=cuser; 
              
             
     })
    }
}
