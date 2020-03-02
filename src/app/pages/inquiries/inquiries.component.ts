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
      public inquiryService: InquiriesService
    ) {}

    ngOnInit() {
      this.getUserInquiries();
    }

    getUserInquiries() {
      this.inquiryService.getInquiries().subscribe( result => {
        this.inquiries = result;
      });
    }
}
