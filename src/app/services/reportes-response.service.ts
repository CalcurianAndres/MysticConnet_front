import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { ReporteAgrupado, reportes, reportesResponse } from '@interfaces/req-respons';
import { map, Observable } from 'rxjs';
import { PlanificacionService } from './planificacion.service';

interface State {
  reportes: reportesResponse[],
  loading: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ReportesResponseService {

  private http = inject(HttpClient)


  #state = signal<State>({
    loading: true,
    reportes: []
  })


  public reportes = computed(() => this.#state().reportes);
  public loading = computed(() => this.#state().loading);
  public planificacionService = inject(PlanificacionService)
  // public ruta = 'https://mysticconnectserver-production.up.railway.app/api'
  public ruta = 'http://localhost:8080/api'

  constructor() {
    this.cargarReportes();
  }

  cargarReportes() {
    this.http.get<reportesResponse[]>(`${this.ruta}/reportes`)
      .subscribe(res => {
        this.#state.set({
          loading: false,
          reportes: res
        });
      });
  }

  cargarReportes_(inicio: string, fin: string) {
    return this.http.get<reportesResponse[]>(`${this.ruta}/reportes?inicio=${inicio}&fin=${fin}`)
  }

  getReportesAgrupados_(tipoPromotora: boolean, inicio: string, fin: string): Observable<ReporteAgrupado[]> {
    return this.http.get<reportesResponse[]>(`${this.ruta}/reportes?inicio=${inicio}&fin=${fin}`).pipe(
      map((reportes) => {
        const agrupados = reportes.reduce((result, reporte) => {
          const promotoraId = reporte.promotora?._id;

          if (!promotoraId) {
            console.warn('Reporte sin promotora válida:', reporte);
            return result;
          }

          // Filtrar por tipo de promotora
          console.log(reporte.promotora.fija, tipoPromotora)
          if (reporte.promotora.fija !== tipoPromotora) {
            console.warn('reportes que no coincidan con el tipoPromotora:', reporte);
            return result; // Ignorar reportes que no coincidan con el tipoPromotora
          }

          if (!result[promotoraId]) {
            result[promotoraId] = {
              promotora: `${reporte.promotora.nombre} ${reporte.promotora.apellido}`,
              puntosAcumulados: 0,
              totalGastado: 0,
              productosVendidos: 0,
              conteoMetaUnidades: 0,
              productosMystic: 0,
              productosQerametik: 0,
              puntosMystic: 0,
              puntosQerametik: 0,
              reportes: [],
            } as ReporteAgrupado;
          }

          // Acumulación de puntos, productos y cálculo de metas
          const puntosReporte = reporte.productos.reduce(
            (suma, prod) => suma + prod.producto.puntos * prod.cantidad,
            0
          );

          const precioReporte = reporte.productos.reduce(
            (suma, prod) => suma + prod.producto.precio * prod.cantidad,
            0
          );

          const cantidadProductos = reporte.productos.reduce(
            (suma, prod) => suma + prod.cantidad,
            0
          );

          reporte.productos.forEach((prod) => {
            if (prod.producto.marca === 'Mystic') {
              result[promotoraId].productosMystic += prod.cantidad;
              result[promotoraId].puntosMystic += prod.producto.puntos * prod.cantidad;
            } else if (prod.producto.marca === 'Qerametik') {
              result[promotoraId].productosQerametik += prod.cantidad;
              result[promotoraId].puntosQerametik += prod.producto.puntos * prod.cantidad;
            }
          });

          result[promotoraId].puntosAcumulados += puntosReporte;
          result[promotoraId].totalGastado += precioReporte;
          result[promotoraId].productosVendidos += cantidadProductos;

          result[promotoraId].reportes.push({
            cliente: reporte.cliente.cliente,
            marca: reporte.cliente.marca,
            tipo: reporte.tipo,
            observacion: reporte.observacion,
            productos: reporte.productos.map((prod) => ({
              producto: prod.producto.producto,
              linea: prod.producto.linea,
              marca: prod.producto.marca,
              cantidad: prod.cantidad,
              subtotal: prod.producto.precio * prod.cantidad,
              puntosTotales: prod.producto.puntos * prod.cantidad,
            })),
            fecha: reporte.fecha,
            totalPuntos: puntosReporte,
            totalSubtotal: precioReporte,
          });

          return result;
        }, {} as Record<string, ReporteAgrupado>);

        return Object.values(agrupados).sort((a, b) => b.productosVendidos - a.productosVendidos);
      })
    );
  }

  getReportesAgrupados(tipoPromotora: boolean, inicio: string, fin: string): Observable<ReporteAgrupado[]> {
    return this.http.get<reportesResponse[]>(`${this.ruta}/reportes?inicio=${inicio}&fin=${fin}`).pipe(
      map((reportes) => {
        const agrupados = reportes.reduce((result, reporte) => {
          const promotoraId = reporte.promotora?._id;

          if (!promotoraId) {
            console.warn('Reporte sin promotora válida:', reporte);
            return result;
          }

          // Filtrar por tipo de promotora
          console.log(reporte.promotora.fija, tipoPromotora)
          if (reporte.promotora.fija !== tipoPromotora) {
            console.warn('reportes que no coincidan con el tipoPromotora:', reporte);
            return result; // Ignorar reportes que no coincidan con el tipoPromotora
          }

          if (!result[promotoraId]) {
            result[promotoraId] = {
              promotora: `${reporte.promotora.nombre} ${reporte.promotora.apellido}`,
              puntosAcumulados: 0,
              totalGastado: 0,
              productosVendidos: 0,
              conteoMetaUnidades: 0,
              productosMystic: 0,
              productosQerametik: 0,
              puntosMystic: 0,
              puntosQerametik: 0,
              reportes: [],
            } as ReporteAgrupado;
          }

          // Acumulación de puntos, productos y cálculo de metas
          const puntosReporte = reporte.productos.reduce(
            (suma, prod) => suma + prod.producto.puntos * prod.cantidad,
            0
          );

          const precioReporte = reporte.productos.reduce(
            (suma, prod) => suma + prod.producto.precio * prod.cantidad,
            0
          );

          const cantidadProductos = reporte.productos.reduce(
            (suma, prod) => suma + prod.cantidad,
            0
          );

          reporte.productos.forEach((prod) => {
            if (prod.producto.marca === 'Mystic') {
              result[promotoraId].productosMystic += prod.cantidad;
              result[promotoraId].puntosMystic += prod.producto.puntos * prod.cantidad;
            } else if (prod.producto.marca === 'Qerametik') {
              result[promotoraId].productosQerametik += prod.cantidad;
              result[promotoraId].puntosQerametik += prod.producto.puntos * prod.cantidad;
            }
          });

          result[promotoraId].puntosAcumulados += puntosReporte;
          result[promotoraId].totalGastado += precioReporte;
          result[promotoraId].productosVendidos += cantidadProductos;

          result[promotoraId].reportes.push({
            cliente: reporte.cliente.cliente,
            marca: reporte.cliente.marca,
            tipo: reporte.tipo,
            observacion: reporte.observacion,
            productos: reporte.productos.map((prod) => ({
              producto: prod.producto.producto,
              linea: prod.producto.linea,
              marca: prod.producto.marca,
              cantidad: prod.cantidad,
              subtotal: prod.producto.precio * prod.cantidad,
              puntosTotales: prod.producto.puntos * prod.cantidad,
            })),
            fecha: reporte.fecha,
            totalPuntos: puntosReporte,
            totalSubtotal: precioReporte,
          });

          return result;
        }, {} as Record<string, ReporteAgrupado>);

        return Object.values(agrupados).sort((a, b) => b.productosVendidos - a.productosVendidos);
      })
    );
  }




  NuevoReporte(data: reportes) {


    // Enviar la solicitud al servidor
    this.http.post<reportes>(`${this.ruta}/reportes`, data).subscribe((res) => {
      // Actualizar el estado agregando el nuevo producto
      this.cargarReportes()
    });
  }

  formatFecha(date: any): string {
    const dia = ('0' + date.getDate()).slice(-2);
    const mes = ('0' + (date.getMonth() + 1)).slice(-2);  // Mes 0-based, así que sumamos 1
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }


}
