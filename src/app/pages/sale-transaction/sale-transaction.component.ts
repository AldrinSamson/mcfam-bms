import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FirebaseService, AuthService, TransactionService, MailerService } from '../../shared';
import { MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, Params } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import * as JSZipUtils from 'jszip-utils'
import * as JSZip from 'jszip';
import * as cors from 'cors';
import { saveAs } from 'file-saver';
import { Http, ResponseContentType } from '@angular/http';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-sale-transaction',
  templateUrl: './sale-transaction.component.html',
  styleUrls: ['./sale-transaction.component.scss']
})
export class SaleTransactionComponent implements OnInit, OnDestroy {

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
    this.transactionSub = this.transactionService.getTransaction(this.uid, this.isManager).subscribe(res => {
      this.transactions = res;

      this.activeTransactions = this.transactions.filter(res => res.isCompleted === false && res.isDisapproved === false
        && res.isCancelled === false && res.isLeased === false);

      this.managerDisapprovedTransactions = this.transactions.filter(res => res.isCompleted === false && res.isDisapproved === true);

      this.cancelledTransactions = this.transactions.filter(res => res.isCancelled === true);

      this.leasedTransactions = this.transactions.filter(res => res.isApproved === true && res.isLeased === true);

      this.completedTransactions = this.transactions.filter(res => res.isCompleted === true && res.isApproved === true
        && res.isDisapproved === false && res.isCancelled === false && res.isLeased === false);

    });
  }


  openViewTransaction(value, status): void {
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
      commissionRate: value.commissionRate,
      commissionTotal: value.commissionTotal,
      saleTotal: value.saleTotal,
      yearsToLease: value.yearsToLease,
      leaseTotal: value.leaseTotal,
      leaseMonth: value.leaseMonth,
      leaseYearStart: value.leaseYearStart,
      leaseYearEnd: value.leaseYearEnd,
      rating: value.rating,
      feedback: value.feedback
    };
    dialogConfig.minWidth = 80;
    dialogConfig.maxWidth = 700;
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
  selector: 'view-sale-transaction-dialog',
  templateUrl: './dialog/view-sale-transaction-dialog.html',
  styleUrls: ['./sale-transaction.component.scss'],
})

export class ViewSaleTransactionComponent {

  public isManager: Boolean;
  public stage: number;
  public buttonConfig: string;

  constructor(
    public trasactionService: TransactionService,
    public mailerService: MailerService,
    public dialogRef: MatDialogRef<ViewSaleTransactionComponent>,
    public dialog: MatDialog,
    public authService: AuthService,
    public http: Http,
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
      agentUid: this.data.agentUid,
      clientUid: this.data.clientUid,
      projectName: this.data.projectName,
      projectCost: this.data.projectCost
    };
    dialogConfig.minWidth = 80;
    dialogConfig.maxWidth = 700;
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
      agentUid: this.data.agentUid,
      clientUid: this.data.clientUid,
      projectName: this.data.projectName,
      projectCost: this.data.projectCost
    };
    dialogConfig.minWidth = 80;
    dialogConfig.maxWidth = 700;
    // tslint:disable-next-line:no-use-before-declare
    this.dialog.open(SetLeaseYearComponent, dialogConfig).afterClosed().subscribe(result => {
      this.dialogRef.close();
    });

  }

  disapprove() {
    this.trasactionService.disapprove(this.data.id);
    const mailLoad = [this.data.agentName];
    this.mailerService.mailTransactionMessage(this.data.clientUid, 'client', 'disapproved', this.data.projectName, mailLoad);
    this.mailerService.mailTransactionMessage(this.data.agentUid, 'agent', 'disapproved', this.data.projectName);
    this.dialogRef.close();
  }

  downloadFile(url): Observable<any> {
    return this.http.get(url, { responseType: ResponseContentType.Blob });
  }
  async downloadMulitple() {

    var zip: JSZip =
      typeof (<any>JSZip).default === "function" ? new (<any>JSZip).default() : new JSZip();

    var count = 0;
    var zipFilename = "Transaction.zip";
    var proponetrans = await this.trasactionService.getOneTransaction(this.data.id);
    console.log(proponetrans)
    var urls = [
      proponetrans['doc_BIS']['file']['fileurl'],
      proponetrans['doc_RF']['file']['fileurl'],
      proponetrans['doc_RA']['file']['fileurl'],
      proponetrans['doc_VG1']['file']['fileurl'],
      proponetrans['doc_VG2']['file']['fileurl'],
      proponetrans['doc_POI']['file']['fileurl'],
      proponetrans['doc_POB']['file']['fileurl'],
      proponetrans['doc_PSS']['file']['fileurl']
    ];
    var toUpload2 = [{ desc: 'Buyer Information Sheet' },//0
    { desc: 'Reservation Fee' },//1
    { desc: 'Reservation Agreement' },//2
    { desc: 'Valid Goverment ID 1' },//3
    { desc: 'Valid Goverment ID 2' },//4
    { desc: 'Proof of Income' },//5
    { desc: 'Proof of Billing' },//6
    { desc: 'Payment Schedule Scheme' }
    ]
    try {
      for (var i = 0; i < urls.length; i++) {
        var url = urls[i];
        console.log(url)
        var filename = toUpload2[i]['desc'];
        console.log(filename)
        //zip.file(filename, await this.urlToPromise(url), { binary: true });
      }

      zip.generateAsync({ type: "blob" }).then(function (zipFile) {
        this.saveAs(zipFile, zipFilename);

      });
    } catch (err) {
      console.log(err, 'here')
    }
    /*
    $(".downloadAll").on('click', function () { // find every song urls
      $(".album-dl-box").find("a").each(function () {
        var song = $(this);
        var url = song.attr('href');
        var filename = url.replace(/.*\/|%20/g, "").replace(/%5d/g, "]").replace(/%5b/g, "[");
        JSZipUtils.getBinaryContent(url, function (err, data) {
          if (err) {
            throw err; // or handle the error
          } var zip = new JSZip(); zip.file(filename, data, { binary: true });
        });
      });
    })*/
  }
  async downloadDocs() {
    const corsHandler = cors({ origin: true });
    var transid = this.data.id;
    var zip: JSZip =
      typeof (<any>JSZip).default === "function" ? new (<any>JSZip).default() : new JSZip();

    var count = 0;
    var zipFilename = "Transaction.zip";
    var proponetrans = await this.trasactionService.getOneTransaction(transid);
    console.log(proponetrans)
    var urls = [
      proponetrans['doc_BIS']['file']['fileurl'],
      proponetrans['doc_RF']['file']['fileurl'],
      proponetrans['doc_RA']['file']['fileurl'],
      proponetrans['doc_VG1']['file']['fileurl'],
      proponetrans['doc_VG2']['file']['fileurl'],
      proponetrans['doc_POI']['file']['fileurl'],
      proponetrans['doc_POB']['file']['fileurl'],
      proponetrans['doc_PSS']['file']['fileurl']
    ];

    var toUpload2 = [{ desc: 'Buyer Information Sheet' },//0
    { desc: 'Reservation Fee' },//1
    { desc: 'Reservation Agreement' },//2
    { desc: 'Valid Goverment ID 1' },//3
    { desc: 'Valid Goverment ID 2' },//4
    { desc: 'Proof of Income' },//5
    { desc: 'Proof of Billing' },//6
    { desc: 'Payment Schedule Scheme' }
    ]
    try {
      for (var i = 0; i < urls.length; i++) {
        var url = urls[i];
        console.log(url)
        var filename = transid + '_' + toUpload2[i]['desc'];
        this.download(url, filename);
      }
      for (var i = 0; i < proponetrans['doc_others'].length; i++) {
        var url = proponetrans['doc_others'][i]['fileurl'];
        var filename = transid + '_' + 'Others ' + (i + 1);
        this.download(url, filename);
      }
    } catch (err) {
      console.log(err, 'here')
    }

  }
  download(url, filename) {
    //filename = this.data.id + '_' + filename
    fetch(url, { mode: 'no-cors' }).then(function (t) {
      return t.blob().then((b) => {
        var a = document.createElement("a");
        console.log(b);
        a.href = URL.createObjectURL(b);
        a.setAttribute("download", filename);
        a.click();
      }
      );
    });
  }
  urlToPromise(url) {
    try {
      return new Promise(function (resolve, reject) {
        JSZipUtils.getBinaryContent(url, function (err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    } catch (err) {
      console.log(err)
    }
  }
  reactivate() {
    this.trasactionService.restoreDisapproved(this.data.id);
    const mailLoad = [this.data.clientName];
    this.mailerService.mailTransactionMessage(this.data.clientUid, 'client', 'restored', this.data.projectName);
    this.mailerService.mailTransactionMessage(this.data.agentUid, 'agent', 'restored', this.data.projectName, mailLoad);
    this.dialogRef.close();
  }

  finalize() {
    this.trasactionService.finalizeSale(this.data.id);
    const mailLoad = [this.data.agentName];
    this.mailerService.mailTransactionMessage(this.data.clientUid, 'client', 4, this.data.projectName, mailLoad);
    this.dialogRef.close();
  }

  finalizeLease() {
    this.trasactionService.finalizeLease(this.data.id);
    const mailLoad = [this.data.agentName];
    this.mailerService.mailTransactionMessage(this.data.clientUid, 'client', 4, this.data.projectName, mailLoad);
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
  selector: 'set-agent-rate-dialog',
  templateUrl: './dialog/set-agent-rate-dialog.html',
  styleUrls: ['./sale-transaction.component.scss'],
})

export class SetAgentRateComponent {

  constructor(
    public trasactionService: TransactionService,
    public mailerService: MailerService,
    public dialogRef: MatDialogRef<SetAgentRateComponent>,
    public authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  commission;
  percentage;
  total;
  saleTotal;
  computed = false;

  compute() {
    this.percentage = this.commission / 100;
    this.total = parseInt(this.data.projectCost, 10) * this.percentage;
    this.saleTotal = this.data.projectCost - this.total;
    this.computed = true;
  }

  setCommission() {
    this.trasactionService.approveAndSetCommission(this.data.id, this.commission, this.total, this.saleTotal);
    const mailLoad = [this.data.agentName];
    this.mailerService.mailTransactionMessage(this.data.clientUid, 'client', 3, this.data.projectName, mailLoad);
    this.mailerService.mailTransactionMessage(this.data.agentUid, 'agent', 3, this.data.projectName);
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'set-lease-year-dialog',
  templateUrl: './dialog/set-lease-year-dialog.html',
  styleUrls: ['./sale-transaction.component.scss'],
})

export class SetLeaseYearComponent {

  leaseYears: Number;
  leaseTotal;
  commisionTotal;
  saleTotal;
  leaseMonth;
  leaseYearStart: Number;
  leaseYearEnd;
  computed = false;


  constructor(
    public trasactionService: TransactionService,
    public mailerService: MailerService,
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
    this.trasactionService.approveAndSetLease(this.data.id, this.leaseYears, this.leaseTotal, this.commisionTotal,
      this.saleTotal, this.leaseMonth, this.leaseYearStart, this.leaseYearEnd);
    const mailLoad = [this.data.agentName];
    this.mailerService.mailTransactionMessage(this.data.clientUid, 'client', 3, this.data.projectName, mailLoad);
    this.mailerService.mailTransactionMessage(this.data.agentUid, 'agent', 3, this.data.projectName);
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
