import { Routes } from "@angular/router"
import { ListsComponent } from "./lists.component"
import { authGuard } from "../auth/auth.guard"

export const listsRoutes: Routes = [
    {
        path: '',
        component: ListsComponent,
        canActivate: [authGuard],
        children: [
          { path: ':filterID',
            loadComponent: () => import('./lists.component').then(m => m.ListsComponent)
          }
        ]
    },
]