import { Component, OnInit, Inject , OnDestroy } from '@angular/core';
import { FirebaseService, AuthService } from '../../shared/services';
import { MatDialog, MatDialogRef , MatDialogConfig , MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, Params } from '@angular/router';
import { InquiriesService } from '../../shared';
import { Subscription } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-inquiries',
  templateUrl: './inquiries.component.html',
  styleUrls: ['./inquiries.component.scss']
})
export class InquiriesComponent implements OnInit, OnDestroy {

    buyInquiries: Array<any>;
    sellInquiries: Array<any>;
    openInquiries: Array<any>;
    activeBuyInquiries: Array<any>;
    archivedBuyInquiries: Array<any>;
    activeSellInquiries: Array<any>;
    archivedSellInquiries: Array<any>;

    public buyInquirySub: Subscription;
    public sellInquirySub: Subscription;
    public openInquirySub: Subscription;

    uid: String;
    isManager = false;

    constructor( public fbs: FirebaseService,
      public inquiryService: InquiriesService,
      public dialog: MatDialog,
      public authService: AuthService
    ) {
      this.isManager = this.authService.isManager();
    }

    ngOnInit() {
      this.uid = sessionStorage.getItem('session-user-uid');
      if (!this.authService.isManager()) {
        this.getUserBuyInquiries();
      } else {
        this.getOpenSellInquiries();
        this.getUserSellInquiries();
      }
    }

    getUserBuyInquiries() {
      this.buyInquirySub = this.inquiryService.getBuyInquiries(this.uid).subscribe( result => {
        this.buyInquiries = result;
        this.activeBuyInquiries = this.buyInquiries.filter( res => res.isArchived === false );
        this.archivedBuyInquiries = this.buyInquiries.filter( res => res.isArchived === true );
      });
    }

    getOpenSellInquiries() {
      this.openInquirySub = this.inquiryService.getOpenSellInquiries().subscribe( result => {
        this.openInquiries = result;
      });
    }

    getUserSellInquiries() {
      this.sellInquirySub = this.inquiryService.getAssignedSellInquiries(this.uid).subscribe( result => {
        this.sellInquiries = result;
        this.activeSellInquiries = this.sellInquiries.filter( res => res.isArchived === false );
        this.archivedSellInquiries = this.sellInquiries.filter( res => res.isArchived === true );
      });
    }

    openViewInquiry(value , isOpen?): void {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        id: value.id,
        clientName: value.clientName,
        clientEmail: value.clientEmail,
        clientContactNumber: value.clientContactNumber,
        clientMessage: value.clientMessage,
        projectName: value.projectName,
        projectCity: value.projectCity,
        projectRegion: value.projectRegion,
        projectPropertyType: value.projectPropertyType,
        projectSaleType: value.projectSaleType,
        uid: this.uid,
        open: isOpen
      };
      this.dialog.open(ViewInquiryDialogComponent, dialogConfig).afterClosed().subscribe(result => {
        if (!this.authService.isManager()) {
          this.getUserBuyInquiries();
        } else {
          this.getOpenSellInquiries();
          this.getUserSellInquiries();
        }
      });
    }

    ngOnDestroy() {
      if (this.buyInquirySub != null) {
        this.buyInquirySub.unsubscribe();
      }
      if (this.sellInquirySub != null) {
        this.sellInquirySub.unsubscribe();
      }
      if (this.openInquirySub != null) {
        this.openInquirySub.unsubscribe();
      }
    }
}

@Component({
  // tslint:disable-next-line:component-selector
  selector : 'view-inquiry-dialog',
  templateUrl : './dialog/view-inquiry-dialog.html',
  styleUrls: ['./inquiries.component.scss'],
})

export class ViewInquiryDialogComponent {

  public isManager = false;

  constructor(
    public firebaseService: FirebaseService,
    public inquiriesService: InquiriesService,
    public authService: AuthService,
    public dialogRef: MatDialogRef<ViewInquiryDialogComponent>,
    public fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
      this.isManager = this.authService.isManager();
    }

  archiveInquiry(table) {
    this.firebaseService.archiveOne(this.data.id , table);
    this.dialogRef.close();
  }

  assignInquiry() {
    this.inquiriesService.assignInquiry(this.data.id , this.data.uid);
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
