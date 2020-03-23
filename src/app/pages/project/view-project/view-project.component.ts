import { Component, OnInit, Inject, OnDestroy, ElementRef } from '@angular/core';
import { FirebaseService,  FileService, ProjectService, AuthService } from '../../../shared';
import { MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, UrlTree,PRIMARY_OUTLET } from '@angular/router';
import { MatTableDataSource } from '@angular/material';
import { Subscription, Observable } from 'rxjs';

import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.scss']
})
export class ViewProjectComponent implements OnInit {

  tree: UrlTree;
  projectID;
  projectSub: Subscription;
  project

  editProjectForm: any;
  viewFiles: any;
  arrayphoto = [];
  userDetails: any;
  isManager = false;
  userId = '';

  constructor(
    private router: Router,
    public firebaseService: FirebaseService,
    public projectService: ProjectService,
    public fb: FormBuilder,
    public fileservice: FileService,
    public dialog: MatDialog,
    public authService: AuthService,
    ) {
      this.isManager = this.authService.isManager();
      
  }  

  ngOnInit() {
    this.getProject();
    this.editProjectForm = this.fb.group({
      name: [this.project.name],
      overview: [this.project.overview],
      saleType: [this.project.saleType],
      propertyType: [this.project.propertyType],
      ownerClientName: [this.project.ownerClientName],
      ownerClientUid: [this.project.ownerClientUid],
      addressStreet: [this.project.addressStreet],
      addressTown: [this.project.addressTown],
      addressCity: [this.project.addressCity],
      addressRegion: [this.project.addressRegion],
      cost: [this.project.cost],
      status: [this.project.status],
      photoURL: [this.project.photoURL],
      agentName: [this.project.agentName],
      agentUid: [this.project.agentUid]
    })
  }

  getProject() {
    this.tree = this.router.parseUrl(this.router.url);
    this.projectID = this.tree.root.children[PRIMARY_OUTLET].segments[1].path;
    this.projectSub = this.firebaseService.getOne(this.projectID , 'project').subscribe(result => {
      this.project =(result);
    });
    
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
      //this.projectService.updateProject(this.data.id, this.editProjectForm.value);

     
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
      projectUid: this.project.id,
      projectName: this.project.name,
      projectCost: this.project.cost,
      projectSaleType: this.project.saleType,
      agentName: this.project.agentName,
      agentUid: this.project.agentUid
    };
    dialogConfig.maxWidth = '50vw';
    dialogConfig.width = '50vw';
    // this.dialog.open(SaleProjectDialogComponent, dialogConfig).afterClosed().subscribe(result => {
    //   this.dialogRef.close();
    // });

  }

  archiveProject() {
    this.firebaseService.archiveOne(this.project.id, 'project');
    
  }

  onNoClick(): void {
    
  }

}
