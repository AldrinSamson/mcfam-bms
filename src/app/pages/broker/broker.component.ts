import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FirebaseService, FileService, AuthService } from '../../shared/services';
import { BrokerService } from '../../shared/services';
import { MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-broker',
  templateUrl: './broker.component.html',
  styleUrls: ['./broker.component.scss']
})
export class BrokerComponent implements OnInit, OnDestroy {

  public isManager: Boolean;

  brokerSearchText;
  brokers: Array<any>;
  brokerSub: Subscription;
  p;

  profpic: any;

  constructor(public firebaseService: FirebaseService,
    public fileservice: FileService,
    public dialog: MatDialog,
    public authService: AuthService
  ) {
    this.isManager = this.authService.isManager();
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.brokerSub = this.firebaseService.getAllData('broker')
      .subscribe(result => {
        const tempbrokers = result;
        console.log(result);
        for (let i = 0; i < result.length; i++) {
          if (!result[i]['photoURL']) {
            tempbrokers[i]['photoURL'] = {photoURL: '' };
          }
        }
        this.brokers = tempbrokers;
      });
  }

  openAddBroker(): void {
    const dialogConfig = new MatDialogConfig();
    this.dialog.open(AddBrokerDialogComponent, dialogConfig).afterClosed().subscribe(result => {
      this.getData();
    });
  }

  openViewBroker(value): void {
    const dialogConfig = new MatDialogConfig();
    console.log(value);
    dialogConfig.data = {
      id: value.id,
      brokerId: value.brokerId,
      firstName: value.firstName,
      lastName: value.lastName,
      userName: value.userName,
      aveRating: value.aveRating,
      contactNumber: value.contactNumber,
      addressStreet: value.addressStreet,
      addressTown: value.addressTown,
      addressCity: value.addressCity,
      addressRegion: value.addressRegion,
      position: value.position,
      email: value.email,
      photoURL: value.photoURL,
      uid: value.uid,
    };
    // console.log(dialogConfig)
    this.dialog.open(ViewBrokerDialogComponent, dialogConfig).afterClosed().subscribe(result => {
      this.getData();
    });
  }

  ngOnDestroy() {
    if (this.brokerSub != null) {
      this.brokerSub.unsubscribe();
    }
  }

}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'add-broker-dialog',
  templateUrl: './dialog/add-broker-dialog.html',
  styleUrls: ['./broker.component.scss'],
})

export class AddBrokerDialogComponent {

  addBrokerForm: any;
  picFile: any;
  qtyinput = '';
  message = '';
  imagePath: any;
  imgURL: string | ArrayBuffer;
  userId: string;
  filestored = [];
  constructor(
    public BrokerService: BrokerService,
    public dialogRef: MatDialogRef<AddBrokerDialogComponent>,
    public fileservice: FileService,
    public fb: FormBuilder,
    private firestore: AngularFirestore,
  ) {
    try {
      this.userId = firebase.auth().currentUser.uid;
    } catch (err) {
      this.userId = '';
    }
    this.addBrokerForm = this.fb.group({
      brokerId: [''],
      firstName: [''],
      lastName: [''],
      userName: [''],
      position: [''],
      contactNumber: [''],
      email: [''],
      addressStreet: [''],
      addressTown: [''],
      addressCity: [''],
      addressRegion: [''],
      photoURL: [''],
      uid: [''],
      password: [''],
      aveRating: [0]
    });
  }
  preview(files) {
    if (files.length === 0) {
      document.getElementById('uploadbtn').classList.remove('btn-success');
      document.getElementById('uploadbtn').classList.add('btn-primary');
      this.imgURL = null;
      return;
    } else {
      document.getElementById('uploadbtn').classList.remove('btn-primary');
      document.getElementById('uploadbtn').classList.add('btn-success');
    }
    console.log(files);
    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = 'Only images are supported.';
      return;
    }

    const reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
      this.picFile = files;
    };

  }
  submitFinal() {

  }
  uploadImageAsPromise(fl, islast) {
    console.log(fl);
    const thisclass = this;
    const fs = this.fileservice;
    const path = `broker/storeFile${new Date().getTime()}_${fl.name}`;
    return new Promise(function (resolve, reject) {
      const storageRef = firebase.storage().ref(path);

      // Upload file
      const task = storageRef.put(fl);
      console.log(JSON.stringify(fl));
      task.then(function (snapshot) {
        snapshot.ref.getDownloadURL().then(async function (url) {  // Now I can use url
          const file1 = {
            name: fl.name,
            lastModified: fl.lastModified,
            lastModifiedDate: fl.lastModifiedDate,
            webkitRelativePath: fl.webkitRelativePath,
            size: fl.size,
            type: fl.type
          };
          const id = await thisclass.firestore.createId();
          const fileprop = {
            id: id,
            fileProperties: file1,
            uidUploaded: thisclass.userId,
            section: 'BMS',
            fileName: `storeFile${new Date().getTime()}_${fl.name}`,
            category: 'broker',
            photoURL: url,
            path: path
          };
          console.log(fileprop);

          // var fileID = await thisclass.fileservice.createFile(fileprop);
          console.log('fileid');

          thisclass.filestored.push(id);
          console.log(islast);

          if (islast) {
            // thisclass.insertBroker(url);
            // resolve(url);
            resolve(fileprop);
          }
          console.log(thisclass.filestored);
        }).catch(err => {
          console.log(err);
        });
      });
    }).catch(err => {
      console.log(err);
    });
  }
  async insertBroker(url) {
    this.addBrokerForm = this.fb.group({
      brokerId: [this.addBrokerForm.value.brokerId],
      firstName: [this.addBrokerForm.value.firstName],
      lastName: [this.addBrokerForm.value.lastName],
      fullName: [this.addBrokerForm.value.firstName + ' ' + this.addBrokerForm.value.lastName],
      userName: [this.addBrokerForm.value.userName],
      position: [this.addBrokerForm.value.position],
      contactNumber: [this.addBrokerForm.value.contactNumber],
      email: [this.addBrokerForm.value.email],
      addressStreet: [this.addBrokerForm.value.addressStreet],
      addressTown: [this.addBrokerForm.value.addressTown],
      addressCity: [this.addBrokerForm.value.addressCity],
      addressRegion: [this.addBrokerForm.value.addressRegion],
      photoURL: [url],
      uid: [this.addBrokerForm.value.uid],
      password: [this.addBrokerForm.value.password]
    });
    console.log(this.addBrokerForm.value);
    return this.BrokerService.createBroker(this.addBrokerForm.value);

  }
  async submitAddBrokerForm() {
    // if (this.addBrokerForm.valid) {
    const thisclass = this;
    {
      let photourl = '';
      // console.log('b');


      console.log(photourl);
      const hasaccount = this.BrokerService.existUserNameCheck(this.addBrokerForm.value.userName);
      // console.log('a');
      await hasaccount.then(async function (result) {
        console.log(result);
        if (result + '' === 'username already exist') {
          throw new Error(result + '');
          // resolve(result+'')
        } else {
          if (thisclass.picFile) {

            const x = thisclass.uploadImageAsPromise(thisclass.picFile[0], true);
            await x.then(function (result) {
              // do something with result
              console.log(result);
              photourl = result['photoURL'];
            });
          } else {
            // this.insertBroker('');
          }

          thisclass.insertBroker(photourl);
        }
      }).catch(err => {
        // throw new Error(err);
        alert(err);
      });

      this.dialogRef.close();
    }
  }
  getFile(event) {
    this.picFile = event.target.files;
    console.log(this.picFile);
    if (this.picFile.length) {
      document.getElementById('uploadbtn').classList.remove('btn-primary');
      document.getElementById('uploadbtn').classList.add('btn-success');
      this.qtyinput = 'a file attached'; 
    } else {
      document.getElementById('uploadbtn').classList.remove('btn-success');
      document.getElementById('uploadbtn').classList.add('btn-primary');
    }
  }
  inputFileClick() {
    document.getElementById('inputfile').click();

  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'view-broker-dialog',
  templateUrl: './dialog/view-broker-dialog.html',
  styleUrls: ['./broker.component.scss'],
})

export class ViewBrokerDialogComponent {
  editBrokerForm: any;
  public isManager: Boolean;
  previewphoto: any;
  thepreviewphoto: any;
  userId: string;
  constructor(
    public firebaseService: FirebaseService,
    public BrokerService: BrokerService,
    public dialogRef: MatDialogRef<AddBrokerDialogComponent>,
    public fb: FormBuilder,
    public authService: AuthService,
    public fileservice: FileService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    try {
      this.userId = firebase.auth().currentUser.uid;
    } catch (err) {
      this.userId = '';
    }
    this.isManager = this.authService.isManager();

    this.editBrokerForm = this.fb.group({
      brokerId: [this.data.brokerId],
      firstName: [this.data.firstName],
      lastName: [this.data.lastName],
      'fullName': [''],
      userName: [this.data.userName],
      aveRating: [this.data.aveRating],
      contactNumber: [this.data.contactNumber],
      addressStreet: [this.data.addressStreet],
      addressTown: [this.data.addressTown],
      addressCity: [this.data.addressCity],
      addressRegion: [this.data.addressRegion],

      uid: [this.data.uid]
    });
    // console.log(this.data.photoURL)
    this.previewphoto = this.data.photoURL.photoURL;
  }

  async submitEditBrokerForm() {
    console.log(this.editBrokerForm);
    if (this.editBrokerForm.valid) {
      let photoURL;
      if (this.thepreviewphoto) {
        const path = `broker/storeFile${new Date().getTime()}_${this.thepreviewphoto.name}`;
        const fileprop = await this.fileservice.upload_in_storage(path, this.thepreviewphoto, this.userId, 'broker');
        photoURL = { id: fileprop['id'], photoURL: fileprop['photoURL'] };
      }
      const fullName = this.data.firstName + ' ' + this.data.lastName;
      this.editBrokerForm.controls['fullName'].setValue(fullName);
      this.BrokerService.updateBroker(this.data.id, this.editBrokerForm.value, photoURL);
      this.dialogRef.close();
    }
  }

  btnclickphoto() {
    jQuery('#photochange').click();
  }

  changephoto(event) {
    console.log(event);
    this.thepreviewphoto = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event: any) => {
      // console.log(event.target.result);
      // this.arrayphoto.push(event.target.result);
      this.previewphoto = event.target.result;
    };
    reader.readAsDataURL(this.thepreviewphoto);
  }

  deleteBroker() {
    this.firebaseService.deleteOne(this.data.id, 'broker');
    this.firebaseService.deleteOne(this.data.uid, 'users');
    // this.BrokerService.deleteBroker(this.data.uid)
    this.dialogRef.close();
  }

  updateRating() {
    this.BrokerService.computeRating(this.data.uid);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
