import { Component, OnInit, Inject } from '@angular/core';
import { FirebaseService } from '../../shared/services';
import { MatDialog, MatDialogRef , MatDialogConfig , MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, Params } from '@angular/router';
import { InquiriesService } from '../../shared';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-inquiries',
  templateUrl: './inquiries.component.html',
  styleUrls: ['./inquiries.component.scss']
})
export class InquiriesComponent implements OnInit {

    inquiries: Array<any>;

    constructor( public fbs: FirebaseService,
      public inquiryService: InquiriesService,
      public dialog: MatDialog
    ) {}

    ngOnInit() {
      this.getUserInquiries();
    }

    getUserInquiries() {
      this.inquiryService.getInquiries(false).subscribe( result => {
        this.inquiries = result;
      });
    }

    openViewInquiry(value): void {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        id: value.id,
        clientName: value.clientName,
        clientEmail: value.clientEmail,
        clientContactNumber: value.clientContactNumber,
        clientMessage: value.clientMessage,
        projectName: value.projectName,
      };
      this.dialog.open(ViewInquiryDialogComponent, dialogConfig).afterClosed().subscribe(result => {
        this.getUserInquiries();
      });
    }
}

@Component({
  // tslint:disable-next-line:component-selector
  selector : 'view-inquiry-dialog',
  templateUrl : './dialog/view-inquiry-dialog.html',
  styleUrls: ['./inquiries.component.scss'],
})

export class ViewInquiryDialogComponent {
  

  constructor(
    public firebaseService: FirebaseService,
    public dialogRef: MatDialogRef<ViewInquiryDialogComponent>,
    public fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      
    }

  archiveInquiry() {
    this.firebaseService.archiveOne(this.data.id , 'inquiry');
    this.dialogRef.close();
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }
}
