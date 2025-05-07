import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { Admin } from '../models/Admin/admin';
import { map } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getAdmin()
    .pipe(map(
      (admin: Admin|undefined) => {
        if(admin) {
          return true;
        } else {
          router.navigate(['/home']);
          return false;
        }
      }
    ))
};
