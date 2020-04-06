import { Component, OnInit, Inject, OnDestroy, ElementRef } from '@angular/core';
import { FirebaseService, FileService, ProjectService, Project, BrokerService } from '../../../shared';
import { MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, Params } from '@angular/router';
import { MatTableDataSource } from '@angular/material';
import { Subscription, Observable } from 'rxjs';

import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss']
})
export class AddProjectComponent implements OnInit, OnDestroy {

  addProjectForm: any;
  selectedClientUid
  selectedClient
  selectedAgentUid
  selectedAgent

  picFile: any;
  fileRef: AngularFireStorageReference;
  task: AngularFireUploadTask;
  toAddUpload: any[];
  qtyinput = '';
  userId: any;
  filestored = [];
  testing = '';
  viewFile = [];

  viewFiles: any;
  arrayphoto = [];
  cover_photo: any;
  cover_photo_file: any

  ngOnInit() {
    try {

      this.userId = firebase.auth().currentUser.uid
    } catch (err) {
      this.userId = '';
    }
  }

  constructor(
    public firebaseService: FirebaseService,
    public fb: FormBuilder,
    public fileservice: FileService,
    private firestore: AngularFirestore,
    public brokerService: BrokerService,
    public dialog: MatDialog,
    public router: Router,
    @Inject(AngularFireStorage) private afStorage: AngularFireStorage
  ) {
    this.addProjectForm = this.fb.group({
      name: [''],
      overview: [''],
      saleType: [''],
      propertyType: [''],
      'ownerClientUid': [''],
      'ownerClientName': [''],
      //addressStreet: [''],
      addressTown: [''],
      //addressCity: [''],
      addressRegion: [''],
      cost: [''],
      status: [''],
      'amenities': this.fb.array([]),
      'agentUid': [''],
      'agentName': [''],
      'photoURL': [''],
      'cover_photo': [''],
      isArchived: [false],
      'isFeatured' : [false]
    });
  }

  get amenities() {
    return this.addProjectForm.get('amenities') as FormArray;
  }

  /////// This is new /////////////////

  addAmenities() {
    this.amenities.push(new FormControl(''));
  }

  deleteAmenities(index) {
    this.amenities.removeAt(index);
  }

  submitAddProjectForm() {
    if (this.addProjectForm.valid) {
      this.addProjectForm.controls['ownerClientUid'].setValue(this.selectedClientUid);
      this.addProjectForm.controls['agentUid'].setValue(this.selectedAgentUid);
      this.addProjectForm.controls['ownerClientName'].setValue(this.selectedClient);
      this.addProjectForm.controls['agentName'].setValue(this.selectedAgent);
      this.addProjectForm.controls['isFeatured'].setValue(this);
      // this.fileupload();


    }
    if (this.picFile.length > 0) {
      this.fileupload();
    } else {
      this.submitFinal();
    }

  }
  submitFinal() {
    // console.log(this.);
    //t his.addProjectForm.controls['photoURL'].setValue(this.filestored);
    console.log(this.addProjectForm);
    this.firebaseService.addOne(this.addProjectForm.value, 'project');
    this.router.navigate(['/project']);
  }

  uploadImageAsPromise(fl, islast) {
    console.log(fl);
    var thisclass = this;
    var fs = this.fileservice;
    const path = `project/storeFile${new Date().getTime()}_${fl.name}`;
    return new Promise(function (resolvse, reject) {
      var storageRef = firebase.storage().ref(path);

      //Upload file
      var task = storageRef.put(fl);
      console.log(JSON.stringify(fl));
      task.then(function (snapshot) {
        snapshot.ref.getDownloadURL().then(async function (url) {  // Now I can use url
          var file1 = {
            name: fl.name,
            lastModified: fl.lastModified,
            lastModifiedDate: fl.lastModifiedDate,
            webkitRelativePath: fl.webkitRelativePath,
            size: fl.size,
            type: fl.type
          };
          const id = await thisclass.firestore.createId();
          var fileprop = {
            id: id,
            fileProperties: file1,
            uidUploaded: thisclass.userId,
            section: 'BMS',
            fileName: `storeFile${new Date().getTime()}_${fl.name}`,
            category: 'project',
            photoURL: url,
            path: path
          };
          console.log(fileprop);
          var fileID = await thisclass.fileservice.createFile(fileprop);
          console.log('fileid');

          thisclass.filestored.push(id);


          if (islast) {

            thisclass.submitFinal();
          }
          console.log(thisclass.filestored);
        });
      });
    });
  }

  async fileupload() {
    try {
      console.log(this.picFile);
      var filestored = [];
      //this.uploadprogress(this.picFile);
      var savephotos = [];
      for (var i = 0; i < this.picFile.length; i++) {
        var fl = this.picFile[i];
        //this.uploadImageAsPromise(this.picFile[i], islast);
        const path = `project/storeFile${new Date().getTime()}_${fl.name}`;
        var fileprop = await this.fileservice.upload_in_storage(path, fl, this.userId, 'project');
        savephotos.push({ id: fileprop['id'], photoURL: fileprop['photoURL'] })
      }
      const path = `project/storeFile${new Date().getTime()}_${this.cover_photo_file.name}`;
      var fileprop = await this.fileservice.upload_in_storage(path, this.cover_photo_file, this.userId, 'project');
      console.log(savephotos);
      this.addProjectForm.controls['photoURL'].setValue(savephotos);
      this.addProjectForm.controls['cover_photo'].setValue({ id: fileprop['id'], photoURL: fileprop['photoURL']} );
      this.submitFinal();
    } catch (err) {
      alert(err.message);
    }
  }
  inputFileClick() {
    document.getElementById('inputfile').click();

  }
  getFile(event) {
    this.picFile = event.target.files;
    console.log(this.picFile);
    if (this.picFile.length) {
      document.getElementById('uploadbtn').classList.remove('btn-primary');
      document.getElementById('uploadbtn').classList.add('btn-success');
      this.qtyinput = 'a file attached';
      try {
        console.log(this.picFile);
        for (var i = 0; i < this.picFile.length; i++) {
          var reader = new FileReader();
          reader.onload = (event: any) => {
            // console.log(event.target.result);
            this.arrayphoto.push(event.target.result);
          }
          reader.readAsDataURL(this.picFile[i]);
        }
      } catch (err) {

      }


    } else {
      document.getElementById('uploadbtn').classList.remove('btn-success');
      document.getElementById('uploadbtn').classList.add('btn-primary');
    }

  }

  trackByFn(i: number) {
    return i
  }
  addphotoview() {
    document.getElementById('inputfileview').click();
  }
  addcoverphotoview(){
    
  }
  addcoverphoto(file) {
    try {
      console.log(file.target.files);

      if (file.target.files.length) {
        document.getElementById('addbutton').classList.remove('btn-primary');
        document.getElementById('addbutton').classList.add('btn-success');
      } else {
        document.getElementById('addbutton').classList.add('btn-primary');
        document.getElementById('addbutton').classList.remove('btn-success');
      }

      this.cover_photo_file = file.target.files[0];
      var reader = new FileReader();
      reader.onload = (event: any) => {
        //console.log(event.target.result);
        //this.arrayphoto.push(event.target.result);
        this.cover_photo = event.target.result;
      }
      reader.readAsDataURL(this.cover_photo_file);
    } catch (err) {

    }
  }
  addphotos(files) {
    //this.arrayphoto=[];

    this.viewFiles = files;
    for (var i = 0; i < this.viewFiles.length; i++) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        //console.log(event.target.result);
        this.arrayphoto.push(event.target.result);
      }
      reader.readAsDataURL(files[i]);
    }


    console.log(this.viewFiles);


  }

  pickClient() {
    this.dialog.open(ViewProjectClientDialogComponent).afterClosed().subscribe(result => {
      this.selectedClientUid = result[0];
      this.selectedClient = result[1];
    });
  }

  pickAgent() {
    this.dialog.open(ViewProjectAgentDialogComponent).afterClosed().subscribe(result => {
      this.selectedAgentUid = result[0];
      this.selectedAgent = result[1];
    });
  }

  goBack() {
    this.router.navigate(['/project']);
  }

  ngOnDestroy(): void {

  }

}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'view-client-dialog',
  templateUrl: '../dialog/view-client-dialog.html',
  styleUrls: ['../project.component.scss'],
})

export class ViewProjectClientDialogComponent implements OnInit, OnDestroy {

  clientSub: Subscription;
  clients: MatTableDataSource<any>;
  selectedClientUid = '';
  selectedClient = '';
  selected = [];
  displayedColumnsClient: string[] = ['fullName', 'userName', 'email'];

  constructor(
    public firebaseService: FirebaseService,
    public dialogRef: MatDialogRef<ViewProjectClientDialogComponent>,

    public brokerService: BrokerService,

  ) { }

  ngOnInit() {
    this.getClient();
  }

  getClient() {
    this.clientSub = this.firebaseService.getAllData('client').subscribe(result => {
      this.clients = new MatTableDataSource(result);
    });
  }

  selectClient(value) {
    this.selectedClientUid = value.uid;
    this.selectedClient = value.fullName;
  }

  onNoClick(): void {

    this.selected.push(this.selectedClientUid);
    this.selected.push(this.selectedClient);

    this.dialogRef.disableClose = true;//disable default close operation
    this.dialogRef.backdropClick().subscribe(result => {
      this.dialogRef.close(this.selected);
    });
    this.dialogRef.close(this.selected);
  }

  ngOnDestroy() {
    if (this.clientSub != null) {
      this.clientSub.unsubscribe();
    }
  }

}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'view-agent-dialog',
  templateUrl: '../dialog/view-agent-dialog.html',
  styleUrls: ['../project.component.scss'],
})

export class ViewProjectAgentDialogComponent implements OnInit, OnDestroy {

  agentSub: Subscription;
  agents: MatTableDataSource<any>;
  selectedAgenttUid = '';
  selectedAgent = '';
  selected = [];
  displayedColumnsAgent: string[] = ['fullName', 'userName', 'email'];

  constructor(
    public firebaseService: FirebaseService,
    public dialogRef: MatDialogRef<ViewProjectAgentDialogComponent>,

    public brokerService: BrokerService,

  ) { }

  ngOnInit() {
    this.getAgent();
  }

  getAgent() {
    this.agentSub = this.brokerService.getWithPosition('Agent').subscribe(result => {
      this.agents = new MatTableDataSource(result);
    });
  }

  selectAgent(value) {
    this.selectedAgenttUid = value.uid;
    this.selectedAgent = value.fullName;
  }

  onNoClick(): void {

    this.selected.push(this.selectedAgenttUid);
    this.selected.push(this.selectedAgent);

    this.dialogRef.disableClose = true;//disable default close operation
    this.dialogRef.backdropClick().subscribe(result => {
      this.dialogRef.close(this.selected);
    });
    this.dialogRef.close(this.selected);
  }

  ngOnDestroy() {
    if (this.agentSub != null) {
      this.agentSub.unsubscribe();
    }
  }

}
