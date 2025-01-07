import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { planificacion, ReporteAgrupado, reportes, ReporteSimplificado } from '@interfaces/req-respons';
import { ReportesResponseService } from '@services/reportes-response.service';
import { TitleComponent } from '@shared/title/title.component';
import { UserResponseService } from '@services/user-response.service';
import { PlanificacionService } from '@services/planificacion.service';
import { LoadingsComponent } from '@shared/loadings/loadings.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-estadisticas',
  imports: [TitleComponent, CommonModule, FormsModule, LoadingsComponent, RouterModule],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.scss'
})
export default class EstadisticasComponent {

  public ReportesServices = inject(ReportesResponseService);
  public promotoras = inject(UserResponseService);
  public planificacionService = inject(PlanificacionService)
  public active: boolean = false;
  indexPlanificacion: any = 0
  public promotorasFiltered: any = [];

  public promotorasFilteredFunction(data: any) {
    if (data.value === 'fija') {
      this.promotorasFiltered = this.promotoras.users().filter((promotora: any) => promotora.fija === true);
    } else {
      this.promotorasFiltered = this.promotoras.users().filter((promotora: any) => promotora.fija === false);
    }
  }


  reportesAgrupados: ReporteAgrupado[] = []; // Lista para almacenar los datos
  togglePromotora: boolean[] = [];
  toggleVentas: { [key: number]: boolean[] } = {};
  isRotated: boolean[] = []
  isRotated_: { [key: number]: boolean[] } = {};

  constructor() {

    // Consumir el servicio y asignar los datos
    setTimeout(() => {
      if (!this.planificacionService.loading()) {
        this.indexPlanificacion = this.planificacionService.planificacion().length - 1
        this.promotorasFilteredFunction({ value: 'fija' })
        this.ReportesServices.getReportesAgrupados(true, this.planificacionService.planificacion()[this.indexPlanificacion].inicio, this.planificacionService.planificacion()[this.indexPlanificacion].cierre).subscribe({
          next: (reportes) => {
            this.reportesAgrupados = reportes;
            console.log(this.reportesAgrupados)
          },
          error: (error) => {
            console.error('Error al cargar los reportes:', error);
          }
        });
      }
    }, 500);

  }

  cambiarPlanificacion() {
    setTimeout(() => {
      if (!this.planificacionService.loading()) {
        this.promotorasFilteredFunction({ value: 'fija' })
        this.ReportesServices.getReportesAgrupados(true, this.planificacionService.planificacion()[this.indexPlanificacion].inicio, this.planificacionService.planificacion()[this.indexPlanificacion].cierre).subscribe({
          next: (reportes) => {
            this.reportesAgrupados = reportes;
            console.log(this.reportesAgrupados)
          },
          error: (error) => {
            console.error('Error al cargar los reportes:', error);
          }
        });
      }
    }, 500);
  }

  simplificar(date: string) {
    return date.split('T')[0]
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


  getPuntos(nombre: string, apellido: string): number {
    const reporte = this.reportesAgrupados.find(r => r.promotora === `${nombre} ${apellido}`);
    return reporte ? reporte.puntosAcumulados : 0;
  }

  buscarDiasTrabajados(nombre: string, apellido: string): number {
    const reporte = this.reportesAgrupados.find(r => r.promotora === `${nombre} ${apellido}`);
    if (reporte) {
      const fechasUnicas = new Set(reporte.reportes.map(r => r.fecha));
      return fechasUnicas.size;
    }
    return 0;
  }

  sueldodiario(sueldo: any, diasTrabajados: number) {
    return Number(sueldo) / diasTrabajados;
  }

  // Función para obtener los gastos acumulados por una promotora
  getGastado(nombre: string, apellido: string): number {
    const reporte = this.reportesAgrupados.find(r => r.promotora === `${nombre} ${apellido}`);
    return reporte ? reporte.totalGastado : 0;
  }

  getReportes(nombre: string, apellido: string) {
    const nombreCompleto = `${nombre} ${apellido}`;
    const reporte = this.reportesAgrupados.find(r => r.promotora === nombreCompleto);
    return reporte ? reporte.reportes : [];
  }

  getFechasDelRango(): string[] {
    const hoy = new Date();
    const manana = new Date(hoy); // Crear una nueva instancia para no modificar `hoy`
    manana.setDate(hoy.getDate() + 1); // Agregar un día
    let end = manana;
    const start = new Date(this.planificacionService.planificacion()[this.indexPlanificacion].inicio);
    if (new Date(this.planificacionService.planificacion()[this.indexPlanificacion].cierre) < hoy) {
      end = new Date(this.planificacionService.planificacion()[this.indexPlanificacion].cierre);
    }
    const fechas: string[] = [];

    while (start <= end) {
      const fecha = new Date(start);
      fecha.setDate(fecha.getDate() + 1); // Agregar un día a la fecha
      fechas.push(this.formatFecha(fecha));  // Agregar la fecha formateada al array
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
    if (reporte) {
      let detallado = reporte.reportes.filter(reporte => reporte.fecha === fechaFormateada)
      if (detallado.length > 0) {
        return detallado
      } else {
        return
      }
    } else {
      return
    }
  }

  convertirFechaAISO(fecha: string): string {
    // Dividir la fecha en día, mes y año
    const [dia, mes, año] = fecha.split('/');

    // Devolver la fecha en formato ISO (yyyy-mm-dd)
    return `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  calcularDiasHabiles(inicio: string, cierre: string): number {

    let InicioFormated = new Date(inicio)
    let CierreFormated = new Date(cierre)

    let diasHabiles = 0;

    // Asegurarse de que 'inicio' sea anterior a 'cierre'
    if (InicioFormated > CierreFormated) {
      // Si la fecha de inicio es mayor que la de cierre, intercambiarlas
      let temp = InicioFormated;
      InicioFormated = CierreFormated;
      CierreFormated = temp;
    }

    // Iteramos por cada día entre las dos fechas
    let fechaActual = new Date(InicioFormated);

    while (fechaActual <= CierreFormated) {
      const diaSemana = fechaActual.getDay(); // getDay() devuelve el día de la semana (0=domingo, 1=lunes, ..., 6=sábado)

      // Si el día no es sábado (6) ni domingo (0), es un día hábil
      if (diaSemana !== 0 && diaSemana !== 6) {
        diasHabiles++;
      }

      // Pasamos al siguiente día
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return diasHabiles;
  }

  puntos(puntos: any) {
    if (!puntos) {
      return 0
    } else {
      return puntos
    }
  }

  obtenerIncentivo(nombre: string, apellido: string) {

    let reportes = this.reportesAgrupados.find(r => r.promotora === `${nombre} ${apellido}`)

    let Puntos_Mystic = 0;
    let puntos_Qerametik = 0;

    if (reportes) {
      Puntos_Mystic = reportes.puntosMystic;
      puntos_Qerametik = reportes.puntosQerametik;
    }

    let totales = 0;
    let mystic = 0;
    let Qerametik = 0;

    if (Puntos_Mystic < this.planificacionService.planificacion()[this.indexPlanificacion].incentivos[0].de) {
      mystic = 0;
    } else {
      for (let i = 0; i < this.planificacionService.planificacion()[this.indexPlanificacion].incentivos.length; i++) {
        let incentivo = this.planificacionService.planificacion()[this.indexPlanificacion].incentivos[i];

        // Verificamos si los puntos están dentro del rango
        if (Puntos_Mystic >= incentivo.de && Puntos_Mystic <= incentivo.hasta) {
          mystic = incentivo.incentivo;  // Devolvemos el incentivo
        }
      }
    }

    if (puntos_Qerametik < this.planificacionService.planificacion()[this.indexPlanificacion].incentivos_qerametik[0].de) {
      Qerametik = 0;
    } else {
      for (let i = 0; i < this.planificacionService.planificacion()[this.indexPlanificacion].incentivos_qerametik.length; i++) {
        let incentivo = this.planificacionService.planificacion()[this.indexPlanificacion].incentivos_qerametik[i];

        // Verificamos si los puntos están dentro del rango
        if (puntos_Qerametik >= incentivo.de && puntos_Qerametik <= incentivo.hasta) {
          Qerametik = incentivo.incentivo;  // Devolvemos el incentivo
        }
      }
    }

    return {
      totales: mystic + Qerametik,
      mystic: mystic,
      qerametik: Qerametik
    }
  }

  noHuboReporteAyer(nombre: string, apellido: string): boolean {
    const fechaAyer = new Date();
    fechaAyer.setDate(fechaAyer.getDate() - 1);

    // Formato 'YYYY/mm/dd'
    const year = fechaAyer.getFullYear();
    const month = String(fechaAyer.getMonth() + 1).padStart(2, '0'); // Los meses van de 0-11
    const day = String(fechaAyer.getDate()).padStart(2, '0');
    const fechaAyerStr = `${day}/${month}/${year}`;

    return !this.getReportesPorFecha(nombre, apellido, fechaAyerStr);
  }


}
