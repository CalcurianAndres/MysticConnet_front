import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { promotoras } from '@interfaces/req-respons';
import { catchError, map, Observable, of, tap } from 'rxjs';

interface LoginForm {
  correo:string,
  password:string
}

interface loginResponse {
  ok:boolean,
  usuario:promotoras,
  token?:string
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private http = inject(HttpClient)
  private router = inject(Router)
  public ruta = 'http://localhost:4000/api'

  public usuario!:promotoras

  private isBrowser = typeof window !== 'undefined';

  get token():string{
    if (this.isBrowser) {
      return localStorage.getItem('TOKEN_SESSION') || '';
    }else{
      return ''
    }
  }

  get headers(){
    return {
      'Authorization':this.token
    }
  }

  get Correo_session():string{
    if(this.isBrowser){
      return localStorage.getItem('SESSION_EMAIL') || '';
    }else{
      return ''
    }
  }

  get Nombre_session():string{
    if(this.isBrowser){
      return localStorage.getItem('SESSION_USER_NAME') || '';
    }else{
      return ''
    }
  }


  constructor() { }

  Login(data:LoginForm, recuerdame:boolean){
    const url = `${this.ruta}/login`
    if(recuerdame && this.isBrowser){
      localStorage.setItem('SESSION_EMAIL', data.correo);
    }
    return this.http.post(url,data)
  }

  validarToken(): Observable<boolean> {
    return this.http.get(`${this.ruta}/login/renew`, {
      headers: this.headers
    }).pipe(
      tap((resp: any) => {
        this.usuario = resp.usuario;
        if(this.isBrowser){
          localStorage.setItem('TOKEN_SESSION', resp.token);
    
          // Verificar si existe la sesión local 'SESSION_EMAIL'
          if (localStorage.getItem('SESSION_EMAIL')) {
            // Almacenar el nombre del usuario en otra sesión
            localStorage.setItem('SESSION_USER_NAME', this.usuario.nombre);
          }
        }
  
        // localStorage.setItem('menu', JSON.stringify( resp.menu) );
      }),
      map(resp => true),
      catchError(error => of(false))
    );
  }

  logout(){
    if(this.isBrowser){
      localStorage.removeItem('TOKEN_SESSION');
      this.router.navigateByUrl('login');
    }
  }

  borrar_Session(){
    if(this.isBrowser){
      localStorage.removeItem('SESSION_EMAIL');
      localStorage.removeItem('SESSION_USER_NAME');
    }
  }

}
