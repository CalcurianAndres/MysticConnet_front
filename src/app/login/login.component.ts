import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '@services/login.service';
import { catchError, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export default class LoginComponent implements OnInit{

  public loginService = inject(LoginService);
  private router = inject(Router)

  ngOnInit(): void {
    this.session_email = this.loginService.Correo_session;
    this.session_name = this.loginService.Nombre_session;
  }

  public Correo = ''
  public Password = ''
  public session_email = ''
  public session_name = ''


  login(){

    const checkbox = document.getElementById('recuerdame') as HTMLInputElement;

    if(!this.Correo || !this.Password){
      return
    }

    let data = {
      correo:this.Correo,
      password:this.Password
    }

    this.loginService.Login(data,checkbox.checked)
  .pipe(
    catchError((error) => {
      // Handle the error here
      console.error('Error occurred:', error);
      
      // You can return a user-friendly message or an empty observable
      // For example, returning an observable with an error message
      return of({ error: true, message: 'Correo o contraseña incorrecta' });
    })
  )
  .subscribe((resp: any) => {
    if (resp.error) {
      Swal.fire({
        icon: 'error',
        title: resp.message, // Use the error message returned from the catchError
        toast: true,
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
        position:'top-end'
      });
    } else {
      localStorage.setItem('TOKEN_SESSION', resp.token);
      this.router.navigateByUrl('/dashboard')
      // Handle successful login response here
    }
  });
  }

}
