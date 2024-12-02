import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginService } from '@services/login.service';

@Component({
  selector: 'app-side-menu',
  imports: [CommonModule, RouterModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {

  public LoginService = inject(LoginService)

  public mobile:boolean = false;

  toggleMenu() {
    this.mobile = !this.mobile;
  }

  logout(){
    this.LoginService.logout();
  }

}
