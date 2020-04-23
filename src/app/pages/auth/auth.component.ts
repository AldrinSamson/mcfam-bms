import { Component , Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@shared';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseService , UserService } from '../../shared';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
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
    public dialog: MatDialog,
    public fbs: FirebaseService,
    public db: AngularFirestore) {}

  login() {
    this.authService.login(this.email, this.passw).then(() => {
    });
  }

  openPasswordReset() {
    this.dialog.open(PasswordResetDialogComponent);
  }
}

@Component({
  // tslint:disable-next-line:component-selector
  selector : 'password-reset-dialog',
  templateUrl : './dialog/password-reset-dialog.html',
  styleUrls: ['./auth.component.scss'],
})

export class PasswordResetDialogComponent {

  email = '';

  constructor(
    public dialogRef: MatDialogRef<PasswordResetDialogComponent>,
    public userService: UserService,
    public fbs: FirebaseService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  sendResetEmail() {
    this.userService.sendUserPasswordResetEmailForgot(this.email);
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

