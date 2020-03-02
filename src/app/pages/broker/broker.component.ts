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
      brokerId : value.brokerId,
      firstName : value.firstName,
      lastName : value.lastName,
      userName : value.userName,
      contactNumber : value.contactNumber,
      addressStreet : value.addressStreet,
      addressTown : value.addressTown,
      addressCity : value.addressCity,
      addressRegion : value.addressRegion,
      position : value.position,
      email : value.email,
      photoURL : value.photoURL,
      uid : value.uid,
    };
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
      userName: [''],
      position: [''],
      contactNumber: [''],
      email : [''],
      addressStreet: [''],
      addressTown: [''],
      addressCity: [''],
      addressRegion: [''],
      photoURL: [''],
      uid: [''],
      password: ['']
    });
  }

submitAddBrokerForm() {
    if (this.addBrokerForm.valid) {
      this.addBrokerForm = this.fb.group({
        brokerId: [this.addBrokerForm.value.brokerId],
        firstName: [this.addBrokerForm.value.firstName],
        lastName: [this.addBrokerForm.value.lastName],
        fullName: [this.addBrokerForm.value.firstName + ' ' + this.addBrokerForm.value.lastName],
        userName: [this.addBrokerForm.value.userName],
        position: [this.addBrokerForm.value.position],
        contactNumber: [this.addBrokerForm.value.contactNumber],
        email : [this.addBrokerForm.value.email],
        addressStreet: [this.addBrokerForm.value.addressStreet],
        addressTown: [this.addBrokerForm.value.addressTown],
        addressCity: [this.addBrokerForm.value.addressCity],
        addressRegion: [this.addBrokerForm.value.addressRegion],
        photoURL: [''],
        uid: [this.addBrokerForm.value.uid],
        password: [this.addBrokerForm.value.password]
      });
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
        brokerId: [this.data.brokerId],
        firstName: [this.data.firstName],
        lastName: [this.data.lastName],
        fullName: [this.data.firstName +' '+ this.data.lastName],
        userName: [this.data.userName],
        contactNumber: [this.data.contactNumber],
        addressStreet: [this.data.addressStreet],
        addressTown: [this.data.addressTown],
        addressCity: [this.data.addressCity],
        addressRegion: [this.data.addressRegion],
        uid: [this.data.uid] 
      })
    }

  submitEditBrokerForm() {
        if (this.editBrokerForm.valid){
              this.BrokerService.updateBroker(this.data.id , this.editBrokerForm.value )
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
