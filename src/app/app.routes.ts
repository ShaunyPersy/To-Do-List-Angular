import { Routes } from '@angular/router';
import { ListsComponent } from './lists/lists.component';
import { FiltersComponent } from './filters/filters.component';
import { LoginComponent } from './auth/login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';
import { deactivateGuard } from './auth/deactivate.guard';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
    {
        path: 'home',
        loadChildren: () => import('./lists/lists.routes').then(m => m.listsRoutes)
    },
    { path: 'filters', component: FiltersComponent, canActivate: [authGuard]},  
    { path: 'settings', component: SettingsComponent, canActivate: [authGuard, adminGuard], canDeactivate:[deactivateGuard]},  
    { path: 'login', component: LoginComponent},
    { path: 'register', component: RegisterComponent},
    { path: '**', pathMatch: 'full', component: PageNotFoundComponent}
];
