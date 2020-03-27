import { Component, OnInit, Inject, OnDestroy, ElementRef } from '@angular/core';
import { FirebaseService, FileService, ProjectService, AuthService, BrokerService } from '../../../shared';
import { MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, UrlTree, PRIMARY_OUTLET } from '@angular/router';
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
export class ViewProjectComponent implements OnInit, OnDestroy {

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
  selectedClientUid: any;
  selectedClient: any;
  selectedAgentUid: any;
  selectedAgent: any;
  viewphotos = [];
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
    this.editProjectForm = this.fb.group({
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
    })

  }

  ngOnInit() {
    this.getProject();

  }

  getProject() {
    this.tree = this.router.parseUrl(this.router.url);
    this.projectID = this.tree.root.children[PRIMARY_OUTLET].segments[1].path;
    this.projectSub = this.firebaseService.getOne(this.projectID, 'project').subscribe(async result => {
      this.project = result;
      console.log(this.project);
      for (var i = 0; i < result['photoURL'].length; i++) {
        if (result['photoURL'][i]['photoURL']) {
          console.log(result['photoURL'][i]['photoURL'])
          this.viewphotos.push(result['photoURL'][i])
        } else {
          try {
            var x = await this.fileservice.getFile(result['photoURL'][i]);
            console.log(x);
            this.viewphotos.push({id: x['id'], photoURL: x['photoURL']})
          } catch (err) {
            
          }
        }
        this.editProjectForm.value['name']=result['name'];
        this.editProjectForm.value['overview']=result['overview'];
        this.editProjectForm.value['saleType']=result['saleType'];
        this.editProjectForm.value['propertyType']=result['propertyType'];
        this.editProjectForm.value['ownerClientUid']=result['ownerClientUid'];
        this.editProjectForm.value['ownerClientName']=result['ownerClientName'];
        this.editProjectForm.value['addressStreet']=result['addressStreet'];
        this.editProjectForm.value['addressTown']=result['addressTown'];
        this.editProjectForm.value['addressCity']=result['addressCity'];
        this.editProjectForm.value['addressRegion']=result['addressRegion'];
        this.editProjectForm.value['cost']=result['cost'];
        this.editProjectForm.value['status']=result['status'];
        this.editProjectForm.value['agentUid']=result['agentUid'];
        this.editProjectForm.value['agentName']=result['agentName'];
        this.editProjectForm.value['photoURL']='w';
        this.editProjectForm.value['isArchived']=result['isArchived'];

      }
      console.log(this.viewphotos);
    });

    // this.editProjectForm = this.fb.group({
    //   name: [this.project.name],
    //   overview: [this.project.overview],
    //   saleType: [this.project.saleType],
    //   propertyType: [this.project.propertyType],
    //   ownerClientName: [this.project.ownerClientName],
    //   ownerClientUid: [this.project.ownerClientUid],
    //   addressStreet: [this.project.addressStreet],
    //   addressTown: [this.project.addressTown],
    //   addressCity: [this.project.addressCity],
    //   addressRegion: [this.project.addressRegion],
    //   cost: [this.project.cost],
    //   status: [this.project.status],
    //   photoURL: [this.project.photoURL],
    //   agentName: [this.project.agentName],
    //   agentUid: [this.project.agentUid]
    //   });

    return true
  }
  pickClient() {
    this.dialog.open(ViewProjectClientDialogComponent2).afterClosed().subscribe(result => {
      this.selectedClientUid = result[0];
      this.project['ownerClientName'] = result[1];
    });
  }
  selectdelete(event){
    console.log(event.target.value);
    if(event.target.value ==0){
      event.target.value = 1
      document.getElementById('delbutton').classList.remove('btn-danger');
      $('#delbutton').addClass('btn-outline-danger');
      $('#delbutton').text('Cancel deletion');
      $('.spotchkbox').addClass('imgchkbox');
      $( ".outlabel" ).wrap( "<label></label>" );

    }else{
      event.target.value = 0
      document.getElementById('delbutton').classList.add('btn-danger');
      $('#delbutton').removeClass('btn-outline-danger');
      $('#delbutton').text('Delete some photo(s)');
      $('.spotchkbox').removeClass('imgchkbox');
      $( ".outlabel" ).unwrap(  );

    }
  }
  select_del_photo(photoindex){
    console.log($('#box_'+photoindex).is(':checked'))
    if($('#box_'+photoindex).is(':checked')){
      $('#photo_'+photoindex).addClass('blurtodelete');
      
    }else{
      $('#photo_'+photoindex).removeClass('blurtodelete');
    }


  }

  pickAgent() {
    console.log(this.editProjectForm);
    this.dialog.open(ViewProjectAgentDialogComponent2).afterClosed().subscribe(result => {
      this.selectedAgentUid = result[0];
      this.project['agentName'] = result[1];
      console.log(this.editProjectForm);
      //console.log(result);
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
      if($('#delbutton').val()==1 ){
        $.each($("input[name='todelete']:checked"), function () {
          var x = $(this).val().toString().split('|');
          console.log(x);
          deletephotos.push(x);
        });
      }

      
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

  ngOnDestroy() {
    if (this.projectSub != null) {
      this.projectSub.unsubscribe();
    }
  }

}
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'view-client-dialog',
  templateUrl: '../dialog/view-client-dialog.html',
  styleUrls: ['../project.component.scss'],
})

export class ViewProjectClientDialogComponent2 implements OnInit, OnDestroy {

  clientSub: Subscription;
  clients: MatTableDataSource<any>;
  selectedClientUid = '';
  selectedClient = '';
  selected = [];
  displayedColumnsClient: string[] = ['fullName', 'userName', 'email'];

  constructor(
    public firebaseService: FirebaseService,
    public dialogRef: MatDialogRef<ViewProjectClientDialogComponent2>,

    public brokerService: BrokerService,

  ) { }

  ngOnInit() {
    this.getClient();
  }

  getClient() {
    this.clientSub = this.firebaseService.getAllData('client').subscribe(result => {
      this.clients = new MatTableDataSource(result);
    });
  }

  selectClient(value) {
    this.selectedClientUid = value.uid;
    this.selectedClient = value.fullName;
  }

  onNoClick(): void {

    this.selected.push(this.selectedClientUid);
    this.selected.push(this.selectedClient);

    this.dialogRef.disableClose = true;//disable default close operation
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

export class ViewProjectAgentDialogComponent2 implements OnInit, OnDestroy {

  agentSub: Subscription;
  agents: MatTableDataSource<any>;
  selectedAgenttUid = '';
  selectedAgent = '';
  selected = [];
  displayedColumnsAgent: string[] = ['fullName', 'userName', 'email'];

  constructor(
    public firebaseService: FirebaseService,
    public dialogRef: MatDialogRef<ViewProjectAgentDialogComponent2>,

    public brokerService: BrokerService,

  ) { }

  ngOnInit() {
    this.getAgent();
  }

  getAgent() {
    this.agentSub = this.brokerService.getWithPosition('Agent').subscribe(result => {
      this.agents = new MatTableDataSource(result);
    });
  }

  selectAgent(value) {
    this.selectedAgenttUid = value.uid;
    this.selectedAgent = value.fullName;
  }

  onNoClick(): void {

    this.selected.push(this.selectedAgenttUid);
    this.selected.push(this.selectedAgent);

    this.dialogRef.disableClose = true;//disable default close operation
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