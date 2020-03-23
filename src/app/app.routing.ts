// Modules 3rd party
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// 404 page
import { PageNotFoundComponent } from './pages/not-found/not-found.component';

// Pages
import { AboutMeComponent } from './pages/about-me/about-me.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AuthComponent } from './pages/auth/auth.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfileSettingsComponent } from './pages/profile/profile-settings.component';
import { ProjectComponent } from './pages/project/project.component';
import { BrokerComponent } from './pages/broker/broker.component';
import { InquiriesComponent } from './pages/inquiries/inquiries.component';
import { SaleTransactionComponent } from './pages/sale-transaction/sale-transaction.component';
import { ClientComponent } from './pages/client/client.component';
import { SaleReportComponent } from './pages/sale-report/sale-report.component';
import { ProjectArchiveComponent } from './pages/project-archive/project-archive.component';
import { AuditComponent } from './pages/audit/audit.component';

import { AddProjectComponent } from './pages/project/add-project/add-project.component';
import { ViewProjectComponent } from './pages/project/view-project/view-project.component';


// Components
import { MiscComponent } from './components/misc/misc.component';

// Protected
import { AuthGuardService , } from '@shared';

// Routing
const appRoutes: Routes = [

  // Public pages
  { path: '', redirectTo: '/auth', pathMatch : 'full' },
  { path: 'about', component: AboutMeComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'misc', component: MiscComponent },
  { path: 'auth', component: AuthComponent },


  // Protected pages
  // { path: 'profile/:uid/:name', component: ProfileComponent, canActivate: [AuthGuardService] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService] },
  { path: 'profile-settings', component: ProfileSettingsComponent, canActivate: [AuthGuardService] },
  { path: 'project' , component: ProjectComponent, canActivate: [AuthGuardService] },
  { path: 'project/add' , component: AddProjectComponent, canActivate: [AuthGuardService] },
  { path: 'project/:id' , component: ViewProjectComponent, canActivate: [AuthGuardService] },
  { path: 'broker' , component: BrokerComponent, canActivate: [AuthGuardService]},
  { path: 'inquiries' , component: InquiriesComponent, canActivate: [AuthGuardService]},
  { path: 'client' , component: ClientComponent, canActivate: [AuthGuardService]},
  { path: 'saleTransaction' , component: SaleTransactionComponent, canActivate: [AuthGuardService]},
  { path: 'saleReport' , component: SaleReportComponent, canActivate: [AuthGuardService]},
  { path: 'projectArchive' , component: ProjectArchiveComponent, canActivate: [AuthGuardService]},
  { path: 'audit' , component: AuditComponent, canActivate: [AuthGuardService]},
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule {
}
