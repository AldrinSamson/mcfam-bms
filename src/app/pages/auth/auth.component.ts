import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@shared';
import { FirebaseService } from '../../shared';
import * as firebase from 'firebase';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
email='';
passw='';
  public user;

  constructor(private authService: AuthService,
    private router: Router,
    public fbs: FirebaseService) {}

  public onSuccess(): void {
    this.fbs.getOne(firebase.auth().currentUser.uid).subscribe( result => {
      this.user = result;
      sessionStorage.setItem('currentUserDetails' , JSON.stringify(this.user));
    });
    this.router.navigate(['/project']);

    return this.authService.onSuccess();
  
  }
  login(){
    this.authService.login(this.email,this.passw);
  }

  

}
