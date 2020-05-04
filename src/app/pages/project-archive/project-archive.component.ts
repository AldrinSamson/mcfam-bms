import { Component, OnInit, Inject , OnDestroy, ViewChild } from '@angular/core';
import { FirebaseService } from '../../shared/services';
import { MatDialog, MatDialogRef , MatDialogConfig , MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, Params } from '@angular/router';
import { ProjectService } from '../../shared';
import { Project } from '../../shared';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-project-archive',
  templateUrl: './project-archive.component.html',
  styleUrls: ['./project-archive.component.scss']
})
export class ProjectArchiveComponent implements OnInit, OnDestroy {

  displayedColumnsProject: string[] = ['name' , 'saleType' , 'propertyType' ,  'addressTown' ,  'addressRegion' , 'cost' , 'status'];

  projects: MatTableDataSource<any>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  public projectSub: Subscription;

  constructor( public firebaseService: FirebaseService,
    public projectService: ProjectService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.projectSub = this.projectService.getProjects(true)
    .subscribe(result => {
      this.projects = new MatTableDataSource(result) ;
      this.projects.paginator = this.paginator;
      this.projects.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.projects.filter = filterValue.trim().toLowerCase();
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
    this.dialog.open(ViewProjectArchiveDialogComponent, dialogConfig).afterClosed().subscribe(result => {
      this.getData();
    });
  }

  ngOnDestroy() {
    if (this.projectSub != null) {
      this.projectSub.unsubscribe();
    }
    // this.projectSub.unsubscribe();
  }

}

@Component({
  selector: 'view-project-archive-dialog',
  templateUrl: './dialog/view-project-archive-dialog.html',
  styleUrls: ['./project-archive.component.scss']
})

export class ViewProjectArchiveDialogComponent {

  editProjectForm: any;

  constructor(
    public firebaseService: FirebaseService,
    public projectService: ProjectService,
    public dialogRef: MatDialogRef<ViewProjectArchiveDialogComponent>,
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

    restoreProject() {
      this.firebaseService.restoreOne(this.data.id , 'project');
      this.firebaseService.audit('Project' , 'Restored Project ' + this.data.name);
      this.dialogRef.close();
    }

    destroyProject() {
      this.firebaseService.deleteOne(this.data.id , 'project');
      this.firebaseService.audit('Project' , 'Deleted Project ' + this.data.name);
      this.dialogRef.close();
    }

    onNoClick(): void {
    this.dialogRef.close();
    }
}




