import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SideMenuComponent } from '@shared/side-menu/side-menu.component';


@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, CommonModule, SideMenuComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export default class DashboardComponent {

}
