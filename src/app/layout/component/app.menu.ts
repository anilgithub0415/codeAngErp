import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'UI Components',
                items: [
                    { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/app/uikit/formlayout'] },
                    { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/app/uikit/input'] },
                    { label: 'Button', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/app/uikit/button'] },
                    { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/app/uikit/table'] },
                    { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/app/uikit/list'] },
                    { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/app/uikit/tree'] },
                    { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/app/uikit/panel'] },
                    { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/app/uikit/overlay'] },
                    { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/app/uikit/media'] },
                    { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/app/uikit/menu'] },
                    { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/app/uikit/message'] },
                    { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/app/uikit/file'] },
                    { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/app/uikit/charts'] },
                    { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/app/uikit/timeline'] },
                    { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/app/uikit/misc'] }
                ]
            },
            {
                label: 'Pages',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Landing',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/']
                    },


                    {
                        label: 'Public',
                        icon: 'pi pi-fw pi-user',
                     items: [
                            {
                                label: 'Landing',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/public']
                            },
                            {
                                label: 'Pricing',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/public/pricing']
                            },
                             {
                                label: 'Features',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/public/features']
                            }
                           ]
                    }, 



                    {
                        label: 'Client Mgt',
                        icon: 'pi pi-fw pi-user',
                     items: [
                            {
                                label: 'Clients',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/app/custmgt']
                            }, {
                                label: 'ClientsRequirement',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/app/custmgt/clientRequirements']
                            },
                            {
                                label: 'Kanaban Board',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/app/custmgt/clientKanabanboard']
                            },{
                                label: 'Directory List',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/app/custmgt/clientDirectory']
                            },
                           
                           ]
                    }, 
                    {
                        label: 'Quotation Mgt',
                        icon: 'pi pi-fw pi-money-bill',
                           items: 
                            [
                                {
                                    label: 'Quotations',
                                    icon: 'pi pi-fw pi-sign-in',
                                    routerLink: ['/app/quotationmgt']
                                }, {
                                label: 'quotationKanabanboard',
                                icon: 'pi pi-fw pi-shopping-cart',
                                routerLink: ['/app/quotationmgt/board']
                            },{
                                label: 'quotationDirectory',
                                icon: 'pi pi-fw pi-shopping-cart',
                                routerLink: ['/app/quotationmgt/directory']
                            }

                            ]    
                    }, 
   {
                        label: 'Promotion Mgt',
                        icon: 'pi pi-fw pi-money-bill',
                           items: 
                            [
                                {
                                    label: 'Discounts',
                                    icon: 'pi pi-fw pi-sign-in',
                                    routerLink: ['/app/promotion']
                                },
                                {
                                    label: 'DiscountType',
                                    icon: 'pi pi-fw pi-sign-in',
                                    routerLink: ['/app/promotion/DiscountType']
                                }
                            ]    
                    }, 
                    
                    {
                        label: 'Client Portal ',
                        icon: 'pi pi-fw pi-compass',
                        items: [
                            
                           {
                                label: 'dashboard',
                                icon: 'pi pi-fw pi-users',
                                routerLink: ['/app/clientportal/dashboard']
                            },
                        {
                                label: 'siteusers',
                                icon: 'pi pi-fw pi-users',
                                routerLink: ['/app/clientportal/siteusers']
                            },
                          
                            {
                                label: 'sites',
                                icon: 'pi pi-fw pi-shopping-cart',
                                routerLink: ['/app/clientportal/sites']
                            },
                        
                          
                            
                        ]
                        },
                     
                    {
                        label: 'Global Mgt',
                        icon: 'pi pi-fw pi-globe',
                        items: [
                            
                            {
                                label: 'KanbanBoard',
                                icon: 'pi pi-fw pi-shield',
                                routerLink: ['/app/globalmgt/KanbanBoard']
                            },
                           {
                                label: 'Dashboard',
                                icon: 'pi pi-fw pi-heart-fill',
                                routerLink: ['/app/globalmgt/Dashboard']
                            }                      
                        ] 
                    },
                    
                    {
                        label: 'Purchase Mgt',
                        icon: 'pi pi-fw pi-shopping-cart',
                        items: 
                           [
                            {
                                label: 'POs',
                                icon: 'pi pi-fw pi-code',
                                routerLink: ['/app/purchasemgt']
                            },
                              {
                                label: 'purchaseKanabanboard',
                                icon: 'pi pi-fw pi-shopping-cart',
                                routerLink: ['/app/purchasemgt/board']
                            },{
                                label: 'purchaseDirectory',
                                icon: 'pi pi-fw pi-shopping-cart',
                                routerLink: ['/app/purchasemgt/directory']
                            },{
                                label: 'card',
                                icon: 'pi pi-fw pi-shopping-cart',
                                routerLink: ['/app/purchasemgt/card']
                            },
                           ]
                    }, {
                        label: 'Sales Mgt',
                        icon: 'pi pi-fw pi-dollar',
                        items: [
                            {
                                label: 'Sales',
                                icon: 'pi pi-fw pi-dollar',
                                routerLink: ['/app/salesmgt']
                            },
                            {
                                label: 'Sales Kanban Board', // Fixed typo in label for readability
                                icon: 'pi pi-fw pi-shopping-cart',
                                routerLink: ['/app/salesmgt/board'] // Fixed typo "salesKanabanboard" -> "salesKanbanboard"
                            }
                            ,
                            {
                                label: 'Sales Directory',
                                icon: 'pi pi-fw pi-shopping-cart',
                                routerLink: ['/app/salesmgt/directory']
                            },
                            {
                                label: 'card',
                                icon: 'pi pi-fw pi-shopping-cart',
                                routerLink: ['/app/salesmgt/card']
                            },
                            
                        ]       
                    }
                    ,
                    {
                        label: 'Deli-Challan Mgt',
                        icon: 'pi pi-fw pi-receipt',
                        items: 
                           [
                            {
                                label: 'Deli-Challan',
                                icon: 'pi pi-fw pi-code',
                                routerLink: ['/app/delichallmgt']
                            }
                           ]    
                    },
                    {
                        label: 'Master Mgt',
                        icon: 'pi pi-fw pi-database',
                        items: [
                            {
                                label: 'Vendor',
                                icon: 'pi pi-fw pi-shopping-cart',
                                routerLink: ['/app/mastermgt']
                            },
                            {
                                label: 'City',
                                icon: 'pi pi-fw pi-home',
                                routerLink: ['/app/mastermgt/city']
                            },{
                                label: 'District',
                                icon: 'pi pi-fw pi-building',
                                routerLink: ['/app/mastermgt/district']
                            },
                             {
                                label: 'Leadsources',
                                icon: 'pi pi-fw pi-tag',
                                routerLink: ['/app/mastermgt/leadsource']
                            },
                                                 
                        ]
                    },

                    {
                        label: 'ProductMgt',
                        icon: 'pi pi-fw pi-list',
                        items: [
                            {
                                label: 'Product',
                                icon: 'pi pi-fw pi-briefcase',
                                routerLink: ['/app/productmgt/pm']
                            },
                             {
                                label: 'productKanabanboard',
                                icon: 'pi pi-fw pi-th-large',
                                routerLink: ['/app/productmgt/productKanabanboard']
                            },
                             {
                                label: 'productDirectory',
                                icon: 'pi pi-fw pi-th-large',
                                routerLink: ['/app/productmgt/productDirectory']
                            },





                            {
                                label: 'Product Category',
                                icon: 'pi pi-fw pi-th-large',
                                routerLink: ['/app/productmgt/productcategory']
                            },
                            {
                                label: 'Unit Of Measurement',
                                icon: 'pi pi-fw pi-sliders-h',
                                routerLink: ['/app/productmgt/UOMConversion']
                            },
                            {
                                label: 'kanbancard',
                                icon: 'pi pi-fw pi-sliders-h',
                                routerLink: ['/app/productmgt/kanbancard']
                            },
                                                 
                        ]
                    },
                    // {
                    //     label: 'ProductWithVariant',
                    //     icon: 'pi pi-fw pi-pencil',
                    //     routerLink: ['/app/productmgt']
                    // },
                    {
                        label: 'Auth',
                        icon: 'pi pi-fw pi-lock',
                        items: [
                            {
                                label: 'Login',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/auth/login']
                            },
                            {
                                label: 'Error',
                                icon: 'pi pi-fw pi-exclamation-triangle',
                                routerLink: ['/auth/error']
                            },
                            {
                                label: 'Access Denied',
                                icon: 'pi pi-fw pi-lock',
                                routerLink: ['/auth/access']
                            }
                        ]
                    },
                    {
                        label: 'Crud',
                        icon: 'pi pi-fw pi-pencil',
                        routerLink: ['/app/pages/crud']
                    },
                    {
                        label: 'Not Found',
                        icon: 'pi pi-fw pi-exclamation-circle',
                        routerLink: ['/app/pages/notfound']
                    },
                    {
                        label: 'Empty',
                        icon: 'pi pi-fw pi-circle-off',
                        routerLink: ['/app/pages/empty']
                    }
                ]
            },
            {
                label: 'Hierarchy',
                items: [
                    {
                        label: 'Submenu 1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: 'Submenu 1.1',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: 'Submenu 1.2',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    },
                    {
                        label: 'Submenu 2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: 'Submenu 2.1',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: 'Submenu 2.2',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Get Started',
                items: [
                    {
                        label: 'Documentation',
                        icon: 'pi pi-fw pi-book',
                        routerLink: ['/app/documentation']
                    },
                    {
                        label: 'View Source',
                        icon: 'pi pi-fw pi-github',
                        url: 'https://github.com/abc/xyz/g',
                        target: '_blank'
                    }
                ]
            }
        ];
    }
}
