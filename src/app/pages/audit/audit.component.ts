import { Component, OnInit, Inject , OnDestroy } from '@angular/core';
import { FirebaseService } from '../../shared/services';
import { MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.scss']
})
export class AuditComponent implements OnInit , OnDestroy {

  displayedColumnsAudit: string[] = ['date' , 'level' , 'name' ,  'action' ];
  public auditSub: Subscription;
  audits: MatTableDataSource<any>;


  constructor(
    public firebaseService: FirebaseService
  ) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.auditSub = this.firebaseService.getAllData('audit').subscribe( res => {
      this.audits = new MatTableDataSource(res);
    });
  }

  ngOnDestroy() {
    if (this.auditSub != null) {
      this.auditSub.unsubscribe();
    }

  }

}
