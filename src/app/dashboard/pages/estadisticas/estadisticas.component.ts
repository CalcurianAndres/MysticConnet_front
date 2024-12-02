import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReporteAgrupado } from '@interfaces/req-respons';
import { ReportesResponseService } from '@services/reportes-response.service';
import { TitleComponent } from '@shared/title/title.component';

@Component({
  selector: 'app-estadisticas',
  imports: [TitleComponent, CommonModule],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.scss'
})
export default class EstadisticasComponent {

  public ReportesServices = inject(ReportesResponseService);


  reportesAgrupados: ReporteAgrupado[] = []; // Lista para almacenar los datos

  togglePromotora: boolean[] = [];
  toggleVentas: { [key: number]: boolean[] } = {};

  isRotated: boolean[] = []
  isRotated_: { [key: number]: boolean[] } = {};

  constructor(){

     // Consumir el servicio y asignar los datos
     this.ReportesServices.getReportesAgrupados().subscribe({
      next: (reportes) => {
        this.reportesAgrupados = reportes;
        console.log(this.reportesAgrupados)
      },
      error: (error) => {
        console.error('Error al cargar los reportes:', error);
      }
    });

  }

  togglePromotoraSection(index: number) {
    this.togglePromotora[index] = !this.togglePromotora[index];
    this.isRotated[index] = !this.isRotated[index]
  }

  toggleVentaSection(promotoraIndex: number, ventaIndex: number) {
    if (!this.toggleVentas[promotoraIndex]) {
      this.toggleVentas[promotoraIndex] = [];
    }
    this.toggleVentas[promotoraIndex][ventaIndex] = !this.toggleVentas[promotoraIndex][ventaIndex];
  }

}
