import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LayoutPageComponent } from './pages/layoutPage/layoutPage.component';
import { LoginPageComponent } from './pages/loginPage/loginPage.component';
import { RegisterPageComponent } from './pages/registerPage/registerPage.component';
import { Error404Component } from './pages/error404/error404.component';
import { MaterialModule } from 'src/app/shared/material/material.module';



@NgModule({
  declarations: [
    LayoutPageComponent,
    LoginPageComponent,
    RegisterPageComponent,
    Error404Component,

  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    MaterialModule
  ]
})
export class AuthModule { }
