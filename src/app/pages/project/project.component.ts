import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FirebaseService } from '../../shared/services';
import { MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
// import { Router, Params } from '@angular/router';
import { ProjectService } from '../../shared';
import { Project } from '../../shared';
import { MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
import * as cors from 'cors';
// import * as firebase from 'firebase';
import { finalize } from 'rxjs/operators';
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

  constructor(public firebaseService: FirebaseService,
    public projectService: ProjectService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.getData();
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
      status: value.status,
      agentName: value.agentName,
      agentUid: value.agentUid
    };
    dialogConfig.maxWidth = '50vw';
    dialogConfig.width = '50vw';
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
  displayedColumnsAgent: string[] = ['fullName', 'userName', 'email'];

  ngOnInit() {
    this.getAgentandClient();
  }

  constructor(
    public firebaseService: FirebaseService,
    public dialogRef: MatDialogRef<AddProjectDialogComponent>,
    public fb: FormBuilder,
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

      try {
        console.log(this.picFile);
        for (var i = 0; i < this.picFile.length; i++) {

          // const customMetadata = { app: 'Profile Pics' };

          const randomId = Math.random().toString(36).substring(2);
          const path = `project/storeFile${new Date().getTime()}_${this.picFile[i].name}`;
          const customMetadata = { app: 'Project' };
          this.fileRef = this.afStorage.ref(path);
          // this.task = this.ref.put(this.picFile[i]);

          // this.task = this.afStorage.upload(path, this.picFile[i], { customMetadata });
          /*this.task.snapshotChanges().pipe(
            finalize(() => {
              // Get uploaded file storage path
              var UploadedFileURL = this.fileRef.getDownloadURL();
              UploadedFileURL.subscribe(resp => {
                console.log(resp);
              }, error => {
                console.error(error);
              })
            })
          )*/
          this.afStorage.upload(path, this.picFile[i]).snapshotChanges().pipe(
            finalize(() => {
              this.fileRef.getDownloadURL().subscribe((url) => {
                // this.url = url;
                // this.fileService.insertImageDetails(this.id, this.url);
                console.log(url);
                this.addProjectForm.controls['photoURL'].setValue(url);
                this.firebaseService.addOne(this.addProjectForm.value, 'project');
                this.dialogRef.close();
                alert('Upload Successful');
              })
            })
          ).subscribe();
        }
      } catch (err) {
        alert(err.message);
      }

    }
  }
  inputFileClick() {
    document.getElementById('inputfile').click();

  }
  getFile(event) {
    this.picFile = event.target.files;
    console.log(this.picFile > 0);
    if (this.picFile.length) {
      document.getElementById('uploadbtn').classList.remove('btn-primary');
      document.getElementById('uploadbtn').classList.add('btn-success');
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
      agentUid:[this.data.agentUid]
    });
  }

  submitEditProjectForm() {
    if (this.editProjectForm.valid) {
      this.projectService.updateProject(this.data.id, this.editProjectForm.value);
      this.dialogRef.close();
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
      dateApproved:[''],
      documentCollectionId: [''],
      status: ['customer stage 2'],
      isCompleted: [false],
      isManagerApproved: [false],
      isCustomerApproved: [false],
      isDeleted : [false]
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
      this.firebaseService.addOne(this.saleProjectForm.value , 'transaction');
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
