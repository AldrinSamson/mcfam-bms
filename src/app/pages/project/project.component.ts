import { Component, OnInit, Inject, OnDestroy, ElementRef } from '@angular/core';
import { FirebaseService, AuthService, FileService, ProjectService, Project, BrokerService } from '../../shared';
import { MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
// import { Router, Params } from '@angular/router';
import { MatTableDataSource } from '@angular/material';
import { Subscription, Observable } from 'rxjs';

import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
import * as cors from 'cors';
import * as $ from 'jquery';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
const corsHandler = cors({ origin: true });

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {

  public isManager: Boolean;

  projectSearchText;
  projects: Array<any>;
  public projectSub: Subscription;
  p
  
  viewFile = '';
  qtyinput = '';
  userId: string;
  fileslist: any[];
  joined$: Observable<any>;

  userDetails: any;

  constructor(
    public firebaseService: FirebaseService,
    public projectService: ProjectService,
    public dialog: MatDialog,
    public fileservice: FileService,
    public authService: AuthService,
    public router:Router) {

    this.isManager = this.authService.isManager();

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
        this.projects = result;
      });
  }

  openAddProject(): void {
    this.router.navigate(['/project/add']);
  }
  
  openViewProject(value): void {
    this.router.navigate(['/project/'+value.id+'']);
  }

  ngOnDestroy(): void {
    if (this.projectSub != null) {
      this.projectSub.unsubscribe();
    }
  }
  
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'view-project-dialog',
  templateUrl: './dialog/view-project-dialog.html',
  styleUrls: ['./project.component.scss'],
})

export class ViewProjectDialogComponent implements OnInit {
  editProjectForm: any;
  viewFiles=[];
  arrayphoto = [];
  userDetails: any;
  isManager = false;
  userId = '';
  constructor(
    public firebaseService: FirebaseService,
    public projectService: ProjectService,
    public dialogRef: MatDialogRef<ViewProjectDialogComponent>,
    public fb: FormBuilder,
    public fileservice: FileService,
    public dialog: MatDialog,
    public authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isManager = this.authService.isManager();
    console.log(this.data);
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
      photoURL: [this.data.photoURL],
      agentName: [this.data.agentName],
      agentUid: [this.data.agentUid]
    });
  }

  ngOnInit() {
    this.userDetails = JSON.parse(sessionStorage.getItem('session-user-details'))
    if (this.userDetails.position == "Manager") {
      this.isManager = true;
    }
    try {

      this.userId = firebase.auth().currentUser.uid
    } catch (err) {
      this.userId = '';
    }
  }

  async submitEditProjectForm() {
    console.log(this.editProjectForm);
    if (this.editProjectForm.valid) {
      console.log(this.editProjectForm.value['photoURL']);
      //delete existing
      var savephotos = [];
      var deletephotos = [];

      $.each($("input[name='todelete']:not(:checked)"), function () {
        var x = $(this).val().toString().split('|');
        console.log(x);
        savephotos.push(x[0]);
      });
      $.each($("input[name='todelete']:checked"), function () {
        var x = $(this).val().toString().split('|');
        console.log(x);
        deletephotos.push(x);
      });
      /*
      for (var i = 0; i < deletephotos.length; i++) {
        this.fileservice.filedelete(deletephotos[i][0]);
        this.fileservice.delete_in_storage(deletephotos[i][1]);
      }*/
      console.log(deletephotos);
      
      console.log('this.viewFiles.length ' + this.viewFiles.length);
      var x = [];
      for (var i = 0; i < this.viewFiles.length; i++) {
        var fl = this.viewFiles[i];
        console.log(fl);
        const path = `project/storeFile${new Date().getTime()}_${fl.name}`;

        let xx = await this.fileservice.upload_in_storage(path, this.viewFiles[i], this.userId, 'project');
        x.push(xx);
      }
      console.log('uploaded file');
      for (var i = 0; i < this.viewFiles.length; i++) {
        savephotos.push(x[i]['id'])
      }
      console.log('savephotos');
      console.log(savephotos);
      console.log(x);
      this.editProjectForm.value['photoURL'] = savephotos;
      console.log(this.editProjectForm.value);
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
  choosedelete() {
    console.log($('#choosedelete').hasClass("btn-danger"))
    if ($('#choosedelete').hasClass("btn-danger")) {
      document.getElementById('choosedelete').classList.add('btn-outline-danger');
      document.getElementById('choosedelete').classList.remove('btn-danger');
      $('#choosedelete').html("Cancel the deletion");
      $('.forlabel').wrap("<label></label>");
      $(".checkboxdelete").addClass("showbox");
    } else {
      document.getElementById('choosedelete').classList.add('btn-danger');
      document.getElementById('choosedelete').classList.remove('btn-outline-danger');
      $('#choosedelete').html("Choose photo(s) to delete")
      //$('forlabel').wrap( "<label></label>" );
      $('.photoURL').removeClass('blurtodelete');
      $(".checkboxdelete").removeClass("showbox");
      $('.forlabel').unwrap();
    }
  }
  addphotoview() {
    document.getElementById('inputfileview').click();
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
  removephoto(index) {
    console.log(index);
    //delete this.arrayphoto[index];
    this.arrayphoto.splice(index, 1);
    console.log(this.arrayphoto)
  }

  trackByFn(i: number) {
    return i
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

  }

  archiveProject() {
    this.firebaseService.archiveOne(this.data.id, 'project');
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

