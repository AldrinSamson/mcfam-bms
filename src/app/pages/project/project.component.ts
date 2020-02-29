import { Component, OnInit, Inject } from '@angular/core';
import { FirebaseService } from '../../shared/services';
import { MatDialog, MatDialogRef , MatDialogConfig , MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, Params } from '@angular/router';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

  constructor( public dialog: MatDialog) { }

  ngOnInit() {
  }

  openAddProject(): void {
    const dialogConfig = new MatDialogConfig();
    this.dialog.open(AddProjectDialogComponent , dialogConfig).afterClosed().subscribe(result => {

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
      ownerClientName: [''],
      addressStreet: [''],
      addressTown: [''],
      addressCity: [''],
      addressRegion: [''],
      cost: [''],
      status: [''],
      agentName: ['']
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
