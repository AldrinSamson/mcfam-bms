import { Component, OnInit, Inject , OnDestroy } from '@angular/core';
import { FirebaseService } from '../../shared/services';
import { MatDialog, MatDialogRef , MatDialogConfig , MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, Params } from '@angular/router';
import { ProjectService } from '../../shared';
import { Project } from '../../shared';
import { MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit , OnDestroy {

  displayedColumnsProject: string[] = ['name' , 'saleType' , 'propertyType' , 'addressStreet' , 'addressTown' , 'addressCity' , 'addressRegion' , 'cost' , 'status'];

  projects: MatTableDataSource<any>;

  public projectSub: Subscription;

  constructor( public firebaseService: FirebaseService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.getData();
  }
  getData() {
    this.projectSub = this.firebaseService.getAllData('project')
    .subscribe(result => {
      this.projects = new MatTableDataSource(result) ;
    });
  }

  openAddProject(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = '50vw';
    dialogConfig.width = '50vw';
    this.dialog.open(AddProjectDialogComponent , dialogConfig).afterClosed().subscribe(result => {

    });
  }
  openViewProject(value): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      id : value.id,
      name : value.name,
      overview : value.overview,
      saleType : value.saleType,
      propertyType : value.propertyType,
      ownerClientName : value.ownerClientName,
      addressStreet : value.addressStreet,
      addressTown : value.addressTown,
      addressCity : value.addressCity,
      addressRegion : value.addressRegion,
      cost : value.cost,
      status : value.status,
      agentName : value.agentName
    };
    dialogConfig.maxWidth = '50vw';
    dialogConfig.width = '50vw';
    this.dialog.open(ViewProjectDialogComponent, dialogConfig).afterClosed().subscribe(result => {
      this.getData();
    });
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    this.projectSub.unsubscribe();
  }
}

@Component({
  // tslint:disable-next-line:component-selector
  selector : 'add-project-dialog',
  templateUrl : './dialog/add-project-dialog.html',
  styleUrls: ['./project.component.scss'],
})

export class AddProjectDialogComponent implements OnInit , OnDestroy {

  addProjectForm: any;
  public clientSub: Subscription;
  agentSub: Subscription;

  clients: MatTableDataSource<any>;
  selectedClientUid = '';
  selectedClient = '';
  displayedColumnsClient: string[] = ['fullName' , 'userName' , 'email'];

  agents: MatTableDataSource<any>;
  selectedAgentUid = '';
  selectedAgent = '';
  displayedColumnsAgent: string[] = ['fullName' , 'userName' , 'email'];

  ngOnInit() {
    this.getAgentandClient();
  }

  constructor(
    public firebaseService: FirebaseService,
    public dialogRef: MatDialogRef<AddProjectDialogComponent>,
    public fb: FormBuilder,
  ) {
    this.addProjectForm = this.fb.group({
      name: [''],
      overview: [''],
      saleType: [''],
      propertyType: [''],
      'ownerClientUid': [''],
      ownerClientName: [''],
      addressStreet: [''],
      addressTown: [''],
      addressCity: [''],
      addressRegion: [''],
      cost: [''],
      status: [''],
      'agentUid': [''],
      agentName: [''],
      photoURL: [''],
      isArchived: [false]
    });
  }

  getAgentandClient() {
    this.clientSub = this.firebaseService.getAllData('client').subscribe( result => {
      this.clients = new MatTableDataSource(result);
    });

    this.agentSub = this.firebaseService.getAllData('broker').subscribe( result => {
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
        this.firebaseService.addOne(this.addProjectForm.value , 'project');
        this.dialogRef.close();
    }
  }

  onNoClick(): void {
  this.dialogRef.close();
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    this.clientSub.unsubscribe();
    this.agentSub.unsubscribe();
  }

}
@Component({
  // tslint:disable-next-line:component-selector
  selector : 'view-project-dialog',
  templateUrl : './dialog/view-project-dialog.html',
  styleUrls: ['./project.component.scss'],
})

export class ViewProjectDialogComponent {
  editProjectForm: any;

  constructor(
    public firebaseService: FirebaseService,
    public projectService: ProjectService,
    public dialogRef: MatDialogRef<AddProjectDialogComponent>,
    public fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      this.editProjectForm = this.fb.group({
        name: [this.data.name],
        overview: [this.data.overview],
        saleType: [this.data.saleType],
        propertyType: [this.data.propertyType],
        ownerClientName: [this.data.ownerClientName],
        addressStreet: [this.data.addressStreet],
        addressTown: [this.data.addressTown],
        addressCity: [this.data.addressCity],
        addressRegion: [this.data.addressRegion],
        cost: [this.data.cost],
        status: [this.data.status],
        agentName: [this.data.agentName]
      });
    }

    submitEditProjectForm() {
        if (this.editProjectForm.valid) {
              this.projectService.updateProject(this.data.id , this.editProjectForm.value );
              this.dialogRef.close();
        }
    }

    deleteProject() {
        this.dialogRef.close();
    }

    onNoClick(): void {
    this.dialogRef.close();
    }
}
