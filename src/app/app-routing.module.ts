import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from './features/auth/pages/error404/error404.component';

const routes: Routes = [
  {
    path: 'auth' ,
    loadChildren: () => import('./features/auth/auth.module').then( m => m.AuthModule ),
    // canActivate: [ PublicGuard ],
    // canMatch: [ PublicGuard ]
  },
  {
    path: 'home' ,
    loadChildren: () => import('./features/home/home.module').then( m => m.HomeModule ),
  },
  // {
  //   path: 'heroes' ,
  //   loadChildren: () => import('./heroes/heroes.module').then( m => m.HeroesModule ),
  //   canActivate: [ AuthGuard ],
  //   canMatch: [ AuthGuard ]
  // },
  {
    path: '404' ,
    component: Error404Component
  },
  {
    path: '' ,
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '404',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
