import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@shared';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseService } from '../../shared';
import * as firebase from 'firebase';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  email = '';
  passw = '';

  constructor(private authService: AuthService,
    private router: Router,
    public fbs: FirebaseService,
    public db: AngularFirestore) {}

  // public onSuccess(): void {
  //   this.router.navigate(['/project']);
  //   return this.authService.onSuccess();
  // }


  login() {
    this.authService.login(this.email, this.passw).then(() => {
    });

  }



}
