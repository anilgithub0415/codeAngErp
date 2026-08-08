import { Component, inject, OnInit } from '@angular/core';
import { DbStatusService } from '../../../../core/services/db-status.service';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-db-status',
  imports: [CommonModule,AsyncPipe],
  templateUrl: './db-status.component.html',
  styleUrl: './db-status.component.scss'
})
export class DbStatusComponent implements OnInit {
  databaseStatus: any;
  private dbStatusService = inject(DbStatusService);

  ngOnInit() {
    console.log('.......requesting dbStatus.........');
    this.dbStatusService.getdbStatus().subscribe({
      next: (data) => {
        this.databaseStatus = data;
        console.log('dbStatus fetched:', data);
      },
      error: (err) => console.error('Error fetching database status:', err)
    });
  }
}
