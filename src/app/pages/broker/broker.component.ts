import { Component, OnInit, Inject } from '@angular/core';
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

  openViewBroker(item): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      id : item.id,
      brkrID : item.data().brkrID,
      brkrFirstName : item.data().brkrFirstName,
      brkrLastName : item.data().brkrLastName,
      brkrContactNumber : item.data().brkrContactNumber,
      brkrAddress : item.data().brkrAddress,
      brkrUsername : item.data().brkrUsername,
      brkrClass : item.data().brkrClass,
      brkrEmail : item.data().brkrEmail,
      brkrPhotoURL : item.data().brkrPhotoURL,
      uid : item.data().uid,
    }
    this.dialog.open(ViewBrokerDialogComponent, dialogConfig).afterClosed().subscribe(result => {
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


@Component({
  // tslint:disable-next-line:component-selector
  selector : 'view-broker-dialog',
  templateUrl : './dialog/view-broker-dialog.html',
  styleUrls: ['./broker.component.scss'],
})

export class ViewBrokerDialogComponent {
  editBrokerForm : any;

  constructor(
    public firebaseService: FirebaseService,
    public BrokerService: BrokerService,
    public dialogRef: MatDialogRef<AddBrokerDialogComponent>,
    public fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      this.editBrokerForm = this.fb.group({
        id : [this.data.id],
        brkrID: [this.data.brkrID],
        brkrFirstName: [this.data.brkrFirstName],
        brkrLastName: [this.data.brkrLastName],
        brkrContactNumber: [this.data.brkrContactNumber],
        brkrAddress: [this.data.brkrAddress],
        brkrUsername: [this.data.brkrUsername],
        uid: [this.data.uid] 
      })
    }

  submitEditBrokerForm() {
        if (this.editBrokerForm.valid){
              this.firebaseService.updateOne(this.data.id , this.editBrokerForm.value , 'broker')
            this.dialogRef.close();
        }
        
    }

    deleteBroker(){
        this.firebaseService.deleteOne(this.data.id ,'broker')
        this.firebaseService.deleteOne(this.data.uid ,'users')
        this.BrokerService.deleteBroker(this.data.uid)
        this.dialogRef.close();
    }

    onNoClick(): void {
    this.dialogRef.close();
    }
}
