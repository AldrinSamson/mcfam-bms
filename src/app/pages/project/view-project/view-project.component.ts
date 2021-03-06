import { Component, OnInit, Inject, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FirebaseService, FileService, ProjectService, AuthService, BrokerService , MailerService } from '../../../shared';
import { MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, UrlTree, PRIMARY_OUTLET } from '@angular/router';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { Subscription, Observable } from 'rxjs';

import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
// import { SaleProjectDialogComponent } from '../project.component';

@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.scss']
})
export class ViewProjectComponent implements OnInit, OnDestroy {
  // Project Data
  projectID;
  projectSub: Subscription;
  project;
  userId = '';
  viewphotos = [];
  cover_photo_file: any;
  cover_photo: any;
  cov_photo_change = false;
  card_photo_file: any;
  card_photo: any;
  card_photo_change = false;
  viewFiles = [];
  arrayphoto = [];
  editProjectForm: any;
  // Auth Data
  tree: UrlTree;
  userDetails: any;
  isManager = false;
  currentUid;
  // Selector Data
  selectedClientUid: any;
  selectedClient: any;
  selectedAgentUid: any;
  selectedAgent: any;



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
      id: [''],
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
      addressLatitude: [''],
      addressLongtitude: [''],
      amenities: [''],
      cost: [''],
      status: [''],
      agentUid: [''],
      agentName: [''],
      photoURL: [''],
      cover_photo: [''],
      card_photo: [''],
      isArchived: [''],
      isFeatured: [''],
      dateAdded: ['']

    });

  }

  ngOnInit() {
    this.currentUid = sessionStorage.getItem('session-user-uid');
    this.getProject();
  }

  getProject() {
    this.tree = this.router.parseUrl(this.router.url);
    this.projectID = this.tree.root.children[PRIMARY_OUTLET].segments[1].path;
    this.projectSub = this.projectService.getProject(this.projectID).subscribe(async result => {
      this.project = result.payload.data();
      this.project.id = result.payload.id;
      console.log(this.project);
      const photoid = [];
      for (let i = 0; i < this.project['photoURL'].length; i++) {
        console.log( this.project['photoURL'][i]);
        if (this.project['photoURL'][i]['photoURL']) {
          console.log(this.project['photoURL'][i]['photoURL']);
          this.viewphotos.push(this.project['photoURL'][i]);
          photoid.push(this.project['photoURL'][i]['id']);
        } else {
          try {
            const x = await this.fileservice.getFile(this.project['photoURL'][i]);
            console.log(x);
            this.viewphotos.push({ id: x['id'], photoURL: x['photoURL'] });
            photoid.push(x['id']);
          } catch (err) {

          }
        }
      }
      console.log(this.viewphotos);
      if (this.project['cover_photo']) {
        this.cover_photo_file = this.project['cover_photo'];
        this.cover_photo = this.project['cover_photo']['photoURL'];
      }
      if (this.project['card_photo']) {
        this.card_photo_file = this.project['card_photo'];
        this.card_photo = this.project['card_photo']['photoURL'];
      }
      this.editProjectForm = this.fb.group({
        name: this.project['name'],
        overview: this.project['overview'],
        saleType: this.project['saleType'],
        propertyType: this.project['propertyType'],
        'ownerClientUid': this.project['ownerClientUid'],
        'ownerClientName': this.project['ownerClientName'],
        addressStreet: this.project['addressStreet'],
        addressTown: this.project['addressTown'],
        addressCity: this.project['addressCity'],
        addressRegion: this.project['addressRegion'],
        addressLatitude: this.project['addressLatitude'],
        addressLongtitude: this.project['addressLongtitude'],
        'amenities': this.fb.array(this.project['amenities']),
        cost: this.project['cost'],
        status: this.project['status'],
        'agentUid': this.project['agentUid'],
        'agentName': this.project['agentName'],
        photoURL: [this.viewphotos],
        cover_photo : this.project['cover_photo'],
        card_photo : this.project['card_photo'],
        isArchived: this.project['isArchived'],
        isFeatured: this.project['isFeatured'],
        dateAdded: this.project['dateAdded'],
      });
    this.selectedClientUid = this.project['ownerClientUid'];
    this.selectedClient = this.project['ownerClientName'];
    this.selectedAgentUid = this.project['agentUid'];
    this.selectedAgent = this.project['agentName'];
    });
  }

  get amenities() {
    return this.editProjectForm.get('amenities') as FormArray;
  }

  addAmenities() {
    this.amenities.push(new FormControl(''));
  }

  deleteAmenities(index) {
    this.amenities.removeAt(index);
  }

  pickClient() {
    this.dialog.open(ViewProjectClientDialogComponent2).afterClosed().subscribe(result => {
      this.selectedClientUid = result[0];
      this.selectedClient = result[1];
    });
  }

  pickAgent() {
    this.dialog.open(ViewProjectAgentDialogComponent2).afterClosed().subscribe(result => {
      this.selectedAgentUid = result[0];
      this.selectedAgent = result[1];
    });
  }

  selectdelete(event) {
    console.log($('#delbutton').val());
    if ($('#delbutton').val() === '0') {
      //event.target.value = 1;
      
      $('#delbutton').val('1')//;('value', 1);

      //console.log($('#delbutton').val());
      //document.getElementById('delbutton').classList.remove('');
      $('#delbutton').addClass('btn-outline-danger');
      $('#delbutton').removeClass('btn-danger');
      $('#delbutton').text('Cancel deletion');
      $('.spotchkbox').addClass('imgchkbox');
      $('.outlabel').wrap('<label></label>');

    } else {
      $('#delbutton').val(0);
      //document.getElementById('delbutton').classList.add('btn-danger');
      $('#delbutton').removeClass('btn-outline-danger');
      $('#delbutton').addClass('btn-danger');
      $('#delbutton').text('Delete some photo(s)');
      $('.spotchkbox').removeClass('imgchkbox');
      $('.outlabel').unwrap();

      $('.photoURL').removeClass('blurtodelete');
    }
  }
  select_del_photo(photoindex) {
    console.log($('#box_' + photoindex).is(':checked'));
    if ($('#box_' + photoindex).is(':checked')) {
      $('#photo_' + photoindex).addClass('blurtodelete');

    } else {
      $('#photo_' + photoindex).removeClass('blurtodelete');
    }


  }

  async submitEditProjectForm() {
    console.log(this.editProjectForm);
    if (this.editProjectForm.valid) {
      console.log(this.editProjectForm.value['photoURL']);
      // delete existing
      const savephotos0 = [];
      const savephotos = [];
      const deletephotos = [];
      if ($('#delbutton').val() === 0) {
        $("input[name='todelete']:checkbox").prop('checked', false);
      }

      await $.each($("input[name='todelete']:not(:checked)"), async function () {
        const x = $(this).val().toString();
        console.log(x);

        // var phtURL = await thisclass.fileservice.getFile(x);
        // console.log(phtURL);
        // savephotos.push({ id: x, photoURL: phtURL['photoURL'] });
        savephotos0.push(x);
      });
      for(var i = 0; i < savephotos0.length ; i++) {
        var phtURL = await this.fileservice.getFile(savephotos0[i]);
        // console.log(phtURL);
        savephotos.push({ id: savephotos0[i], photoURL: phtURL['photoURL'] });
      }
      if ($('#delbutton').val() === 1) {
        $.each($("input[name='todelete']:checked"), function () {
          var x = $(this).val().toString();
          console.log(x);
          deletephotos.push(x);
        });
        for (var i = 0; i < deletephotos.length; i++) {
          // await this.fileservice.filedelete(deletephotos[i][0]);
          await this.fileservice.delete_in_storage(deletephotos[i]);
        }
      }


      console.log(deletephotos);
      console.log(savephotos);




      // console.log('this.viewFiles.length ' + this.viewFiles.length);
      if (this.viewFiles) {
        var x = [];
        for (var i = 0; i < this.viewFiles.length; i++) {
          var fl = this.viewFiles[i];
          console.log(fl);
          const path = `project/storeFile${new Date().getTime()}_${fl.name}`;

          let xx = await this.fileservice.upload_in_storage(path, this.viewFiles[i], this.userId, 'project');
          x.push(xx);
          console.log(xx);
          savephotos.push({ id: xx['id'], photoURL: xx['photoURL'] });
        }
        console.log('uploaded file');

      }

      console.log('savephotos');
      console.log(savephotos);
      console.log(x);

      this.editProjectForm.controls['photoURL'].setValue(savephotos);
      console.log(this.editProjectForm.value);
      console.log(this.cov_photo_change);
      if (this.cov_photo_change) {
        try {
        const path = `project/storeFile${new Date().getTime()}_${this.cover_photo_file.name}`;
        const fileprop = await this.fileservice.upload_in_storage(path, this.cover_photo_file, this.userId, 'project');
        this.editProjectForm.controls['cover_photo'].setValue({ id: fileprop['id'], photoURL: fileprop['photoURL']} );
        } catch (err) {

        }
      }

      if (this.card_photo_change) {
        try {
        const path = `project/storeFile${new Date().getTime()}_${this.card_photo_file.name}`;
        const fileprop2 = await this.fileservice.upload_in_storage(path, this.card_photo_file, this.userId, 'project');
        this.editProjectForm.controls['card_photo'].setValue({ id: fileprop2['id'], photoURL: fileprop2['photoURL']} );
        } catch (err) {

        }
      }
      console.log( this.editProjectForm);
      this.editProjectForm.controls['ownerClientUid'].setValue(this.selectedClientUid);
      this.editProjectForm.controls['agentUid'].setValue(this.selectedAgentUid);
      this.editProjectForm.controls['ownerClientName'].setValue(this.selectedClient);
      this.editProjectForm.controls['agentName'].setValue(this.selectedAgent);
      this.projectService.updateProject(this.projectID, this.editProjectForm.value);
      this.firebaseService.audit('Project' , 'Edited Project ' + this.editProjectForm.value.name);


      /**/
      this.router.navigate(['/project']);
    }
  }

  toRemove(event) {
    console.log(event);
    var getid = event.target.value.split("|")[0];
    if (event.target.checked) {
      // document.getElementById('photoID_' + getid).classList.remove('btn-primary');
      document.getElementById('photoID_' + getid).classList.add('blurtodelete');

    } else {
      document.getElementById('photoID_' + getid).classList.remove('blurtodelete');
      // document.getElementById('photoID_' + getid).classList.add('btn-success');
    }
  }

  choosedelete() {
    console.log($('#choosedelete').hasClass("btn-danger"));
    if ($('#choosedelete').hasClass("btn-danger")) {
      document.getElementById('choosedelete').classList.add('btn-outline-danger');
      document.getElementById('choosedelete').classList.remove('btn-danger');
      $('#choosedelete').html("Cancel the deletion");
      $('.forlabel').wrap("<label></label>");
      $(".checkboxdelete").addClass("showbox");
    } else {
      document.getElementById('choosedelete').classList.add('btn-danger');
      document.getElementById('choosedelete').classList.remove('btn-outline-danger');
      $('#choosedelete').html("Choose photo(s) to delete");
      // $('forlabel').wrap( "<label></label>" );
      $('.photoURL').removeClass('blurtodelete');
      $(".checkboxdelete").removeClass("showbox");
      $('.forlabel').unwrap();
    }
  }

  addphotoview() {
    document.getElementById('inputfileview').click();
  }

  addphotoview2() {
    document.getElementById('inputfileview2').click();
  }

  addcoverphotoview() {
    document.getElementById('inputcoverphotofileview').click();
  }

  addcardphotoview() {
    document.getElementById('inputcardphotofileview').click();
  }

  addcoverphoto(file) {
    try {
      console.log(file.target.files);

      if (file.target.files.length) {
        document.getElementById('addbutton').classList.remove('btn-primary');
        document.getElementById('addbutton').classList.add('btn-success');
      } else {
        document.getElementById('addbutton').classList.add('btn-primary');
        document.getElementById('addbutton').classList.remove('btn-success');
        this.cov_photo_change = false;
      }

      this.cover_photo_file = file.target.files[0];
      var reader = new FileReader();
      reader.onload = (event: any) => {
        // console.log(event.target.result);
        // this.arrayphoto.push(event.target.result);
        this.cover_photo = event.target.result;
        this.cov_photo_change = true;
      };
      reader.readAsDataURL(this.cover_photo_file);
    } catch (err) {

    }
  }

  addcardphoto(file) {
    try {
      console.log(file.target.files);

      if (file.target.files.length) {
        document.getElementById('addbutton2').classList.remove('btn-primary');
        document.getElementById('addbutton2').classList.add('btn-success');
      } else {
        document.getElementById('addbutton2').classList.add('btn-primary');
        document.getElementById('addbutton2').classList.remove('btn-success');
      }

      this.card_photo_file = file.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        // console.log(event.target.result);
        // this.arrayphoto.push(event.target.result);
        this.card_photo = event.target.result;
        this.card_photo_change = true;
      };
      reader.readAsDataURL(this.card_photo_file);
    } catch (err) {
      console.log(err);
    }
  }

  addphotos(files) {
    // this.arrayphoto=[];

    // this.viewFiles = files;
    for (var i = 0; i < files.length; i++) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        // console.log(event.target.result);
        this.arrayphoto.push(event.target.result);
      };
      this.viewFiles.push(files[i]);
      reader.readAsDataURL(files[i]);
    }
    console.log(this.arrayphoto);

    console.log(this.viewFiles);


  }

  removephoto(index) {
    console.log(index);
    // delete this.arrayphoto[index];
    // console.log(this.arrayphoto)
    // console.log(this.viewFiles)
    var getthefiles = [];
    for (var i = 0; i < this.viewFiles.length; i++) {
      console.log(index, i);
      if (index !== i) {
        getthefiles.push(this.viewFiles[i]);
      }

    }

    this.arrayphoto.splice(index, 1);
    this.viewFiles = getthefiles;
    console.log(this.arrayphoto);
    console.log(this.viewFiles);
  }

  trackByFn(i: number) {
    return i;
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
    dialogConfig.maxWidth = 1250;
    dialogConfig.minWidth = 1250;
    this.dialog.open(SaleProjectDialogComponent, dialogConfig).afterClosed().subscribe(result => {
      this.router.navigate(['/project']);
    });

  }

  archiveProject() {
    this.firebaseService.archiveOne(this.project.id, 'project');
    this.firebaseService.audit('Project' , 'Archived Project ' + this.project.name);
    this.router.navigate(['/project']);
  }

  goBack() {
    this.router.navigate(['/project']);
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

// tslint:disable-next-line:component-class-suffix
export class ViewProjectClientDialogComponent2 implements OnInit, OnDestroy {

  clientSub: Subscription;
  clients: MatTableDataSource<any>;
  selectedClientUid = '';
  selectedClient = '';
  selected = [];
  displayedColumnsClient: string[] = ['fullName', 'addressCity', 'addressRegion'];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

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
      this.clients.paginator = this.paginator;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.clients.filter = filterValue.trim().toLowerCase();
  }

  selectClient(value) {
    this.selectedClientUid = value.uid;
    this.selectedClient = value.fullName;
  }

  onNoClick(): void {

    this.selected.push(this.selectedClientUid);
    this.selected.push(this.selectedClient);

    this.dialogRef.disableClose = true; // disable default close operation
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

// tslint:disable-next-line:component-class-suffix
export class ViewProjectAgentDialogComponent2 implements OnInit, OnDestroy {

  agentSub: Subscription;
  agents: MatTableDataSource<any>;
  selectedAgenttUid = '';
  selectedAgent = '';
  selected = [];
  displayedColumnsAgent: string[] = ['fullName', 'addressCity', 'addressRegion'];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

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
      this.agents.paginator = this.paginator;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.agents.filter = filterValue.trim().toLowerCase();
  }

  selectAgent(value) {
    this.selectedAgenttUid = value.uid;
    this.selectedAgent = value.fullName;
  }

  onNoClick(): void {

    this.selected.push(this.selectedAgenttUid);
    this.selected.push(this.selectedAgent);

    this.dialogRef.disableClose = true; // disable default close operation
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

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'sale-project-dialog',
  templateUrl: '../dialog/sale-project-dialog.html',
  styleUrls: ['../project.component.scss'],
})

export class SaleProjectDialogComponent implements OnInit, OnDestroy {

  public dateNow = Date.toString();

  saleProjectForm: any;
  @ViewChild('paginator', {static: true}) paginator: MatPaginator;
  @ViewChild('paginator2', {static: true}) paginator2: MatPaginator;
  // @ViewChild(MatSort, {static: true}) sort: MatSort;

  clientSub: Subscription;
  clients: MatTableDataSource<any>;
  selectedClientUid = '';
  selectedClient = '';
  displayedColumnsClient: string[] = ['fullName', 'addressCity', 'addressRegion'];

  managerSub: Subscription;
  managers: MatTableDataSource<any>;
  selectedManagerUid = '';
  selectedManager = '';
  displayedColumnsManager: string[] = ['fullName', 'addressCity', 'addressRegion'];

  constructor(
    public firebaseService: FirebaseService,
    public projectService: ProjectService,
    public brokerService: BrokerService,
    public fileservice: FileService,
    public dialogRef: MatDialogRef<SaleProjectDialogComponent>,
    public fb: FormBuilder,
    public mailerService: MailerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.saleProjectForm = this.fb.group({
      projectID: [this.data.projectUid],
      projectName: [this.data.projectName],
      projectCost: [this.data.projectCost],
      projectSaleType: [this.data.projectSaleType],
      agentName: [this.data.agentName],
      agentUid: [this.data.agentUid],
      'clientName': [''],
      'clientUid': [''],
      'managerName': [''],
      'managerUid': [''],
      dateStart: [new Date()],
      doc_BIS: [''],
      doc_RF: [''],
      doc_RA: [''],
      doc_VG1: [''],
      doc_VG2: [''],
      doc_POI: [''],
      doc_POB: [''],
      doc_PSS: [''],
      doc_others: [''],
      doc_status: ['No Documents Uploaded'],
      status: ['Awaiting Customer Document'],
      stage: [2],
      isCompleted: [false],
      isApproved: [false],
      isDisapproved: [false],
	  isCancelled: [false],
	  isLeased: [false]
    });
  }

  ngOnInit() {
    this.getClientAndManager();
  }

  getClientAndManager() {
    this.clientSub = this.firebaseService.getAllData('client').subscribe(result => {
      this.clients = new MatTableDataSource(result);
      this.clients.paginator = this.paginator;
      // this.clients.sort = this.sort;
    });

    this.managerSub = this.brokerService.getWithPosition('Manager').subscribe(result => {
      this.managers = new MatTableDataSource(result);
      this.managers.paginator = this.paginator2;
      // this.managers.sort = this.sort;
    });
  }

  applyFilterClient(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.clients.filter = filterValue.trim().toLowerCase();
  }

  applyFilterManager(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.managers.filter = filterValue.trim().toLowerCase();
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
	  // this.mailerService.mailTransactionMessage()  stage 1 client
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