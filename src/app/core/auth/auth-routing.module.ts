import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layoutPage/layoutPage.component';
import { LoginPageComponent } from './pages/loginPage/loginPage.component';
import { RegisterPageComponent } from './pages/registerPage/registerPage.component';

const routes: Routes =[
  {
    path: '' ,
    component: LayoutPageComponent,
    children: [
      {path: 'login', component: LoginPageComponent},
      {path: 'new-account', component: RegisterPageComponent},
      {path: '**', redirectTo: 'login' },
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild( routes )
  ],
  exports: [RouterModule],
  declarations: [],
  providers: [],
})
export class AuthRoutingModule { }
