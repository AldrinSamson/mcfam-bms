import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { AlertService } from './alert.service';

@Injectable()
export class AuthService {
  public token: any;
  userDetails : Array<any>;
  userUid: any;
  userPosition: any;
 

  constructor(public afAuth: AngularFireAuth,
    private router: Router,
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private alert: AlertService) { }

  // public onSuccess(): void {
  //   sessionStorage.setItem('session-alive', 'true');
  //   sessionStorage.setItem('currentUid', firebase.auth().currentUser.uid);
  //   this.token = 'some-temporary-token';
  //   this.router.navigate(['/project']);
  //   console.log('AUTH: ', this.auth);
  // }

  async login(email: string, password: string) {
    //console.log(" user auth "+this.isAuthenticated());
    try {

      var result = await this.afAuth.auth.signInWithEmailAndPassword(email, password).then( res => {
        this.userUid = res.user.uid
        this.db.collection('broker', ref => ref.where('uid', '==', res.user.uid)).valueChanges().forEach( result => {
        this.userDetails = result
        sessionStorage.setItem('session-alive', 'true');
        sessionStorage.setItem('session-user-uid', this.userUid)
        sessionStorage.setItem('session-user-details', JSON.stringify(this.userDetails[0]));    
        this.router.navigate(['/project']);
      })
      });
    } catch (err) {
      console.log(err);
      this.alert.showToaster("Email or Password is wrong");
    }
  }

  public logout(): void {
    sessionStorage.removeItem('session-alive');
    sessionStorage.removeItem('session-user-uid');
    sessionStorage.removeItem('session-user-details');
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

  public isManager() {
    this.userPosition = JSON.parse(sessionStorage.getItem('session-user-details'))
    if(!this.isAuthenticated()){
      return false
    } else if (this.userPosition.position == "Manager") {
      return true
    }else {
      return false
    }
  }  
}
