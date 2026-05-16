import { Component, OnInit,AfterViewInit, signal, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-assignment',standalone:true,
  imports:[RouterModule],
  templateUrl: './assignment.component.html',
  styleUrl: './assignment.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class AssignmentComponent {
}
