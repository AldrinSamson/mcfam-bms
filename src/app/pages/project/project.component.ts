import { Component, OnInit, Inject, OnDestroy, ElementRef } from '@angular/core';
import { FirebaseService, AuthService, FileService, ProjectService, Project, BrokerService , MailerService } from '../../shared';
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
    public mailerService: MailerService,
    public router: Router) {

    this.isManager = this.authService.isManager();

    try {
      this.fileslist = this.fileservice.getFiles();
      this.userId = firebase.auth().currentUser.uid;
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
    // this.router.navigate(['/project/add']);
    //this.mailerService.mailTransactionMessage('sioAzNVKOlXkahhjcsEiwg1SErs1' ,'manager' , 1 ,'Mangahas Oasis', ['arara' , 'boom'] );
    this.mailerService.sendEmail('joshuabono0903@gmail.com', 'Mangahas Oasis', 'Mangahas Oasis');
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
