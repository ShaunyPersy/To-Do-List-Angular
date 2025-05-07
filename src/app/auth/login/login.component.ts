import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form!: FormGroup;
  invalidLogin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ){}

  ngOnInit(): void {
    this.form = this.fb.group({
      'email': ['', {
        validators: [Validators.required, Validators.email]
      }],
      'password': ['', {
        validators: Validators.required
      }]
    });
  }

  get email() {
    return this.form.controls['email'];
  }

  get password() {
    return this.form.controls['password'];
  }

  onSubmit(): void {
    this.authService.login(this.form.controls['email'].value, this.form.controls['password'].value)
      .then((res) => {
        if(!res){
          this.invalidLogin = true;
        } else {
          this.invalidLogin = false;
          this.router.navigate(['home']);
        }
      })
  }

  onRegister(): void {
    this.router.navigate(['register']);
  }
}
