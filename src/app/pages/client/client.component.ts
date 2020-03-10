import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FirebaseService } from '../../shared/services';
import { MatDialog, MatDialogRef , MatDialogConfig , MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClientService } from '@shared/services/client.service';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit , OnDestroy {

  items: Array<any>;
  clientSub : Subscription;
  constructor( public firebaseService: FirebaseService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.getData() ;
  }

  getData() {
    this.clientSub = this.firebaseService.getAllData('client')
    .subscribe(result => {
      this.items = result;
    });
  }

  openAddClient(): void {
    const dialogConfig = new MatDialogConfig();
    this.dialog.open(AddClientDialogComponent , dialogConfig).afterClosed().subscribe(result => {
      this.getData();
    });
}
openViewClient(value): void {
  const dialogConfig = new MatDialogConfig();
  dialogConfig.data = {
    id : value.id,
    firstName : value.firstName,
    lastName : value.lastName,
    userName : value.userName,
    contactNumber : value.contactNumber,
    addressStreet : value.addressStreet,
    addressTown : value.addressTown,
    addressCity : value.addressCity,
    addressRegion : value.addressRegion,
    email : value.email,
    photoURL : value.photoURL,
    uid : value.uid,
  };
  this.dialog.open(ViewClientDialogComponent, dialogConfig).afterClosed().subscribe(result => {
    this.getData();
  });
}
ngOnDestroy() {
  if(this.clientSub != null){
    this.clientSub.unsubscribe();
  }
}

}

@Component ({
  //AddClient Component
  selector: 'add-client-dialog',
  templateUrl: './dialog/add-client-dialog.html',
  styleUrls: ['./client.component.css']
})

export class AddClientDialogComponent {
  addClientForm: any;

  constructor(
    public ClientService: ClientService,
    public dialogRef: MatDialogRef<AddClientDialogComponent>,
    public fb: FormBuilder,
  ) {
    this.addClientForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      userName: [''],
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

submitAddClientForm() {
  if (this.addClientForm.valid) {
    this.addClientForm = this.fb.group({
      firstName: [this.addClientForm.value.firstName],
      lastName: [this.addClientForm.value.lastName],
      fullName: [this.addClientForm.value.firstName + ' ' + this.addClientForm.value.lastName],
      userName: [this.addClientForm.value.userName],
      contactNumber: [this.addClientForm.value.contactNumber],
      email : [this.addClientForm.value.email],
      addressStreet: [this.addClientForm.value.addressStreet],
      addressTown: [this.addClientForm.value.addressTown],
      addressCity: [this.addClientForm.value.addressCity],
      addressRegion: [this.addClientForm.value.addressRegion],
      photoURL: [''],
      uid: [this.addClientForm.value.uid],
      password: [this.addClientForm.value.password]
    });
      this.ClientService.createClient(this.addClientForm.value);
      this.dialogRef.close();
  }
}
}

@Component({
  // tslint:disable-next-line:component-selector
  selector : 'view-client-dialog',
  templateUrl : './dialog/view-client-dialog.html',
  styleUrls: ['./client.component.css'],
})

export class ViewClientDialogComponent {
  viewClientForm : any;

  constructor(
    public firebaseService: FirebaseService,
    public ClientService: ClientService,
    public dialogRef: MatDialogRef<AddClientDialogComponent>,
    public fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      this.viewClientForm = this.fb.group({
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
    deleteClient(){
      this.firebaseService.deleteOne(this.data.id ,'client')
      this.firebaseService.deleteOne(this.data.uid ,'users')
    
      this.dialogRef.close();
  }

  onNoClick(): void {
  this.dialogRef.close();
  }
}