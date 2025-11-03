import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanMatch, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanMatch, CanActivate {

  constructor( private servAuth: AuthService, private router: Router ) { }

  private checkAuthStatus(): boolean | Observable< boolean>
  {
    return this.servAuth.checkAuthenticator().pipe(
      tap( isAuthenticated => {
        if( !isAuthenticated ) {
          this.router.navigate(['/auth/login']);
        }
      }),
      tap( () => console.log('autenticado') ),
    );
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean |  Observable<boolean> {

    return this.checkAuthStatus();
  }

  canMatch(route: Route, segments: UrlSegment[]):  boolean |  Observable<boolean>{


    return this.checkAuthStatus();
  }


}
