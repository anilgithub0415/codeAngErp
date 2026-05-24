import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { LandingPageComponent } from './app/feature/public/landing-page/landing-page.component';
import { DashboardComponent } from './app/feature/dashboard/dashboard/dashboard.component';
import { roleGuard } from './app/core/guards/role.guard';


export const appRoutes: Routes = [
    // --- PUBLIC / UN-AUTHENTICATED ROUTES ---
    // The root path ('') now points directly to your LandingPageComponent
    {
        path: '',
        component: LandingPageComponent // This is your main public landing page
    },
    // The 'auth' feature module, containing login/register/etc., also has no AppLayout
    {
        path: 'auth',
        loadChildren: () => import('./app/feature/auth/auth-routing.module').then(m => m.AuthRoutingModule)
    },
    {
        path: 'public',
        loadChildren: () => import('./app/feature/public/public-routing.module').then(m => m.PublicRoutingModule)
    }, 
    {
        path: 'billing',
        loadChildren: () => import('./app/feature/billing/billing-routing.module').then(m => m.BillingRoutingModule)
    },
   
   
    // Your 404/Notfound page, also independent of AppLayout
    { path: 'notfound', component: Notfound },

    // --- AUTHENTICATED ROUTES (Wrapped by AppLayout) ---
    // All routes that require the application's main layout (header, sidebar, etc.)
    // will now live under a common parent path (e.g., 'app' or 'dashboard')
    // and use AppLayout.
    {
        path: 'app', // This acts as a base path for all authenticated routes
        component: AppLayout,
        // Assuming you will implement an AuthGuard to protect these routes
        // canActivate: [AuthGuard], // Example: Add an AuthGuard here when ready
        // canActivateChild: [AuthGuard], // Example: Protect child routes as well
        children: [
            // Your Dashboard Page (e.g., first page after login)
            { path: 'dashboard', component: DashboardComponent }, // Placeholder, replace with your actual DashboardComponent
            {
                path: 'test',
                loadChildren: () => import('./app/feature/test/test-routing.module').then(m => m.TestRoutingModule)
                , canActivate: [roleGuard],
               // data: { roles: ['SuperAdmin'] }     
            },   
            {
                path: 'tenantmgt',
                loadChildren: () => import('./app/feature/tenantmgt/tenantmgt-routing.module').then(m => m.TenantmgtRoutingModule)
                , canActivate: [roleGuard],
                data: { roles: ['SuperAdmin'] }     
            },                                                               
            
            {
                path: 'global_settings',
                loadChildren: () => import('./app/feature/settings/settings-routing.module').then(m => m.SettingsRoutingModule)
                , canActivate: [roleGuard],
                data: { roles: ['SuperAdmin'] }     
                
            },
            {
            path: 'usrmgt',
            loadChildren: () => import('./app/feature/usermgt/usermgt-routing.module').then(m => m.UsermgtRoutingModule)
            , canActivate: [roleGuard],
                data: { roles: ['SuperAdmin'] }                 
            },
            {
                path: 'productmgt',
                loadChildren: () => import('./app/feature/productmgt/productmgt-routing.module').then(m => m.ProductmgtRoutingModule)
                , canActivate: [roleGuard],
                    data: { roles: ['DataEntry'] }                 
                },
            {
                path: 'coursemgt',
                loadChildren: () => import('./app/feature/coursemgt/coursemgt-routing.module').then(m => m.CoursemgtRoutingModule)
                , canActivate: [roleGuard],
                    data: { roles: ['InstituteAdmin','SuperAdmin'] }                 
            },
            {
                path: 'peoplemgt',
                loadChildren: () => import('./app/feature/people/people-routing.module').then(m => m.PeopleRoutingModule)
                , canActivate: [roleGuard],
                data: { roles: ['AdmissionsOfficer','InstituteAdmin','Faculty'] }     
            },
            {
                path: 'qbank',
                loadChildren: () => import('./app/feature/questionbank/questionbank-routing.module').then(m => m.QuestionbankRoutingModule)
                , canActivate: [roleGuard],
                data: { roles: ['AdmissionsOfficer','InstituteAdmin','SuperAdmin','Faculty'] }     
            },
            {
                path: 'enroll',
                loadChildren: () => import('./app/feature/enroll/enroll-routing.module').then(m => m.EnrollRoutingModule)
                , canActivate: [roleGuard],
                data: { roles: ['AdmissionsOfficer','InstituteAdmin'] }     
            },

            //for faculty to declare new assignments
            {
                path: 'assignmentmgt',
              
              loadChildren: () => import('./app/feature/assignment-mgt/Assignment-mgt-routing.module').then(m => m.AssessmentMgtRoutingModule)
                , canActivate: [roleGuard],
                data: { roles: ['Faculty','InstituteAdmin'] }     
            },



            //for student solving assignment
            {
                path: 'assignmenthub',
              
              loadChildren: () => import('./app/feature/assignment-hub/assignment-hub-routing.module').then(m => m.AssignmentHubRoutingModule)
                , canActivate: [roleGuard],
                data: { roles: ['Student'] }     
            },
            // Existing UI Kit routes
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },

            // Existing Documentation route
            { path: 'documentation', component: Documentation }, // If you want this inside the main app layout

            // Existing Pages routes
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },

            // Redirect base 'app' path to dashboard if already logged in
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    // --- CATCH-ALL / WILDCARD ROUTE ---
    // Any other unmatched path redirects to notfound
    { path: '**', redirectTo: 'notfound' }
];
//     {
//         path: '',
//         component: AppLayout,
//         children: [
//             { path: '', component: LandingPageComponent },
//             { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
//             { path: 'documentation', component: Documentation },
//             { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },
          
//         ]
//     },
//     { path: 'landing', component: Landing },
//     { path: 'notfound', component: Notfound },
//  { path: 'auth', loadChildren: () => import('./app/feature/auth/auth-routing.module').then(m=>m.AuthRoutingModule) },
//     { path: '**', redirectTo: '/notfound' }
// ];
