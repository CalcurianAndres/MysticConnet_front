import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReporteAgrupado } from '@interfaces/req-respons';
import { PlanificacionService } from '@services/planificacion.service';
import { ReportesResponseService } from '@services/reportes-response.service';
import { UserResponseService } from '@services/user-response.service';

@Component({
  selector: 'app-listas',
  imports: [CommonModule],
  templateUrl: './listas.component.html',
  styleUrl: './listas.component.scss'
})
export class ListasComponent {

  public ReportesServices = inject(ReportesResponseService)
  public reportesAgrupados!: ReporteAgrupado[];
  public planificacionService = inject(PlanificacionService)
  public promotoras = inject(UserResponseService)

  clientesConProductos: { cliente: string; totalProductos: number }[] = [];

  indexPlanificacion: any = null

  ordenActual: { columna: string; ascendente: boolean } = {
    columna: 'totalGastado', // Columna inicial para el ordenamiento
    ascendente: false,       // Orden inicial: descendente
  };

  reportesAgrupadosOrdenados: ReporteAgrupado[] = []; // Para los datos ordenados
  ventasPorZona: { zona: string; totalProductos: number }[] = [];


  constructor() {
    this.ReportesServices.getReportesAgrupados_(true).subscribe({
      next: (reportes) => {
        this.reportesAgrupados = reportes;
        this.reportesAgrupadosOrdenados = [...this.reportesAgrupados];
      },
      error: (error) => {
        console.error('Error al cargar los reportes:', error);
      }
    });

    setTimeout(() => {
      if (!this.planificacionService.loading()) {
        this.indexPlanificacion = this.planificacionService.planificacion().length - 1
        this.calcularProductosPorCliente()
        this.calcularVentasPorZona()
      }
    }, 1000);

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
    console.log(incentivos)
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

    this.ReportesServices.reportes().forEach((reporte) => {
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
  }

  calcularVentasPorZona(): void {
    const zonaMap: Record<string, { zona: string; totalProductos: number }> = {};

    this.ReportesServices.reportes().forEach((reporte) => {
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
  }


  getTotal(key: keyof ReporteAgrupado): number {
    return this.reportesAgrupadosOrdenados.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
  }


  CambiarAfijas(fijas: any) {
    if (fijas.value === 'Fijas') {
      this.ReportesServices.getReportesAgrupados_(true).subscribe({
        next: (reportes) => {
          this.reportesAgrupados = reportes;
          this.reportesAgrupadosOrdenados = [...this.reportesAgrupados];
        },
        error: (error) => {
          console.error('Error al cargar los reportes:', error);
        }
      });
    } else {
      this.ReportesServices.getReportesAgrupados_(false).subscribe({
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
