import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { ReporteAgrupado, reportes, reportesResponse } from '@interfaces/req-respons';
import { map, Observable } from 'rxjs';

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
  public ruta = 'https://mysticconnectserver-production.up.railway.app/api'

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

  getReportesAgrupados(): Observable<ReporteAgrupado[]> {
    return this.http.get<reportesResponse[]>(`${this.ruta}/reportes`).pipe(
      map((reportes) => {
        const agrupados = reportes.reduce((result, reporte) => {
          const promotoraId = reporte.promotora?._id;
          if (!promotoraId) {
            console.warn('Reporte sin promotora válida:', reporte);
            return result;
          }

          if (!result[promotoraId]) {
            result[promotoraId] = {
              promotora: `${reporte.promotora.nombre} ${reporte.promotora.apellido}`,
              puntosAcumulados: 0,
              totalGastado: 0,
              productosVendidos: 0,
              conteoMetaUnidades: 0, // Agregamos este contador
              reportes: [],
            } as ReporteAgrupado;
          }

          // Calcular los puntos totales, el precio total y la cantidad de productos de cada reporte
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

          // Verificar si la promotora alcanzó la meta de 30 unidades en este reporte
          if (cantidadProductos >= 30) {
            result[promotoraId].conteoMetaUnidades += 1;
          }

          // Acumulamos los puntos, el total gastado y la cantidad de productos para la promotora
          result[promotoraId].puntosAcumulados += puntosReporte;
          result[promotoraId].totalGastado += precioReporte;
          result[promotoraId].productosVendidos += cantidadProductos;

          // Agregar el reporte a la lista de reportes de la promotora
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

        // Convertir el objeto de reportes agrupados en un arreglo para devolverlo y ordenarlo
        console.log(Object.values(agrupados).sort((a, b) => b.productosVendidos - a.productosVendidos))
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
