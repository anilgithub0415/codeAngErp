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
import { FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
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
import { QuestionPickerComponent } from './app/core/repeattype/question-picker/question-picker.component';

import { StudentAnswerTypeComponent } from './app/core/repeattype/student-answer-type/student-answer-type.component';
import { QuestiontextComponent } from './app/core/repeattype/questiontext/questiontext.component';
import { AssessStudentAnswerTypeComponent } from './app/core/repeattype/assess-student-answer-type/assess-student-answer-type.component';
import { ConfigService } from './app/config.service';
import { FormlyFieldProductmultiselect } from './app/shared/components/formlyfields/productmultiselect/productmultiselect.component';
import { FormlyFieldProductsearch } from './app/shared/components/formlyfields/productsearch/productsearch.component';
import { FormlyFieldVendorsearch } from './app/shared/components/formlyfields/vendorsearch/vendorsearch.component';


export const appConfig: ApplicationConfig = {
    
    providers: [DatePipe,MessageService,provideAnimations(),
        importProvidersFrom(
            NgxPermissionsModule.forRoot(),
            
      FormlyModule.forRoot({
        types: [
          { name: 'repeat', component: RepeatsectiontypeComponent },
          { name: 'product-multiselect', component: FormlyFieldProductmultiselect },
          { name: 'product-search', component: FormlyFieldProductsearch },
          { name: 'vendor-search', component: FormlyFieldVendorsearch },
          { name: 'question-picker', component: QuestionPickerComponent },
          { name: 'studentAnswerType', component: StudentAnswerTypeComponent },
          { name: 'assessStudentAnswerType', component: AssessStudentAnswerTypeComponent },
          { name: 'questionTextDisplay', component: QuestiontextComponent }
        ]
      }),
            FormlyPrimeNGModule,FormlySelectModule,FormlyDatepickerModule
         
        ),

        
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
       // provideHttpClient(withFetch()),
       provideHttpClient(withInterceptors([apiInterceptor,errorInterceptor,tokenInterceptor,httpInterceptor])), 
        provideAnimationsAsync(),

        //
       provideAppInitializer(()=>{
        const configService=inject(ConfigService);
        return configService.loadAppConfig();
       }),
        //
        
        ToastModule,
        providePrimeNG({ theme: { preset: Aura, options: { prefix: 'p', darkModeSelector: '.app-dark' } } })
    ]
};
