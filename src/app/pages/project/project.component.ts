import { Component, OnInit, Inject } from '@angular/core';
import { FirebaseService } from '../../shared/services';
import { MatDialog, MatDialogRef , MatDialogConfig , MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, Params } from '@angular/router';
import { ProjectService } from '../../shared';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  items: Array<any>;

  constructor( public firebaseService: FirebaseService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.getData();
  }
  getData() {
    this.firebaseService.getAllData('project')
    .subscribe(result => {
      this.items = result;
    });
  }

  openAddProject(): void {
    const dialogConfig = new MatDialogConfig();
    this.dialog.open(AddProjectDialogComponent , dialogConfig).afterClosed().subscribe(result => {

    });
  }
  openViewProject(value): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      id : value.id,
      name : value.data().name,
      overview : value.data().overview,
      saleType : value.data().saleType,
      propertyType : value.data().propertyType,
      ownerClientName : value.data().ownerClientName,
      addressStreet : value.data().addressStreet,
      addressTown : value.data().addressTown,
      addressCity : value.data().addressCity,
      addressRegion : value.data().addressRegion,
      cost : value.data().cost,
      status : value.data().status,
      agentName : value.data().agentName
    };
    this.dialog.open(ViewProjectDialogComponent, dialogConfig).afterClosed().subscribe(result => {
      this.getData();
    });
  }


}@Component({
  // tslint:disable-next-line:component-selector
  selector : 'add-project-dialog',
  templateUrl : './dialog/add-project-dialog.html',
  styleUrls: ['./project.component.scss'],
})

export class AddProjectDialogComponent {

  addProjectForm: any;

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
      ownerClientUid: [''],
      ownerClientName: [''],
      addressStreet: [''],
      addressTown: [''],
      addressCity: [''],
      addressRegion: [''],
      cost: [''],
      status: [''],
      agentUid: [''],
      agentName: [''],
      photoURL: [''],
      isArchived: ['']
    });
  }
  submitAddProjectForm() {
    if (this.addProjectForm.valid) {
        this.firebaseService.addOne(this.addProjectForm.value , 'project');
        this.dialogRef.close();
    }
}

onNoClick(): void {
this.dialogRef.close();
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