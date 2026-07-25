import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuotationMgrComponent } from './quotation-mgr/quotation-mgr.component';
import { QuotationLayoutComponent } from './quotation-layout/quotation-layout.component';
import { QuotationKanbanBoardComponent } from './views/quotation-kanban-board/quotation-kanban-board.component';
import { QuotationDirectoryListComponent } from './views/quotation-directory-list/quotation-directory-list.component';

const routes: Routes = 
[
  {
    path: '', // Maps to '/customers'
    component: QuotationLayoutComponent,
    children: 
         [
             {path:'', component:QuotationMgrComponent} ,
             {path:'board',component:QuotationKanbanBoardComponent},
             {path:'directory',component:QuotationDirectoryListComponent}
         ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotationRoutingModule { }
