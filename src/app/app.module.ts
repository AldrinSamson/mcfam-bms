// Modules 3rd party
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { HttpClientModule } from '@angular/common/http';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { AngularFireStorage } from 'angularfire2/storage';


// Modules
import { AuthModule } from './pages/auth/auth.module';
import { ProfileModule } from './pages/profile/profile.module';
import { MiscModule } from './components/misc/misc.module';
import { PipesModule } from '@shared/pipes/pipes.module';

// Shared
import { FooterComponent, HeaderComponent, UserService, AlertService, AuthGuardService, AuthService, WindowService } from '@shared';

// Main
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { firebaseKeys } from './firebase.config';

// Pages
import { AboutMeComponent } from './pages/about-me/about-me.component';
import { ContactComponent } from './pages/contact/contact.component';
import { PageNotFoundComponent } from './pages/not-found/not-found.component';

// Components
import { EmailMeComponent } from './components/email-me/email-me.component';
import { BrokerComponent, AddBrokerDialogComponent, ViewBrokerDialogComponent } from './pages/broker/broker.component';
import { ProjectComponent, AddProjectDialogComponent, ViewProjectDialogComponent, SaleProjectDialogComponent } from './pages/project/project.component';
import { InquiriesComponent , ViewInquiryDialogComponent } from './pages/inquiries/inquiries.component';
import { SaleTransactionComponent } from './pages/sale-transaction/sale-transaction.component';
import { ClientComponent, AddClientDialogComponent, ViewClientDialogComponent } from './pages/client/client.component';
import { SaleReportComponent } from './pages/sale-report/sale-report.component';
import { ProjectArchiveComponent , ViewProjectArchiveDialogComponent } from './pages/project-archive/project-archive.component';
import { AuditComponent } from './pages/audit/audit.component';


@NgModule({
  entryComponents: [
    AddBrokerDialogComponent,
    ViewBrokerDialogComponent,
    AddProjectDialogComponent,
    ViewProjectDialogComponent,
    ViewInquiryDialogComponent,
    ViewProjectArchiveDialogComponent,
    AddClientDialogComponent, 
    ViewClientDialogComponent,
    SaleProjectDialogComponent
  ],
  declarations: [
    AppComponent,
    AboutMeComponent,
    ContactComponent,
    HeaderComponent,
    FooterComponent,
    PageNotFoundComponent,
    EmailMeComponent,
    BrokerComponent,
    ProjectComponent,
    InquiriesComponent,
    ClientComponent,
    SaleReportComponent,
    ProjectArchiveComponent,
    AuditComponent,
    SaleTransactionComponent,
    AddBrokerDialogComponent,
    ViewBrokerDialogComponent,
    AddProjectDialogComponent,
    ViewProjectDialogComponent,
    ViewInquiryDialogComponent,
    ViewProjectArchiveDialogComponent,
    AddClientDialogComponent, 
    ViewClientDialogComponent,
    SaleProjectDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    AppRoutingModule,
    PipesModule,
    AuthModule,
    ProfileModule,
    MiscModule,
    NgxAuthFirebaseUIModule.forRoot(firebaseKeys),

  ],
  providers: [
    UserService,
    AlertService,
    AuthGuardService,
    AuthService,
    WindowService,
    AngularFireStorage
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
