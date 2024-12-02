import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { ReporteAgrupado, reportes, reportesResponse } from '@interfaces/req-respons';
import { map, Observable } from 'rxjs';

interface State {
  reportes:reportesResponse[],
  loading:boolean
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


  public productos = computed( () => this.#state().reportes );
  public loading = computed( () => this.#state().loading ); 
  public ruta = 'http://localhost:4000/api'

  constructor() { }

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
                        reportes: [],
                    } as ReporteAgrupado;
                }


                // Calcular los puntos totales y el precio total de cada reporte
                const puntosReporte = reporte.productos.reduce(
                    (suma, prod) => suma + prod.producto.puntos * prod.cantidad,
                    0
                );

                const precioReporte = reporte.productos.reduce(
                    (suma, prod) => suma + prod.producto.precio * prod.cantidad,
                    0
                );

                // Acumulamos los puntos y el total gastado para la promotora
                result[promotoraId].puntosAcumulados += puntosReporte;
                result[promotoraId].totalGastado += precioReporte;

                // Agregar el reporte a la lista de reportes de la promotora
                result[promotoraId].reportes.push({
                    cliente: reporte.cliente.cliente,
                    tipo: reporte.tipo,
                    observacion: reporte.observacion,
                    productos: reporte.productos.map((prod) => ({
                        producto: prod.producto.producto,
                        linea: prod.producto.linea,
                        marca: prod.producto.marca,
                        cantidad: prod.cantidad,
                        subtotal: prod.producto.precio * prod.cantidad,
                        puntosTotales: prod.producto.puntos * prod.cantidad
                    })),
                    fecha: reporte.createdAt,
                    totalPuntos: puntosReporte, // Agregar total de puntos por reporte
                    totalSubtotal: precioReporte, // Agregar total de gastos por reporte
                });

                return result;
            }, {} as Record<string, ReporteAgrupado>);

            // Convertir el objeto de reportes agrupados en un arreglo para devolverlo
            return Object.values(agrupados);
        })
    );
}



  NuevoReporte(data:reportes){

  
    // Enviar la solicitud al servidor
    this.http.post<reportes>(`${this.ruta}/reportes`, data).subscribe((res) => {
      // Actualizar el estado agregando el nuevo producto
      this.cargarReportes()
    });
  }


}
