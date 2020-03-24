import { Component } from '@angular/core';
import * as firebase from 'firebase';

import { AuthService, AlertService } from '../../services';

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public isAuthenticated: string;
  public isManager: Boolean;
  public angularImage: string = '/assets/img/temp-icon.jpg';
  public test = '';
  public userDetails : any;

  constructor(
    public authService: AuthService,
    private alertService: AlertService,
    ) {
      this.isAuthenticated = this.authService.isAuthenticated();
      this.isManager = this.authService.isManager();
      if (this.isAuthenticated) {
        //this.userDetails = JSON.parse(sessionStorage.getItem('session-user-details'));
      }
  }

  public userUid(): string {
    return firebase.auth().currentUser.uid;
  }

  public userEmail(): string {
    return firebase.auth().currentUser.email;
  }

  public userName(): string {
    return firebase.auth().currentUser.displayName;
  }

  public onLogout(): void {
    this.alertService.showToaster('Logout succesful');
    return this.authService.logout();
  }
}
