import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CustomerMgrComponent } from './Components/customer-mgr/customer-mgr.component';
import { ClientRequiremnetComponent } from './Components/profile-tabs/ClientRequirement/client-requiremnet/client-requiremnet.component';
import { CustomerLayoutComponent } from './customer-layout/customer-layout.component';
import { KanbanCardComponent } from './kanban/kanban-card/kanban-card.component';
import { DecorativecardComponent } from './kanban/decorativecard/decorativecard.component';
import { KanabanBoardComponent } from './views/kanaban-board/kanaban-board.component';
import { CustomerDirectoryListComponent } from './views/customer-directory-list/customer-directory-list.component';
import { ClientProfileTabsComponent } from './views/client-profile-tabs/client-profile-tabs.component';


const routes: Routes = [
  {
    path: '', // Maps to '/customers'
    component: CustomerLayoutComponent,
    children: [
      {
        path: '', // Maps to '/customers'
        component: CustomerMgrComponent
      },
      {
        path: 'clientRequirements', // Maps to '/customers/clientRequirements'
        component: ClientRequiremnetComponent
      },
      {
        path:'clientKanabanboard',
        component:KanabanBoardComponent
      },{
        path:'clientDirectory',
        component:CustomerDirectoryListComponent
      },
      {
        path:'clientProfile/:id',
        component:ClientProfileTabsComponent
      },
      {
        path:'kanbanCard',
        component:KanbanCardComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerMgtRoutingModule { }
