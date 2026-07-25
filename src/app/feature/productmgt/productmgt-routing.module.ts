import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProductCategoryComponent } from './product-category/product-category.component';
import { ProductMasterMgrComponent } from './Components/product-master-mgr/product-master-mgr.component';
import { ProductUomConversionComponent } from '../../shared/components/product-uom-conversion/product-uom-conversion.component';
import { ProductLayoutComponent } from './product-layout/product-layout.component';


import { ProductKanbanboardComponent } from './views/productkanbanboard/productkanbanboard.component';
import { ProductDirectoryListComponent } from './views/productdirectorylist/productdirectorylist.component';
import { ProductKanbanCardComponent } from './kanban/product-kanban-card/product-kanban-card.component';



const routes: Routes = 
[
    {
      path: '', 
      component: ProductLayoutComponent,
          children: 
          [
              {path:'pm',component:ProductMasterMgrComponent},
              {
                      path:'productKanabanboard',
                      component:ProductKanbanboardComponent
                    },{
                      path:'productDirectory',
                      component:ProductDirectoryListComponent
                    },
              {path:'productcategory',component:ProductCategoryComponent},
              {path:'UOMConversion',component:ProductUomConversionComponent},
              {path:'kanbancard',component:ProductKanbanCardComponent},

          ]
    }
  ]          

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductmgtRoutingModule { }
