import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@shared';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {

  constructor(private authService: AuthService,
    private router: Router) {}

  public onSuccess(): void {
    this.router.navigate(['/project']);
    return this.authService.onSuccess();
  
  }

}
