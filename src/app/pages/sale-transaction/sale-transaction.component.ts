import { Component, OnInit, Inject , OnDestroy } from '@angular/core';
import { FirebaseService, AuthService,TransactionService } from '../../shared';
import { MatDialog, MatDialogRef , MatDialogConfig , MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-sale-transaction',
  templateUrl: './sale-transaction.component.html',
  styleUrls: ['./sale-transaction.component.scss']
})
export class SaleTransactionComponent implements OnInit , OnDestroy {

  transactions: Array<any>;
  public transactionSub: Subscription;
  uid: String;
  private isManager: Boolean;

  constructor(public fbs: FirebaseService,
    public transactionService: TransactionService,
    public dialog: MatDialog, 
    public authService: AuthService) {
      this.isManager = this.authService.isManager();
     }

  ngOnInit() {
    this.uid = sessionStorage.getItem('session-user-uid')
    this.getUserTransactions();
  }

  getUserTransactions(){
    this.transactionSub = this.transactionService.getTransaction(this.uid ,this.isManager, false , false).subscribe( res => {
      this.transactions = res;
    })
  }

  openViewTransaction(value): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      id: value.id,
      projectName: value.projectName,
      projectCost: value.projectCost,
      projectSaleType: value.projectSaleType,
      agentName: value.agentName,
      clientName: value.clientName,
      managerName: value.managerName,
      dateStart: value.dateStart,
      status: value.status,
      stage: value.stage,
      isCompleted: value.isCompleted,
      isManagerApproved: value.isManagerApproved,
      isCustomerApproved: value.isCustomerApproved,
      isDeleted: value.isDeleted
    };
    this.dialog.open(ViewSaleTransactionComponent, dialogConfig).afterClosed().subscribe(result => {
      this.getUserTransactions();
    });
  }

  ngOnDestroy() {
    if(this.transactionSub != null){
      this.transactionSub.unsubscribe();
    }
  }

}

@Component({
  // tslint:disable-next-line:component-selector
  selector : 'view-sale-transaction-dialog',
  templateUrl : './dialog/view-sale-transaction-dialog.html',
  styleUrls: ['./sale-transaction.component.scss'],
})

export class ViewSaleTransactionComponent {

  public isManager: Boolean;
  public stage : number;

  constructor(
    public trasactionService: TransactionService,
    public dialogRef: MatDialogRef<ViewSaleTransactionComponent>,
    public fb: FormBuilder,
    public authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      this.isManager = this.authService.isManager();
      this.stage = this.data.stage;
    }

    onNoClick(): void {
      this.dialogRef.close();
    }
  
}
