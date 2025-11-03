import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environments } from 'src/environments/environments';
import { User } from '../interfaces/user.interface';
import { Observable, catchError, map, of, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthService {

  private bseUrl = environments.baseUrl;
  private user?: User ;

  constructor(private httpClient: HttpClient) { }

  get currentUser(): User | undefined {
    if(!this.user) return undefined;
    return structuredClone( this.user );
  }

  login( email: string, pass: string ): Observable<User>{
    return this.httpClient.get<User>(`${this.bseUrl}/users/1`).pipe(
      tap( user => this.user = user),
      tap( user => localStorage.setItem('token', 'esteEsMiToken' ))
    );
  }

  logout(){
    this.user = undefined;
    localStorage.clear();

  }

  checkAuthenticator(): Observable<boolean>{
    if(!localStorage.getItem('token')) return of(false);

    const token = localStorage.getItem('token');

    return this.httpClient.get<User>(`${this.bseUrl}/users/1`).pipe(
      tap( user => this.user = user),
      map( user => !!user),
      catchError( err => of(false))
    );

  }




}
