import { Component, inject, ViewEncapsulation } from '@angular/core';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-spinner',standalone:true,
  encapsulation: ViewEncapsulation.None,
  imports: [],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
   loader = inject(LoaderService);
}
