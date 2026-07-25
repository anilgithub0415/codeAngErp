import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { httpInterceptor } from './app/core/http/http.interceptor';
import { apiInterceptor } from './app/core/http/api.interceptor';
import { errorInterceptor } from './app/core/http/error.interceptor';
import { tokenInterceptor } from './app/core/http/token.interceptor';
import { NgxPermissionsModule } from 'ngx-permissions';
import { FORMLY_CONFIG, FormlyFieldConfig, FormlyModule, provideFormlyConfig, provideFormlyCore } from '@ngx-formly/core';
import { FormlyPrimeNGModule, withFormlyPrimeNG } from '@ngx-formly/primeng';
import {FormlyDatepickerModule} from '@ngx-formly/primeng/datepicker'
import { FormlySelectModule } from '@ngx-formly/core/select';

import { DatePipe } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { provideAnimations } from '@angular/platform-browser/animations';
//import { RepeatsectiontypeComponent } from './app/core/repeattype/repeatsectiontype/repeatsectiontype.component';
import { RepeattypeModule } from './app/core/repeattype/repeattype.module';
import { RepeatsectiontypeComponent } from './app/core/repeattype/repeatsectiontype/repeatsectiontype.component';
import { ButtonModule } from 'primeng/button';



import { QuestiontextComponent } from './app/core/repeattype/questiontext/questiontext.component';

import { ConfigService } from './app/config.service';
import { FormlyFieldProductmultiselect } from './app/shared/components/formlyfields/productmultiselect/productmultiselect.component';
import { FormlyFieldProductsearch } from './app/shared/components/formlyfields/productsearch/productsearch.component';
import { FormlyFieldVendorsearch } from './app/shared/components/formlyfields/vendorsearch/vendorsearch.component';
import { FormlyCardWrapperComponent } from './app/shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { LookupService } from './app/core/services/lookup.service';
import { FormlyFieldPrimengDropdownComponent } from './app/shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';


import { RepeatFormlySectionComponent } from './app/shared/components/formlyfields/repeat-formly-section/repeat-formly-section.component';
import { CustomdropdownComponent } from './app/shared/components/formlyfields/customdropdown/customdropdown.component';
import { FORMly_CUSTOM_TYPES } from './app/shared/components/formlyfields/custom-types.provider';
import { FormlyFieldPrimengDropdownNewComponent } from './app/shared/components/formlyfields/formly-field-primeng-dropdown-new/formly-field-primeng-dropdown-new.component';
import { DatePickerModule } from 'primeng/datepicker';
import { loaderInterceptor } from './app/shared/interceptors/loader.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [ provideAnimations(),
        importProvidersFrom(
            NgxPermissionsModule.forRoot(),
            FormlyModule.forRoot({
                extras: { lazyRender: false }
            }),
            FormlyPrimeNGModule,
            
        ),

        //No type declaration, as we are using formlyConfig.addConfig means bypasing app.config ,
        //and bypasing app.config is managed by 
        //"expressions": {
        // "props.sync": "model.customerCategory"
        // }
        // at testddl json
        // and at customcomponent ngOnInit we have
        //code responsible for model updation
        //  if (this.formControl) {
        // this.formControl.valueChanges.subscribe((newValue) => {
        //console.log('value changes .........', newValue);
        //        setTimeout(() => {
        // if (this.primeSelect) {
        //    // Force PrimeNG to process the value manually 
        //    this.primeSelect.updateModel(newValue); 
        //  }
        //  this.cdr.markForCheck();
        //}, 100);
        // });
        //}
        
        //  {
        //     provide: FORMLY_CONFIG,
        //     multi: true,
        //     useValue: {
        //         types: [
        //             { 
        //                 name: 'pselect', // 👈 Clean string with no hyphens or dashes
        //                 component: FormlyFieldPrimengDropdownNewComponent 
        //             },

        //             { 
        //                 name: 'primeNg-dropdown', // 👈 Clean string with no hyphens or dashes
        //                 component: Customddl1Component 
        //             }
        //         ],
        //         extras: { lazyRender: false }
        //     }
        //  },
        
         MessageService,
        
     provideRouter(appRoutes),
        provideHttpClient(withInterceptors([apiInterceptor, errorInterceptor, tokenInterceptor, httpInterceptor, loaderInterceptor])), 
        provideAnimationsAsync(),
        providePrimeNG({ 
            theme: { 
                preset: Aura, 
                options: { prefix: 'p', darkModeSelector: '.app-dark' } 
            } 
        })
    ]
};