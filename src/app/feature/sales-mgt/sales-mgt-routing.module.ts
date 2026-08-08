import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SalesLayoutComponent } from './sales-layout/sales-layout.component';
import { SalesKanbanBoardComponent } from './views/sales-kanban-board/sales-kanban-board.component';
import { SalesDirectorylistComponent } from './views/sales-directorylist/sales-directorylist.component';
import { SalesKanbanCardComponent } from './kanban/sales-kanban-card/sales-kanban-card.component';

import { SalesDashboardComponent } from './Dashboard/sales-dashboard/sales-dashboard.component';

const routes: Routes = 
[
    {
      path: '', 
      component: SalesLayoutComponent,
          children: 
          [
              {path:'', component:SalesDashboardComponent},
              {
                      path:'board',
                      component:SalesKanbanBoardComponent
                    }                    ,
                    {
                      path:'directory',
                      component:SalesDirectorylistComponent
                    } ,
                    {
                      path:'card',
                      component:SalesKanbanCardComponent
                    }
          ]
    }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesMgtRoutingModule { }
