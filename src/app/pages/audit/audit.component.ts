import { Component, OnInit, Inject , OnDestroy, ViewChild } from '@angular/core';
import { FirebaseService } from '../../shared/services';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.scss']
})
export class AuditComponent implements OnInit , OnDestroy {

  displayedColumnsAudit: string[] = ['date' , 'level' , 'name' , 'type' , 'action' ];
  public auditSub: Subscription;
  audits: MatTableDataSource<any>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;


  constructor(
    public firebaseService: FirebaseService
  ) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.auditSub = this.firebaseService.getAllData('audit').subscribe( res => {
      this.audits = new MatTableDataSource(res);
      this.audits.paginator = this.paginator;
      this.audits.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.audits.filter = filterValue.trim().toLowerCase();
  }

  ngOnDestroy() {
    if (this.auditSub != null) {
      this.auditSub.unsubscribe();
    }

  }

}
