import { Component, OnInit, Inject , OnDestroy } from '@angular/core';
import { FirebaseService, AuthService, TransactionService } from '../../shared';
import { MatDialog, MatDialogRef , MatDialogConfig , MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { registerLocaleData } from '@angular/common';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-sale-transaction',
  templateUrl: './sale-transaction.component.html',
  styleUrls: ['./sale-transaction.component.scss']
})
export class SaleTransactionComponent implements OnInit , OnDestroy {

  transactions: Array<any>;
  activeTransactions: Array<any>;
  managerDisapprovedTransactions: Array<any>;
  cancelledTransactions: Array<any>;
  leasedTransactions: Array<any>;
  completedTransactions: Array<any>;
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
    this.uid = sessionStorage.getItem('session-user-uid');
    this.getUserTransactions();
  }

  getUserTransactions() {
    this.transactionSub = this.transactionService.getTransaction(this.uid , this.isManager).subscribe( res => {
      this.transactions = res;

      this.activeTransactions = this.transactions.filter( res => res.isCompleted === false  && res.isDisapproved === false
        && res.isCancelled === false && res.isLeased === false );

      this.managerDisapprovedTransactions = this.transactions.filter( res => res.isCompleted === false && res.isDisapproved === true);

      this.cancelledTransactions = this.transactions.filter( res => res.isCancelled === true );

      this.leasedTransactions = this.transactions.filter( res => res.isApproved === true && res.isLeased === true );

      this.completedTransactions = this.transactions.filter( res => res.isCompleted === true && res.isApproved === true
        && res.isDisapproved === false && res.isCancelled === false && res.isLeased === false );

    });
  }


  openViewTransaction(value , status): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      id: value.id,
      projectName: value.projectName,
      projectCost: value.projectCost,
      projectSaleType: value.projectSaleType,
      agentName: value.agentName,
      agentUid: value.agentUid,
      clientName: value.clientName,
      clientUid: value.clientUid,
      managerName: value.managerName,
      managerUid: value.managerUid,
      dateStart: value.dateStart,
      status: value.status,
      stage: value.stage,
      isCompleted: value.isCompleted,
      isManagerApproved: value.isManagerApproved,
      isCustomerApproved: value.isCustomerApproved,
      isDeleted: value.isDeleted,
      buttonConfig: status,
      doc_status: value.doc_status,
      commissionRate : value.commissionRate,
      commissionTotal : value.commissionTotal,
      saleTotal: value.saleTotal,
      yearsToLease: value.yearsToLease,
      leaseTotal: value.leaseTotal,
      leaseMonth: value.leaseMonth,
      leaseYearStart: value.leaseYearStart,
      leaseYearEnd : value.leaseYearEnd,
      rating: value.rating,
      feedback: value.feedback
    };
    // tslint:disable-next-line:no-use-before-declare
    this.dialog.open(ViewSaleTransactionComponent, dialogConfig).afterClosed().subscribe(result => {
      this.getUserTransactions();
    });
  }

  ngOnDestroy() {
    if (this.transactionSub != null) {
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
  public stage: number;
  public buttonConfig: string;

  constructor(
    public trasactionService: TransactionService,
    public dialogRef: MatDialogRef<ViewSaleTransactionComponent>,
    public dialog: MatDialog,
    public authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      this.isManager = this.authService.isManager();
      this.stage = this.data.stage;
      this.buttonConfig = this.data.buttonConfig;
    }

    approveAndSetRate() {
      const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
        id: this.data.id,
        agentName: this.data.agentName,
        projectCost : this.data.projectCost
      };
      // tslint:disable-next-line:no-use-before-declare
      this.dialog.open(SetAgentRateComponent, dialogConfig).afterClosed().subscribe(result => {
        this.dialogRef.close();
      });
    }

    approveAndLease() {
      const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
        id: this.data.id,
        agentName: this.data.agentName,
        projectCost : this.data.projectCost
      };
      // tslint:disable-next-line:no-use-before-declare
      this.dialog.open(SetLeaseYearComponent, dialogConfig).afterClosed().subscribe(result => {
        this.dialogRef.close();
      });

    }

    disapprove() {
      this.trasactionService.disapprove(this.data.id);
      this.dialogRef.close();
    }

    downloadDocs() {

    }

    reactivate() {
      this.trasactionService.restoreDisapproved(this.data.id);
      this.dialogRef.close();
    }

    finalize() {
      this.trasactionService.finalizeSale(this.data.id);
      this.dialogRef.close();
    }

    finalizeLease() {
      this.trasactionService.finalizeLease(this.data.id);
      this.dialogRef.close();
    }

    endLeaase() {
      this.trasactionService.endLease(this.data.id);
      this.dialogRef.close();
    }

    delete() {
      this.trasactionService.deleteTransaction(this.data.id);
      this.dialogRef.close();
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

}

@Component({
  // tslint:disable-next-line:component-selector
  selector : 'set-agent-rate-dialog',
  templateUrl : './dialog/set-agent-rate-dialog.html',
  styleUrls: ['./sale-transaction.component.scss'],
})

export class SetAgentRateComponent {

  constructor(
    public trasactionService: TransactionService,
    public dialogRef: MatDialogRef<SetAgentRateComponent>,
    public authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    commission;
    percentage ;
    total ;
    saleTotal ;
    computed = false;

    compute() {
      this.percentage = this.commission / 100 ;
      this.total = parseInt(this.data.projectCost , 10) * this.percentage;
      this.saleTotal = this.data.projectCost - this.total;
      this.computed = true;
    }

    setCommission() {
      this.trasactionService.approveAndSetCommission(this.data.id , this.commission , this.total , this.saleTotal);
      this.dialogRef.close();
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

}

@Component({
  // tslint:disable-next-line:component-selector
  selector : 'set-lease-year-dialog',
  templateUrl : './dialog/set-lease-year-dialog.html',
  styleUrls: ['./sale-transaction.component.scss'],
})

export class SetLeaseYearComponent {

  leaseYears: Number ;
  leaseTotal;
  commisionTotal;
  saleTotal;
  leaseMonth;
  leaseYearStart: Number;
  leaseYearEnd;
  computed = false;


  constructor(
    public trasactionService: TransactionService,
    public dialogRef: MatDialogRef<SetAgentRateComponent>,
    public authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    compute() {
      this.leaseTotal = (+this.leaseYears * 12) * this.data.projectCost;
      this.commisionTotal = this.data.projectCost * +this.leaseYears;
      this.saleTotal = this.leaseTotal - this.commisionTotal;
      this.leaseYearEnd = +this.leaseYearStart + +this.leaseYears;
      this.computed = true;
    }

    setLeaseYear() {
      this.trasactionService.approveAndSetLease(this.data.id , this.leaseYears , this.leaseTotal , this.commisionTotal,
         this.saleTotal , this.leaseMonth , this.leaseYearStart , this.leaseYearEnd);
      this.dialogRef.close();
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

}
