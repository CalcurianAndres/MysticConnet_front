import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReporteAgrupado } from '@interfaces/req-respons';
import { PlanificacionService } from '@services/planificacion.service';
import { ReportesResponseService } from '@services/reportes-response.service';
import { UserResponseService } from '@services/user-response.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-listas',
  imports: [CommonModule, FormsModule],
  templateUrl: './listas.component.html',
  styleUrl: './listas.component.scss'
})
export class ListasComponent {

  // PRUEBA EXCEL

  exportarExcel() {
    // Obtener los datos de la tabla
    const datos: any[] = this.reportesAgrupadosOrdenados.map(promotora => ({
      Promotora: promotora.promotora,
      'Meta alcanzada': promotora.conteoMetaUnidades,
      'Productos vendidos': promotora.productosVendidos,
      'Productos Mystic': promotora.productosMystic,
      'Productos Qerametik': promotora.productosQerametik,
      Puntuación: promotora.puntosAcumulados,
      'Puntos Mystic': promotora.puntosMystic,
      'Puntos Qerametik': promotora.puntosQerametik,
      Incentivo: this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik).totales,
      'Monto Und. vendidas': promotora.totalGastado,
      Incidencia: this.calcularIncidencia(promotora),
      Sueldo: this.BuscarInfo(promotora.promotora)?.sueldo,
      'Sueldo por día': this.calcularSueldoPorDia(promotora),
      'Ventas por día': this.calcularVentasPorDia(promotora),
      'Incidencia %': this.calcularIncidenciaPorcentaje(promotora)
    }));

    // Crear el libro de Excel
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro: XLSX.WorkBook = { Sheets: { 'Reporte': hoja }, SheetNames: ['Reporte'] };

    // Guardar como archivo
    const excelBuffer: any = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'ReportePromotoras.xlsx');
  }

  calcularIncidencia(promotora: any): string {
    // Agrega la lógica necesaria para calcular la incidencia
    return ((this.obtenerIncentivo(promotora.puntosAcumulados, this.planificacionService.planificacion()[this.indexPlanificacion].incentivos) / promotora.totalGastado) * 100).toFixed(2) + '%';
  }

  calcularSueldoPorDia(promotora: any): number {
    return this.puntos(this.BuscarInfo(promotora.promotora)?.sueldo) / promotora.reportes.length;
  }

  calcularVentasPorDia(promotora: any): number {
    return promotora.totalGastado / promotora.reportes.length;
  }

  calcularIncidenciaPorcentaje(promotora: any): string {
    return (
      (this.calcularSueldoPorDia(promotora) / this.calcularVentasPorDia(promotora)) *
      100
    ).toFixed(2) + '%';
  }


  // PRUEBA EXCEL

  public ReportesServices = inject(ReportesResponseService)
  public reportesAgrupados!: ReporteAgrupado[];
  public planificacionService = inject(PlanificacionService)
  public promotoras = inject(UserResponseService)

  clientesConProductos: { cliente: string; totalProductos: number }[] = [];

  indexPlanificacion: any = 0;

  ordenActual: { columna: string; ascendente: boolean } = {
    columna: 'totalGastado', // Columna inicial para el ordenamiento
    ascendente: false,       // Orden inicial: descendente
  };

  reportesAgrupadosOrdenados: ReporteAgrupado[] = []; // Para los datos ordenados
  ventasPorZona: { zona: string; totalProductos: number }[] = [];


  constructor() {
    this.indexPlanificacion = this.planificacionService.planificacion().length - 1
    this.refresh()
  }

  cambiar() {
    this.refresh()
  }

  refresh() {
    setTimeout(() => {
      if (!this.planificacionService.loading()) {
        this.ReportesServices.getReportesAgrupados_(true, this.planificacionService.planificacion()[this.indexPlanificacion].inicio, this.planificacionService.planificacion()[this.indexPlanificacion].cierre).subscribe({
          next: (reportes) => {
            this.reportesAgrupados = reportes;
            this.reportesAgrupadosOrdenados = [...this.reportesAgrupados];
          },
          error: (error) => {
            console.error('Error al cargar los reportes:', error);
          }
        });
        this.calcularProductosPorCliente()
        this.calcularVentasPorZona()
      }
    }, 1000);
  }

  simplificar(date: string) {
    return date.split('T')[0]
  }

  puntos(puntos: any) {
    if (!puntos) {
      return 0
    } else {
      return puntos
    }
  }

  obtenerIncentivo(puntos: number, incentivos: any) {
    // Si los puntos son menores que el mínimo del primer rango
    if (puntos < incentivos[0].de) {
      return 0;  // No hay incentivo
    }

    // Iteramos a través de los incentivos
    for (let i = 0; i < incentivos.length; i++) {
      let incentivo = incentivos[i];

      // Verificamos si los puntos están dentro del rango
      if (puntos >= incentivo.de && puntos <= incentivo.hasta) {
        return incentivo.incentivo;  // Devolvemos el incentivo
      }
    }

    return 0;  // Si no está en ningún rango, devolvemos 0
  }

  obtenerIncentivos(Puntos_Mystic: number, puntos_Qerametik: any) {
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

  BuscarInfo(prom: string) {
    let promotora = prom.split(' ');
    let nombre = promotora[0];
    let apellido = promotora[1];

    return this.promotoras.users().find(prom => prom.nombre === nombre && prom.apellido === apellido)

  }

  ordenarPor(columna: keyof ReporteAgrupado) {
    if (this.ordenActual.columna === columna) {
      this.ordenActual.ascendente = !this.ordenActual.ascendente;
    } else {
      this.ordenActual.columna = columna;
      this.ordenActual.ascendente = true; // Por defecto, comienza en orden ascendente
    }

    this.reportesAgrupadosOrdenados = [...this.reportesAgrupados].sort((a, b) => {
      const valorA = a[columna];
      const valorB = b[columna];

      if (valorA < valorB) {
        return this.ordenActual.ascendente ? -1 : 1;
      } else if (valorA > valorB) {
        return this.ordenActual.ascendente ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  calcularProductosPorCliente(): void {
    const clienteMap: Record<string, { cliente: string; totalProductos: number }> = {};

    this.ReportesServices.cargarReportes_(this.planificacionService.planificacion()[this.indexPlanificacion].inicio, this.planificacionService.planificacion()[this.indexPlanificacion].cierre).subscribe({
      next: (_reportes) => {
        _reportes.forEach((reporte) => {
          if (
            !reporte.cliente ||
            !reporte.cliente._id ||
            reporte.cliente.cliente === 'FALTA JUSTIFICADA'
          ) {
            console.warn('Reporte excluido (cliente inválido o "FALTA JUSTIFICADA"):', reporte);
            return;
          }

          const clienteId = reporte.cliente._id;
          const clienteNombre = reporte.cliente.cliente;

          if (!clienteMap[clienteId]) {
            clienteMap[clienteId] = { cliente: clienteNombre, totalProductos: 0 };
          }

          // Sumar productos vendidos en este reporte
          const totalProductosEnReporte = reporte.productos.reduce(
            (suma, producto) => suma + producto.cantidad,
            0
          );

          clienteMap[clienteId].totalProductos += totalProductosEnReporte;
        });

        // Convertir el objeto a un array y ordenar por cantidad de productos vendidos
        this.clientesConProductos = Object.values(clienteMap).sort(
          (a, b) => b.totalProductos - a.totalProductos
        );
      },
      error: (error) => {
        console.error('Error al cargar los reportes:', error);
      }
    });
  }

  calcularVentasPorZona(): void {
    const zonaMap: Record<string, { zona: string; totalProductos: number }> = {};

    this.ReportesServices.cargarReportes_(this.planificacionService.planificacion()[this.indexPlanificacion].inicio, this.planificacionService.planificacion()[this.indexPlanificacion].cierre).subscribe({
      next: (_reportes) => {
        _reportes.forEach((reporte) => {
          if (!reporte.promotora || !reporte.promotora.region) {
            console.warn('Reporte excluido (promotora sin zona):', reporte);
            return;
          }

          const zona = reporte.promotora.region;

          if (!zonaMap[zona]) {
            zonaMap[zona] = { zona, totalProductos: 0 };
          }

          const totalProductosEnReporte = reporte.productos.reduce(
            (suma, producto) => suma + producto.cantidad,
            0
          );

          zonaMap[zona].totalProductos += totalProductosEnReporte;
        });

        this.ventasPorZona = Object.values(zonaMap).sort(
          (a, b) => b.totalProductos - a.totalProductos
        );
      },
      error: (error) => {
        console.error('Error al cargar los reportes:', error);
      }
    })
  }


  getTotal(key: keyof ReporteAgrupado): number {
    return this.reportesAgrupadosOrdenados.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
  }


  CambiarAfijas(fijas: any) {
    if (fijas.value === 'Fijas') {
      this.ReportesServices.getReportesAgrupados_(true, this.planificacionService.planificacion()[this.indexPlanificacion].inicio, this.planificacionService.planificacion()[this.indexPlanificacion].cierre).subscribe({
        next: (reportes) => {
          this.reportesAgrupados = reportes;
          this.reportesAgrupadosOrdenados = [...this.reportesAgrupados];
        },
        error: (error) => {
          console.error('Error al cargar los reportes:', error);
        }
      });
    } else {
      this.ReportesServices.getReportesAgrupados_(false, this.planificacionService.planificacion()[this.indexPlanificacion].inicio, this.planificacionService.planificacion()[this.indexPlanificacion].cierre).subscribe({
        next: (reportes) => {
          this.reportesAgrupados = reportes;
          this.reportesAgrupadosOrdenados = [...this.reportesAgrupados];
        },
        error: (error) => {
          console.error('Error al cargar los reportes:', error);
        }
      });
    }
  }

}
