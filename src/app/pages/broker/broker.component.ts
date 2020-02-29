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

  openViewBroker(value): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      id : value.id,
      brkrID : value.data().brkrID,
      brkrFirstName : value.data().brkrFirstName,
      brkrLastName : value.data().brkrLastName,
      brkrContactNumber : value.data().brkrContactNumber,
      brkrAddress : value.data().brkrAddress,
      brkrUsername : value.data().brkrUsername,
      brkrClass : value.data().brkrClass,
      brkrEmail : value.data().brkrEmail,
      brkrPhotoURL : value.data().brkrPhotoURL,
      uid : value.data().uid,
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
      brokerId: [''],
      firstName: [''],
      lastName: [''],
      fullName: [''],
      userName: [''],
      position: [''],
      contactNumber: [''],
      email : [''],
      addressStreet: [''],
      addressTown: [''],
      addressCity: [''],
      addressRegion: [''],
      photoURL: [''],
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
        //this.BrokerService.deleteBroker(this.data.uid)
        this.dialogRef.close();
    }

    onNoClick(): void {
    this.dialogRef.close();
    }
}
