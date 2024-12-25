import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginService } from '@services/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-side-menu',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {

  public LoginService = inject(LoginService)

  public mobile: boolean = false;

  public pass1 = ''
  public pass2 = ''
  public CambioPass: boolean = false

  toggleMenu() {
    this.mobile = !this.mobile;
  }

  logout() {
    this.LoginService.logout();
  }

  ComparePass() {
    if (this.pass1 != '' && (this.pass1 === this.pass2)) {
      return true
    } else {
      return false
    }
  }

  enviarContrasena() {
    if (this.pass1.length < 7) {
      Swal.fire({
        title: 'La contraseña debe tener al menos 7 caracteres',
        icon: 'error',
        toast: true,
        position: 'top-end',
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true
      })
      return
    } else {
      const data = {
        correo: this.LoginService.usuario.correo,
        newPassword: this.pass1
      }

      this.LoginService.CambiarPassword(data).subscribe(res => {
        Swal.fire({
          title: 'Se cambió la contraseña',
          icon: 'success',
          toast: true,
          position: 'top-end',
          timer: 5000,
          showConfirmButton: false,
          timerProgressBar: true
        })

        this.pass1 = '';
        this.pass2 = '';
        this.CambioPass = false;
      })
    }
  }

}
