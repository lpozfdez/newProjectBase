import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanMatch, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({providedIn: 'root'})
export class PublicGuard implements CanMatch, CanActivate {

  constructor( private servAuth: AuthService, private router: Router ) { }

  private checkPublicStatus(): boolean | Observable< boolean>
  {
    return this.servAuth.checkAuthenticator().pipe(
      tap( isAuthenticated => {
        if( isAuthenticated ) {
          this.router.navigate(['/']);
        }
      }),
      tap( () => console.log('ya estás autenticado') ),
      map( isAuthenticated => !isAuthenticated )
    );
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean |  Observable<boolean> {

    return this.checkPublicStatus();
  }

  canMatch(route: Route, segments: UrlSegment[]):  boolean |  Observable<boolean>{


    return this.checkPublicStatus();
  }


}
