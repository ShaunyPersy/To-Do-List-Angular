import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  form!: FormGroup;
  validPasswordFormat: RegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  passStatus: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService,
  ){}

  ngOnInit(): void {
    this.form = this.fb.group({
      'email': ['', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [this.emailExists.bind(this)],
        updateOn: 'change',
      }],
      'password': ['', {
        validators: [Validators.required, this.validPasswords.bind(this)]
      }],
      'confirmPass': ['', {
          validators: [Validators.required, this.validConfirm.bind(this)]
      }]
    });
  }

  get email() {
    return this.form.controls['email'];
  }

  get password() {
    return this.form.controls['password'];
  }

  get confirmPass(){
    return this.form.controls['confirmPass'];
  }

  validPasswords(control: FormControl): {[s:string]: boolean} | null {
    if(!control.value) {
      return null;
    }

    if(!this.validPasswordFormat.test(control.value)) {
      return {'invalidFormat' : true};
    }
    return null;
  }

  validConfirm(control: FormControl): {[s:string]: boolean} | null {
    if(!control.value) {
      return null;
    }

    if (control.parent) {
      const password = control.parent.get('password')?.value;

      if (control.value !== password) {
        return {'passwordMismatch': true };
      }
    }  

    return null;
  }

  //fetchSignInMethodsForEmail depricated
  async emailExists(control: FormControl): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      setTimeout(async () => {
        try {
          const exists = await this.authService.isEmailUsed(control.value);
          if (exists) {
            resolve({ 'emailTaken': true });
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error('Error checking email existence:', error);
          resolve(null);
        }
      }, 1500);
    });
  }

  togglePass(status: boolean): void {
    this.passStatus = status;
  }

  onSubmit(): void {
    this.authService.signUp(this.form.controls['email'].value,this.form.controls['password'].value)
      .then((res) => {
        if(res == 'success'){
          this.router.navigate(['login']);
        } else {
          alert(res);
        }
      })
  }

  onLogin(): void {
    this.router.navigate(['login']);
  }
}
