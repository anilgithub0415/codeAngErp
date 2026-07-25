import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { PurchaseLayoutComponent } from './purchase-layout/purchase-layout.component';
import { PurchaseKanbanBoardComponent } from './views/purchase-kanban-board/purchase-kanban-board.component';

import { PurchaseKanbanCardComponent } from './kanban/purchase-kanban-card/purchase-kanban-card.component';
import { PurchaseDirectoryListComponent } from './views/purchase-directorylist/purchase-directorylist.component';
import { PurchaseMgrComponent } from './Components/purchase-mgr/purchase-mgr.component';


const routes: Routes = 
[
    {
      path: '', 
      component: PurchaseLayoutComponent,
          children: 
          [
              {path:'', component:PurchaseMgrComponent},
              {
                      path:'board',
                      component:PurchaseKanbanBoardComponent
                    },{
                      path:'directory',
                      component:PurchaseDirectoryListComponent
                    },{
                      path:'card',
                      component:PurchaseKanbanCardComponent
                    },
          ]
          
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseMgtRoutingModule { }
