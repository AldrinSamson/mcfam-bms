import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

@Injectable()
export class AuthService {
  public token: string;

  constructor(public afAuth: AngularFireAuth,
    private router: Router,
    private auth: AngularFireAuth) { }

  public onSuccess(): void {
    sessionStorage.setItem('session-alive', 'true');
    sessionStorage.setItem('currentUid' , firebase.auth().currentUser.uid);
    this.token = 'some-temporary-token';
    this.router.navigate(['/project']);
    console.log('AUTH: ', this.auth);
  }

  async login(email: string, password: string) {
    //console.log(" user auth "+this.isAuthenticated());
    try {

      var result = await this.afAuth.auth.signInWithEmailAndPassword(email, password);
      const user = JSON.parse(localStorage.getItem('user'));
      console.log(user);
      sessionStorage.setItem('session-alive', 'true');

      this.router.navigate(['/project']);
      //mcfamrealty.is@gmail.com
      var user2 = firebase.auth().currentUser;
      sessionStorage.setItem('session-user-logged', user2.uid);
      
      if (user) {
        // User is signed in.
        console.log(user2);
      } else {
        // No user is signed in.
      }
    } catch (err) {
      console.log(err);
      alert(err.message);
    }
  }

  public logout(): void {
    sessionStorage.removeItem('session-alive');
    sessionStorage.removeItem('currentUid');
    sessionStorage.removeItem('currentDetails');
    this.token = null;
    this.router.navigate(['/']);
  }

  public getIdToken(): string {
    firebase.auth().currentUser.getIdToken()
      .then(
        (token: string) => this.token = token
      );
    return this.token;
  }

  public isAuthenticated(): string {
    return sessionStorage.getItem('session-alive');
  }
}
