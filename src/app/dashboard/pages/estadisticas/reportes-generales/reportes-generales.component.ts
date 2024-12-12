import { Component } from '@angular/core';
import { TitleComponent } from '@shared/title/title.component';
import GraficasComponent from '../graficas/graficas.component';
import { CommonModule } from '@angular/common';
import { ListasComponent } from '../listas/listas.component';

@Component({
  selector: 'app-reportes-generales',
  imports: [TitleComponent, GraficasComponent, CommonModule, ListasComponent],
  templateUrl: './reportes-generales.component.html',
  styleUrl: './reportes-generales.component.scss'
})
export default class ReportesGeneralesComponent {

  graficas: boolean = true;

}
