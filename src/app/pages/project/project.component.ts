import { Component, OnInit, Inject, OnDestroy, ElementRef } from '@angular/core';
import { FirebaseService, AuthService, FileService } from '../../shared/services';
import { MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
// import { Router, Params } from '@angular/router';
import { ProjectService } from '../../shared';
import { Project } from '../../shared';
//import { FileService } from '../../shared/services/file.service';
import { MatTableDataSource } from '@angular/material';
import { Subscription, Observable } from 'rxjs';

import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
import * as cors from 'cors';
import * as $ from 'jquery';
import * as firebase from 'firebase';
import { finalize } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
const corsHandler = cors({ origin: true });
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {

  displayedColumnsProject: string[] = ['name', 'saleType', 'propertyType', 'addressStreet', 'addressTown', 'addressCity', 'addressRegion', 'cost', 'status'];

  projects: MatTableDataSource<any>;

  public projectSub: Subscription;
  viewFile = '';
  qtyinput = '';
  userId: string;

  fileslist: any[];
  joined$: Observable<any>;

  constructor(public firebaseService: FirebaseService,
    public projectService: ProjectService,
    public dialog: MatDialog, public fileservice: FileService, authService: AuthService) {
    try {
      this.fileslist = this.fileservice.getFiles();
      this.userId = firebase.auth().currentUser.uid
    } catch (err) {
      this.userId = '';
    }

  }

  ngOnInit() {
    this.getData();
    this.fileslist = this.fileservice.getFiles();
    console.log(this.fileslist);
  }
  getData() {
    this.projectSub = this.projectService.getProjects(false)
      .subscribe(result => {
        this.projects = new MatTableDataSource(result);
      });
  }

  openAddProject(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = '100vw';
    dialogConfig.width = '100vw';
    this.dialog.open(AddProjectDialogComponent, dialogConfig).afterClosed().subscribe(result => {

    });
  }
  openViewProject(value): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      id: value.id,
      name: value.name,
      overview: value.overview,
      saleType: value.saleType,
      propertyType: value.propertyType,
      ownerClientName: value.ownerClientName,
      ownerClientUid: value.ownerClientUid,
      addressStreet: value.addressStreet,
      addressTown: value.addressTown,
      addressCity: value.addressCity,
      addressRegion: value.addressRegion,
      cost: value.cost,
      photoURL: value.photoURL,
      status: value.status,
      agentName: value.agentName,
      agentUid: value.agentUid
    };
    console.log("value.photoURL");
    console.log(value.photoURL);

    //console.log(this.fileservice.getFiles())
    this.fileslist = this.fileservice.getFiles();
    //console.log(this.fileslist);
    this.viewFile = 'sds';
    var thevf = [];
    //thevf.innerHTML='asd';
    console.log(thevf);
    for (var i = 0; i < this.fileslist.length; i++) {
      //var x = document.getElementById(value.photoURL[i]);
      //x.src = '';
      var y = this.fileslist[i]
      for (var j = 0; j < value.photoURL.length; j++) {
        var x = value.photoURL[j];

        if (x === y.id) {
          //thevf = x.photoURL+"<br>";
          thevf.push(y);
        }
      }

      //jQuery(".image2").attr("src","image1.jpg");
    }
    console.log("(thevf)");

    console.log((thevf));
    dialogConfig.data.photoURL = thevf;
    dialogConfig.maxWidth = '50vw';
    dialogConfig.width = '50vw';
    console.log(dialogConfig.data)
    this.dialog.open(ViewProjectDialogComponent, dialogConfig).afterClosed().subscribe(result => {
      this.getData();
    });
  }

  ngOnDestroy(): void {
    if (this.projectSub != null) {
      this.projectSub.unsubscribe();
    }
  }
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'add-project-dialog',
  templateUrl: './dialog/add-project-dialog.html',
  styleUrls: ['./project.component.scss'],
})

export class AddProjectDialogComponent implements OnInit, OnDestroy {

  addProjectForm: any;
  clientSub: Subscription;
  agentSub: Subscription;
  picFile: any;
  clients: MatTableDataSource<any>;
  selectedClientUid = '';
  selectedClient = '';
  displayedColumnsClient: string[] = ['fullName', 'userName', 'email'];
  fileRef: AngularFireStorageReference;
  task: AngularFireUploadTask;
  agents: MatTableDataSource<any>;
  selectedAgentUid = '';
  selectedAgent = '';
  toAddUpload: any[];
  displayedColumnsAgent: string[] = ['fullName', 'userName', 'email'];
  qtyinput = '';
  userId: any;
  filestored = [];
  testing = '';
  viewFile = [];
  ngOnInit() {
    this.getAgentandClient();
  }

  constructor(
    public firebaseService: FirebaseService,
    public dialogRef: MatDialogRef<AddProjectDialogComponent>,
    public fb: FormBuilder,
    public fileservice: FileService,
    private firestore: AngularFirestore,
    @Inject(AngularFireStorage) private afStorage: AngularFireStorage
  ) {
    try {
      this.userId = firebase.auth().currentUser.uid;
    } catch (err) {
      this.userId = "";
    }
    localStorage.setItem('user', JSON.stringify(this.userId));
    console.log(this.userId);
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
      cost: [''],
      status: [''],
      'agentUid': [''],
      'agentName': [''],
      'photoURL': [''],
      isArchived: [false]
    });
  }

  getAgentandClient() {
    this.clientSub = this.firebaseService.getAllData('client').subscribe(result => {
      this.clients = new MatTableDataSource(result);
    });

    this.agentSub = this.firebaseService.getAllData('broker').subscribe(result => {
      this.agents = new MatTableDataSource(result);
    });
  }

  selectClient(value) {
    this.selectedClientUid = value.uid;
    this.selectedClient = value.fullName;
  }

  selectAgent(value) {
    this.selectedAgentUid = value.uid;
    this.selectedAgent = value.fullName;
  }

  submitAddProjectForm() {
    if (this.addProjectForm.valid) {
      this.addProjectForm.controls['ownerClientUid'].setValue(this.selectedClientUid);
      this.addProjectForm.controls['agentUid'].setValue(this.selectedAgentUid);
      this.addProjectForm.controls['ownerClientName'].setValue(this.selectedClient);
      this.addProjectForm.controls['agentName'].setValue(this.selectedAgent);
      //this.fileupload();


    }
    if (this.picFile.length > 0 ) {
      this.fileupload();
    } else {
      this.submitFinal();
    }

  }
  submitFinal() {
    //console.log(this.);
    this.addProjectForm.controls['photoURL'].setValue(this.filestored);
    this.firebaseService.addOne(this.addProjectForm.value, 'project');
    this.dialogRef.close();
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

  fileupload() {
    try {
      console.log(this.picFile);
      var filestored = [];
      //this.uploadprogress(this.picFile);
      for (var i = 0; i < this.picFile.length; i++) {
        var islast = i == this.picFile.length - 1;
        this.uploadImageAsPromise(this.picFile[i], islast);
      }
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
      this.qtyinput = "a file attached";;
    } else {
      document.getElementById('uploadbtn').classList.remove('btn-success');
      document.getElementById('uploadbtn').classList.add('btn-primary');
    }

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this.clientSub != null) {
      this.clientSub.unsubscribe();
    }

    if (this.agentSub != null) {
      this.agentSub.unsubscribe();
    }
  }

}
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'view-project-dialog',
  templateUrl: './dialog/view-project-dialog.html',
  styleUrls: ['./project.component.scss'],
})

export class ViewProjectDialogComponent {
  editProjectForm: any;

  constructor(
    public firebaseService: FirebaseService,
    public projectService: ProjectService,
    public dialogRef: MatDialogRef<ViewProjectDialogComponent>,
    public fb: FormBuilder,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.editProjectForm = this.fb.group({
      name: [this.data.name],
      overview: [this.data.overview],
      saleType: [this.data.saleType],
      propertyType: [this.data.propertyType],
      ownerClientName: [this.data.ownerClientName],
      ownerClientUid: [this.data.ownerClientUid],
      addressStreet: [this.data.addressStreet],
      addressTown: [this.data.addressTown],
      addressCity: [this.data.addressCity],
      addressRegion: [this.data.addressRegion],
      cost: [this.data.cost],
      status: [this.data.status],
      agentName: [this.data.agentName],
      agentUid: [this.data.agentUid]
    });
  }

  submitEditProjectForm() {
    if (this.editProjectForm.valid) {
      this.projectService.updateProject(this.data.id, this.editProjectForm.value);
      
      this.dialogRef.close();
    }
  }
  toRemove(event) {
    console.log(event);
    var getid = event.target.value.split("|")[0];
    if (event.target.checked) {
      //document.getElementById('photoID_' + getid).classList.remove('btn-primary');
      document.getElementById('photoID_' + getid).classList.add('blurtodelete');
    
    } else {
      document.getElementById('photoID_' + getid).classList.remove('blurtodelete');
      //document.getElementById('photoID_' + getid).classList.add('btn-success');
    }
  }
  choosedelete(){
    console.log($('#choosedelete').hasClass("btn-danger"))
    if ($('#choosedelete').hasClass("btn-danger")) {
      document.getElementById('choosedelete').classList.add('btn-outline-danger');
      document.getElementById('choosedelete').classList.remove('btn-danger');
      $('#choosedelete').html("Cancel for deletion")
      $('.forlabel').wrap( "<label></label>" );
    } else {
      document.getElementById('choosedelete').classList.add('btn-danger');
      document.getElementById('choosedelete').classList.remove('btn-outline-danger');
      $('#choosedelete').html("Choose photo(s) to delete")
      //$('forlabel').wrap( "<label></label>" );
      $('.photoURL').removeClass('blurtodelete');
       
      $('.forlabel').unwrap(  );
    }
  }
  openTransaction() {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      projectUid: this.data.id,
      projectName: this.data.name,
      projectCost: this.data.cost,
      projectSaleType: this.data.saleType,
      agentName: this.data.agentName,
      agentUid: this.data.agentUid
    };
    dialogConfig.maxWidth = '50vw';
    dialogConfig.width = '50vw';
    this.dialog.open(SaleProjectDialogComponent, dialogConfig).afterClosed().subscribe(result => {
      this.dialogRef.close();
    });

  }

  archiveProject() {
    this.firebaseService.archiveOne(this.data.id, 'project');
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'sale-project-dialog',
  templateUrl: './dialog/sale-project-dialog.html',
  styleUrls: ['./project.component.scss'],
})

export class SaleProjectDialogComponent implements OnInit, OnDestroy {

  public dateNow = Date.toString();

  saleProjectForm: any;

  clientSub: Subscription;
  clients: MatTableDataSource<any>;
  selectedClientUid = '';
  selectedClient = '';
  displayedColumnsClient: string[] = ['fullName', 'userName', 'email'];

  managerSub: Subscription;
  managers: MatTableDataSource<any>;
  selectedManagerUid = '';
  selectedManager = '';
  displayedColumnsManager: string[] = ['fullName', 'userName', 'email'];

  constructor(
    public firebaseService: FirebaseService,
    public projectService: ProjectService,
    public dialogRef: MatDialogRef<ViewProjectDialogComponent>,
    public fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.saleProjectForm = this.fb.group({
      projectUid: [this.data.projectUid],
      projectName: [this.data.projectName],
      projectCost: [this.data.projectCost],
      projectSaleType: [this.data.projectSaleType],
      agentName: [this.data.agentName],
      agentUid: [this.data.agentUid],
      'clientName': [''],
      'clientUid': [''],
      'managerName': [''],
      'managerUid': [''],
      brokerRate: [''],
      dateStart: [new Date()],
      dateEnd: [''],
      dateApproved: [''],
      documentCollectionId: [''],
      status: ['customer stage 2'],
      isCompleted: [false],
      isManagerApproved: [false],
      isCustomerApproved: [false],
      isDeleted: [false]
    });
  }

  ngOnInit() {
    this.getClientAndManager();
  }

  getClientAndManager() {
    this.clientSub = this.firebaseService.getAllData('client').subscribe(result => {
      this.clients = new MatTableDataSource(result);
    });

    this.managerSub = this.firebaseService.getAllData('broker').subscribe(result => {
      this.managers = new MatTableDataSource(result);
    });
  }

  selectClient(value) {
    this.selectedClientUid = value.uid;
    this.selectedClient = value.fullName;
  }

  selectManager(value) {
    this.selectedManagerUid = value.uid;
    this.selectedManager = value.fullName;
  }

  submitSaleProjectForm() {
    if (this.saleProjectForm.valid) {
      this.saleProjectForm.controls['clientName'].setValue(this.selectedClient);
      this.saleProjectForm.controls['clientUid'].setValue(this.selectedClientUid);
      this.saleProjectForm.controls['managerName'].setValue(this.selectedManager);
      this.saleProjectForm.controls['managerUid'].setValue(this.selectedManagerUid);
      this.firebaseService.addOne(this.saleProjectForm.value, 'transaction');
      this.dialogRef.close();
    }
  }

  ngOnDestroy() {
    if (this.clientSub != null) {
      this.clientSub.unsubscribe();
    }

    if (this.managerSub != null) {
      this.managerSub.unsubscribe();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
