import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { planificacion, ReporteAgrupado, reportes, ReporteSimplificado } from '@interfaces/req-respons';
import { ReportesResponseService } from '@services/reportes-response.service';
import { TitleComponent } from '@shared/title/title.component';
import { PlanificacionComponent } from './planificacion/planificacion.component';
import { UserResponseService } from '@services/user-response.service';
import { PlanificacionService } from '@services/planificacion.service';

@Component({
  selector: 'app-estadisticas',
  imports: [TitleComponent, CommonModule, FormsModule, PlanificacionComponent],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.scss'
})
export default class EstadisticasComponent {

  public ReportesServices = inject(ReportesResponseService);
  public promotoras = inject(UserResponseService);
  public planificacionService = inject(PlanificacionService)
  public active:boolean = false;


  reportesAgrupados: ReporteAgrupado[] = []; // Lista para almacenar los datos
  inicio: string = '2024-12-03';
  cierre: string = '2024-12-06';

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


  getPuntos(nombre: string, apellido:string): number {
    const reporte = this.reportesAgrupados.find(r => r.promotora === `${nombre} ${apellido}`);
    return reporte ? reporte.puntosAcumulados : 0;
  }

  // Función para obtener los gastos acumulados por una promotora
  getGastado(nombre: string, apellido:string): number {
    const reporte = this.reportesAgrupados.find(r => r.promotora === `${nombre} ${apellido}`);
    return reporte ? reporte.totalGastado : 0;
  }

  getReportes(nombre: string, apellido: string) {
    const nombreCompleto = `${nombre} ${apellido}`;
    const reporte = this.reportesAgrupados.find(r => r.promotora === nombreCompleto);
    return reporte ? reporte.reportes : [];
}

getFechasDelRango(): string[] {
  const start = new Date(this.inicio);
  const end = new Date(this.cierre);
  const fechas: string[] = [];

  while (start <= end) {
    fechas.push(this.formatFecha(start));  // Agregar la fecha formateada al array
    start.setDate(start.getDate() + 1);  // Avanzar un día
  }

  return fechas;
}

formatFecha(date: Date): string {
  const dia = ('0' + date.getDate()).slice(-2);
  const mes = ('0' + (date.getMonth() + 1)).slice(-2);  // Mes 0-based, así que sumamos 1
  const anio = date.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

getReportesPorFecha(nombre: string, apellido: string, fecha: string) {
  const nombreCompleto = `${nombre} ${apellido}`;
  const fechaFormateada = this.convertirFechaAISO(fecha); // Asegúrate de usar el mismo formato
  const reporte = this.reportesAgrupados.find(r => r.promotora === nombreCompleto);
  if(reporte){
    let detallado = reporte.reportes.find(reporte => reporte.fecha ===  fechaFormateada)
      if(detallado){
        return detallado
      }else{
        return
      }
  }else{
    return
  }
}

convertirFechaAISO(fecha: string): string {
  // Dividir la fecha en día, mes y año
  const [dia, mes, año] = fecha.split('/');

  // Devolver la fecha en formato ISO (yyyy-mm-dd)
  return `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}


}
