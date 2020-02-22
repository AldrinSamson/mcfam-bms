import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../shared/services';
import { BrokerService } from '../../shared/services';
import { MatDialog, MatDialogRef , MatDialogConfig , MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, Params } from '@angular/router';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-broker',
  templateUrl: './broker.component.html',
  styleUrls: ['./broker.component.scss']
})
export class BrokerComponent implements OnInit {

  items: Array<any>;

  constructor( public firebaseService: FirebaseService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.firebaseService.getAllData('broker')
    .subscribe(result => {
      this.items = result;
    });
  }

  openAddBroker(): void {
    const dialogConfig = new MatDialogConfig();
    this.dialog.open(AddBrokerDialogComponent , dialogConfig).afterClosed().subscribe(result => {
      this.getData();
    });
  }

}

@Component({
  // tslint:disable-next-line:component-selector
  selector : 'add-broker-dialog',
  templateUrl : './dialog/add-broker-dialog.html',
  styleUrls: ['./broker.component.scss'],
})

export class AddBrokerDialogComponent {

  addBrokerForm: any;

  constructor(
    public BrokerService: BrokerService,
    public dialogRef: MatDialogRef<AddBrokerDialogComponent>,
    public fb: FormBuilder,
  ) {
    this.addBrokerForm = this.fb.group({
      brkrID: [''],
      brkrFirstName: [''],
      brkrLastName: [''],
      brkrContactNumber: [''],
      brkrAddress: [''],
      brkrUsername: [''],
      brkrClass: [''],
      brkrEmail: [''],
      brkrPhotoURL: [''],
      brkrPassword: [''],
      uid: ['']
    });
  }

submitAddBrokerForm() {
    if (this.addBrokerForm.valid) {
        this.BrokerService.createBroker(this.addBrokerForm.value);
        this.dialogRef.close();
    }
}

onNoClick(): void {
this.dialogRef.close();
}

}
