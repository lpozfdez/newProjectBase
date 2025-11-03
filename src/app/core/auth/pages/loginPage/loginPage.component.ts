import { Component, type OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: "loginPage.component.html",
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class LoginPageComponent implements OnInit {

  constructor( private servAuth: AuthService, private router:Router ){}

  ngOnInit(): void { }

  onLogin(){
    this.servAuth.login( 'john.due@gmail.com', '123456' ).subscribe( user => {
      this.router.navigate(['/']);
    });
  }

}
