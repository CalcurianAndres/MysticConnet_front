import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReporteAgrupado } from '@interfaces/req-respons';
import { PlanificacionService } from '@services/planificacion.service';
import { ReportesResponseService } from '@services/reportes-response.service';
import { UserResponseService } from '@services/user-response.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-listas',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './listas.component.html',
  styleUrl: './listas.component.scss'
})
export class ListasComponent {

  // PRUEBA EXCEL

  exportarExcel() {
    // Obtener los datos de la tabla
    const datos_Mystic: any[] = this.reportesAgrupadosOrdenados
      .filter(promotora => this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik).mystic > 0) // Filtrar Mystic
      .map(promotora => ({
        Promotora: promotora.promotora,
        Marca: promotora.marca,
        Region: promotora.region,
        'Productos vendidos': promotora.productosMystic,
        'Costo promedio': 2.4,
        Puntuación: promotora.puntosMystic,
        Incentivo: this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik).mystic,
        'Promedio exito': this.calcularPorcentaje(promotora.conteoMetaUnidades, this.buscarDiasTrabajados(promotora.promotora).totalDias),
        'Monto de Und. Vendidas': 2.4 * promotora.productosMystic,
        Incidencia: (this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik).mystic / (2.4 * promotora.productosMystic) * 100).toFixed(2),
        'Total ventas de impulso': promotora.totalImpulsos,
        'Total ventas de evento': promotora.totalEventos,
        'Dias impulso': this.buscarDiasTrabajados(promotora.promotora).impulsoMystic,
        'Dias evento': this.buscarDiasTrabajados(promotora.promotora).eventoMystic
      }))
      .sort((a, b) => b['Puntuación'] - a['Puntuación']); // Ordenar por Incentivo en orden descendente

    const datos_Qerametik: any[] = this.reportesAgrupadosOrdenados
      .filter(promotora => this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik).qerametik > 0) // Filtrar Qerametik
      .map(promotora => ({
        Promotora: promotora.promotora,
        Marca: promotora.marca,
        Region: promotora.region,
        'Productos vendidos': promotora.productosQerametik,
        'Costo promedio': 4.89,
        Puntuación: promotora.puntosQerametik,
        Incentivo: this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik).qerametik,
        'Promedio exito': this.calcularPorcentaje(promotora.conteoMetaUnidades, this.buscarDiasTrabajados(promotora.promotora).totalDias),
        'Monto de Und. Vendidas': 4.89 * promotora.productosQerametik,
        Incidencia: (this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik).qerametik / (4.89 * promotora.productosQerametik) * 100).toFixed(2),
        'Total ventas de impulso': promotora.totalImpulsos_qerametik,
        'Total ventas de evento': promotora.totalEventos_qerametik,
        'Dias impulso': this.buscarDiasTrabajados(promotora.promotora).impulsoQerametik,
        'Dias evento': this.buscarDiasTrabajados(promotora.promotora).eventoQerametik
      }))
      .sort((a, b) => b['Puntuación'] - a['Puntuación']); // Ordenar por Incentivo en orden descendente

    // Crear el libro de Excel
    const hoja_Mystic = XLSX.utils.json_to_sheet(datos_Mystic);
    const hoja_Qerametik = XLSX.utils.json_to_sheet(datos_Qerametik);

    // Crear el libro con la hoja modificada
    const libro: XLSX.WorkBook = { Sheets: { 'Reportes Mystic': hoja_Mystic, 'Reportes Qerametik': hoja_Qerametik }, SheetNames: ['Reportes Mystic', 'Reportes Qerametik'] };

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

  public datos_Mystic: any[] = [];
  public datos_Qerametik: any[] = [];

  public clientesMystic: { cliente: string; totalProductos: number }[] = [];
  public clientesQerametik: { cliente: string; totalProductos: number }[] = [];
  public ventasPorZonaMystic: { zona: string; totalProductos: number }[] = [];
  public ventasPorZonaQerametik: { zona: string; totalProductos: number }[] = [];



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

            // Obtener los datos de la tabla
            this.datos_Mystic = this.reportesAgrupadosOrdenados
              .filter(promotora => this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik).mystic >= 0) // Filtrar Mystic
              .map(promotora => ({
                Promotora: promotora.promotora,
                Marca: promotora.marca,
                Region: promotora.region,
                'Productos vendidos': promotora.productosMystic,
                'Costo promedio': 2.4,
                Puntuación: promotora.puntosMystic,
                Incentivo: this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik).mystic,
                'Monto de Und. Vendidas': 2.4 * promotora.productosMystic,
                Incidencia: (this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik).mystic / (2.4 * promotora.productosMystic) * 100).toFixed(2),
                'Total ventas de impulso': promotora.totalImpulsos,
                'Total ventas de evento': promotora.totalEventos,
                'Dias trabajados': this.buscarDiasTrabajados(promotora.promotora).totalDias,
                'Metas alcanzadas': promotora.conteoMetaUnidades,
                'Dias impulso': this.buscarDiasTrabajados(promotora.promotora).impulsoMystic,
                'Dias evento': this.buscarDiasTrabajados(promotora.promotora).eventoMystic
              }))
              .sort((a, b) => b['Puntuación'] - a['Puntuación']); // Ordenar por Incentivo en orden descendente

            this.datos_Qerametik = this.reportesAgrupadosOrdenados
              .filter(promotora => this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik).qerametik >= 0) // Filtrar Qerametik
              .map(promotora => ({
                Promotora: promotora.promotora,
                Marca: promotora.marca,
                Region: promotora.region,
                'Productos vendidos': promotora.productosQerametik,
                'Costo promedio': 4.89,
                Puntuación: promotora.puntosQerametik,
                Incentivo: this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik).qerametik,
                'Monto de Und. Vendidas': 4.89 * promotora.productosQerametik,
                Incidencia: (this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik).qerametik / (4.89 * promotora.productosQerametik) * 100).toFixed(2),
                'Total ventas de impulso': promotora.totalImpulsos_qerametik,
                'Total ventas de evento': promotora.totalEventos_qerametik,
                'Dias trabajados': this.buscarDiasTrabajados(promotora.promotora).totalDias,
                'Metas alcanzadas': promotora.conteoMetaUnidadesQ,
                'Dias impulso': this.buscarDiasTrabajados(promotora.promotora).impulsoQerametik,
                'Dias evento': this.buscarDiasTrabajados(promotora.promotora).eventoQerametik
              }))
              .sort((a, b) => b['Puntuación'] - a['Puntuación']);
          },
          error: (error) => {
            console.error('Error al cargar los reportes:', error);
          }
        });
        this.calcularProductosPorCliente()
        this.calcularVentasPorZona()
      }
    }, 500);
  }

  buscarDiasTrabajados(nombre: string): {
    totalDias: number;
    impulsoMystic: number;
    eventoMystic: number;
    impulsoQerametik: number;
    eventoQerametik: number;
  } {
    const reporte = this.reportesAgrupados.find(r => r.promotora === nombre);

    if (reporte) {
      const fechasImpulsoMystic = new Set(
        reporte.reportes
          .filter(r => r.tipo === 'Impulso' && r.productos.some(p => p.marca === 'Mystic'))
          .map(r => r.fecha)
      );

      const fechasEventoMystic = new Set(
        reporte.reportes
          .filter(r => r.tipo === 'Evento' && r.productos.some(p => p.marca === 'Mystic'))
          .map(r => r.fecha)
      );

      const fechasImpulsoQerametik = new Set(
        reporte.reportes
          .filter(r => r.tipo === 'Impulso' && r.productos.some(p => p.marca === 'Qerametik'))
          .map(r => r.fecha)
      );

      const fechasEventoQerametik = new Set(
        reporte.reportes
          .filter(r => r.tipo === 'Evento' && r.productos.some(p => p.marca === 'Qerametik'))
          .map(r => r.fecha)
      );

      const totalDias = new Set(reporte.reportes.map(r => r.fecha)).size;

      return {
        totalDias,
        impulsoMystic: fechasImpulsoMystic.size,
        eventoMystic: fechasEventoMystic.size,
        impulsoQerametik: fechasImpulsoQerametik.size,
        eventoQerametik: fechasEventoQerametik.size,
      };
    }

    return { totalDias: 0, impulsoMystic: 0, eventoMystic: 0, impulsoQerametik: 0, eventoQerametik: 0 };
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
    const clienteMap: Record<string, { cliente: string; totalProductos: number; marca: string }> = {};
    const mysticClientes: Array<{ cliente: string; totalProductos: number }> = [];
    const qerametikClientes: Array<{ cliente: string; totalProductos: number }> = [];

    this.ReportesServices.cargarReportes_(
      this.planificacionService.planificacion()[this.indexPlanificacion].inicio,
      this.planificacionService.planificacion()[this.indexPlanificacion].cierre
    ).subscribe({
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
          const clienteMarca = reporte.productos[0].producto.marca; // Asegúrate de que `marca` existe en el objeto cliente.

          if (!clienteMap[clienteId]) {
            clienteMap[clienteId] = {
              cliente: clienteNombre,
              totalProductos: 0,
              marca: clienteMarca,
            };
          }

          // Sumar productos vendidos en este reporte
          const totalProductosEnReporte = reporte.productos.reduce(
            (suma, producto) => suma + producto.cantidad,
            0
          );

          clienteMap[clienteId].totalProductos += totalProductosEnReporte;
        });

        // Convertir el objeto a un array
        const clientesArray = Object.values(clienteMap);

        // Separar por marcas y ordenar por cantidad de productos vendidos
        clientesArray.forEach((cliente) => {
          if (cliente.marca === 'Mystic') {
            mysticClientes.push({ cliente: cliente.cliente, totalProductos: cliente.totalProductos });
          } else if (cliente.marca === 'Qerametik') {
            qerametikClientes.push({ cliente: cliente.cliente, totalProductos: cliente.totalProductos });
          }
        });

        // Ordenar cada lista por cantidad de productos vendidos
        this.clientesMystic = mysticClientes.sort((a, b) => b.totalProductos - a.totalProductos);
        this.clientesQerametik = qerametikClientes.sort((a, b) => b.totalProductos - a.totalProductos);
      },
      error: (error) => {
        console.error('Error al cargar los reportes:', error);
      },
    });
  }

  calcularVentasPorZona(): void {
    const zonaMapMystic: Record<string, { zona: string; totalProductos: number }> = {};
    const zonaMapQerametik: Record<string, { zona: string; totalProductos: number }> = {};

    this.ReportesServices.cargarReportes_(
      this.planificacionService.planificacion()[this.indexPlanificacion].inicio,
      this.planificacionService.planificacion()[this.indexPlanificacion].cierre
    ).subscribe({
      next: (_reportes) => {
        _reportes.forEach((reporte) => {
          if (!reporte.promotora || !reporte.promotora.region) {
            console.warn('Reporte excluido (promotora sin zona):', reporte);
            return;
          }

          const zona = reporte.promotora.region;

          reporte.productos.forEach((producto) => {
            const cantidad = producto.cantidad;

            if (producto.producto.marca === 'Mystic') {
              if (!zonaMapMystic[zona]) {
                zonaMapMystic[zona] = { zona, totalProductos: 0 };
              }
              zonaMapMystic[zona].totalProductos += cantidad;
            } else if (producto.producto.marca === 'Qerametik') {
              if (!zonaMapQerametik[zona]) {
                zonaMapQerametik[zona] = { zona, totalProductos: 0 };
              }
              zonaMapQerametik[zona].totalProductos += cantidad;
            }
          });
        });

        this.ventasPorZonaMystic = Object.values(zonaMapMystic).sort(
          (a, b) => b.totalProductos - a.totalProductos
        );
        this.ventasPorZonaQerametik = Object.values(zonaMapQerametik).sort(
          (a, b) => b.totalProductos - a.totalProductos
        );
      },
      error: (error) => {
        console.error('Error al cargar los reportes:', error);
      }
    });
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

  calcularPorcentaje(x: number, y: number) {
    return (x / y) * 100
  }

}
