import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-features',
  standalone:true,
  imports: [DividerModule, ButtonModule, FileUploadModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss'
})
export class FeaturesComponent {
 constructor(public router: Router){}
}
