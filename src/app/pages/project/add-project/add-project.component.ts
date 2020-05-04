import { Component, OnInit, Inject, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FirebaseService, FileService, ProjectService, Project, BrokerService } from '../../../shared';
import { MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, Params } from '@angular/router';
import { MatTableDataSource, MatPaginator } from '@angular/material';
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
  selectedClientUid;
  selectedClient;
  selectedAgentUid;
  selectedAgent;

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
  cover_photo_file: any;
  card_photo: any;
  card_photo_file: any;


  ngOnInit() {
    try {

      this.userId = sessionStorage.getItem('session-user-uid');
    } catch (err) {
      this.userId = '';
    }
  }

  constructor(
    public firebaseService: FirebaseService,
    public fb: FormBuilder,
    public fileservice: FileService,
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
      addressStreet: [''],
      addressTown: [''],
      addressCity: [''],
      addressRegion: [''],
      addressLatitude: [''],
      addressLongtitude: [''],
      cost: [''],
      status: [''],
      'amenities': this.fb.array([]),
      'agentUid': [''],
      'agentName': [''],
      'photoURL': [''],
      'cover_photo': [''],
      'card_photo': [''],
      isArchived: [false],
      isFeatured : [false],
      dateAdded: new Date()
    });
  }

  get amenities() {
    return this.addProjectForm.get('amenities') as FormArray;
  }

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
    }
    if (this.picFile.length > 0) {
      this.fileupload();
    } else {
      this.submitFinal();
    }
  }

  submitFinal() {
    // console.log(this.);
    // this.addProjectForm.controls['photoURL'].setValue(this.filestored);
    console.log(this.addProjectForm);
    this.firebaseService.addOne(this.addProjectForm.value, 'project');
    this.firebaseService.audit('Project' , 'Created Project ' + this.addProjectForm.value.name);
    this.router.navigate(['/project']);
  }

  uploadImageAsPromise(file, islast) {
    console.log(file);
    // var fs = this.fileservice;
    const path = `project/storeFile${new Date().getTime()}_${file.name}`;
    return new Promise(function (resolvse, reject) {
      var storageRef = firebase.storage().ref(path);

      //Upload file
      var task = storageRef.put(file);
      console.log(JSON.stringify(file));
      task.then(function (snapshot) {
        snapshot.ref.getDownloadURL().then(async function (url) {  // Now I can use url
          var file1 = {
            name: file.name,
            lastModified: file.lastModified,
            lastModifiedDate: file.lastModifiedDate,
            webkitRelativePath: file.webkitRelativePath,
            size: file.size,
            type: file.type
          };
          const id = await this.firestore.createId();
          var fileprop = {
            id: id,
            fileProperties: file1,
            uidUploaded: this.userId,
            section: 'BMS',
            fileName: `storeFile${new Date().getTime()}_${file.name}`,
            category: 'project',
            photoURL: url,
            path: path
          };
          console.log(fileprop);
          var fileID = await this.fileservice.createFile(fileprop);
          console.log('fileid');

          this.filestored.push(id);


          if (islast) {

            this.submitFinal();
          }
          console.log(this.filestored);
        });
      });
    });
  }

  async fileupload() {
    try {
      console.log(this.picFile);
      // var filestored = [];
      // this.uploadprogress(this.picFile);
      const savephotos = [];

      for (let i = 0; i < this.picFile.length; i++) {
        const file = this.picFile[i];
        // this.uploadImageAsPromise(this.picFile[i], islast);
        const path = `project/storeFile${new Date().getTime()}_${file.name}`;
        const fileprop = await this.fileservice.upload_in_storage(path, file, this.userId, 'project');
        savephotos.push({ id: fileprop['id'], photoURL: fileprop['photoURL'] });
      }

      const cover_photo_path = `project/storeFile${new Date().getTime()}_${this.cover_photo_file.name}`;
      const cover_photo_fileprop = await this.fileservice.upload_in_storage(
        cover_photo_path, this.cover_photo_file, this.userId, 'project');

      const card_photo_path = `project/storeFile${new Date().getTime()}_${this.card_photo_file.name}`;
      const card_photo_fileprop = await this.fileservice.upload_in_storage(
        card_photo_path, this.card_photo_file, this.userId, 'project');
      console.log(savephotos);

      this.addProjectForm.controls['photoURL'].setValue(savephotos);
      this.addProjectForm.controls['cover_photo'].setValue({ id: cover_photo_fileprop['id'], photoURL: cover_photo_fileprop['photoURL']} );
      this.addProjectForm.controls['card_photo'].setValue({ id: card_photo_fileprop['id'], photoURL: card_photo_fileprop['photoURL']} );
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
    return i;
  }

  addphotoview() {
    document.getElementById('inputfileview').click();
  }

  addphotoview2() {
    document.getElementById('inputfileview2').click();
  }

  addcoverphotoview() {

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
      const reader = new FileReader();
      reader.onload = (event: any) => {
        // console.log(event.target.result);
        // this.arrayphoto.push(event.target.result);
        this.cover_photo = event.target.result;
      };
      reader.readAsDataURL(this.cover_photo_file);
    } catch (err) {
      console.log(err);
    }
  }

  addcardphoto(file) {
    try {
      console.log(file.target.files);

      if (file.target.files.length) {
        document.getElementById('addbutton2').classList.remove('btn-primary');
        document.getElementById('addbutton2').classList.add('btn-success');
      } else {
        document.getElementById('addbutton2').classList.add('btn-primary');
        document.getElementById('addbutton2').classList.remove('btn-success');
      }

      this.card_photo_file = file.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        // console.log(event.target.result);
        // this.arrayphoto.push(event.target.result);
        this.card_photo = event.target.result;
      };
      reader.readAsDataURL(this.card_photo_file);
    } catch (err) {
      console.log(err);
    }
  }

  // addphotos(files) {
  //   //this.arrayphoto=[];

  //   this.viewFiles = files;
  //   for (var i = 0; i < this.viewFiles.length; i++) {
  //     var reader = new FileReader();
  //     reader.onload = (event: any) => {
  //       //console.log(event.target.result);
  //       this.arrayphoto.push(event.target.result);
  //     }
  //     reader.readAsDataURL(files[i]);
  //   }


  //   console.log(this.viewFiles);


  // }

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
  displayedColumnsClient: string[] = ['fullName', 'addressCity', 'addressRegion'];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(
    public firebaseService: FirebaseService,
    public dialogRef: MatDialogRef<ViewProjectClientDialogComponent>,
    public brokerService: BrokerService,

  ) { }

  ngOnInit() {
    this.getClient();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.clients.filter = filterValue.trim().toLowerCase();
  }

  getClient() {
    this.clientSub = this.firebaseService.getAllData('client').subscribe(result => {
      this.clients = new MatTableDataSource(result);
      this.clients.paginator = this.paginator;
    });
  }

  selectClient(value) {
    this.selectedClientUid = value.uid;
    this.selectedClient = value.fullName;
  }

  onNoClick(): void {

    this.selected.push(this.selectedClientUid);
    this.selected.push(this.selectedClient);

    this.dialogRef.disableClose = true; // disable default close operation
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
  displayedColumnsAgent: string[] = ['fullName', 'addressCity', 'addressRegion'];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

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
      this.agents.paginator = this.paginator;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.agents.filter = filterValue.trim().toLowerCase();
  }

  selectAgent(value) {
    this.selectedAgenttUid = value.uid;
    this.selectedAgent = value.fullName;
  }

  onNoClick(): void {

    this.selected.push(this.selectedAgenttUid);
    this.selected.push(this.selectedAgent);

    this.dialogRef.disableClose = true; // disable default close operation
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
