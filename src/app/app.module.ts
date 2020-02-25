// Modules 3rd party
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { HttpClientModule } from '@angular/common/http';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';

// Modules
import { AuthModule } from './pages/auth/auth.module';
import { ProfileModule } from './pages/profile/profile.module';
import { MiscModule } from './components/misc/misc.module';
import { PipesModule } from '@shared/pipes/pipes.module';

// Shared
import {
  FooterComponent,
  HeaderComponent,
  UserService,
  AlertService,
  AuthGuardService,
  AuthService,
  WindowService
} from '@shared';

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
import { BrokerComponent , AddBrokerDialogComponent , ViewBrokerDialogComponent } from './pages/broker/broker.component';
import { ProjectComponent } from './pages/project/project.component';

@NgModule({
  entryComponents: [
    AddBrokerDialogComponent,
    ViewBrokerDialogComponent
    
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
    AddBrokerDialogComponent,
    ViewBrokerDialogComponent
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
    NgxAuthFirebaseUIModule.forRoot(firebaseKeys)
  ],
  providers: [
    UserService,
    AlertService,
    AuthGuardService,
    AuthService,
    WindowService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
