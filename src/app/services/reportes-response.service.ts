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
  public ruta = 'https://mysticconnectserver-production.up.railway.app/api'
  // public ruta = 'http://localhost:8080/api'

  constructor() {
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

  BuscarPorID(id: any) {
    return this.http.get(`${this.ruta}/reportes/${id}`)
  }

  getReportesAgrupados_(tipoPromotora: boolean, inicio: string, fin: string): Observable<ReporteAgrupado[]> {
    return this.http.get<reportesResponse[]>(`${this.ruta}/reportes?inicio=${inicio}&fin=${fin}`).pipe(
      map((reportes) => {
        const agrupados = reportes.reduce((result, reporte) => {
          const promotoraId = reporte.promotora?._id;

          if (!promotoraId) {
            // console.warn('Reporte sin promotora válida:', reporte);
            return result;
          }

          // Filtrar por tipo de promotora
          if (reporte.promotora.fija !== tipoPromotora) {
            // console.warn('reportes que no coincidan con el tipoPromotora:', reporte);
            return result; // Ignorar reportes que no coincidan con el tipoPromotora
          }

          if (!result[promotoraId]) {
            result[promotoraId] = {
              promotora: `${reporte.promotora.nombre} ${reporte.promotora.apellido}`,
              marca: reporte.promotora.marca,
              sueldo: reporte.promotora.sueldo,
              region: reporte.promotora.region,
              porcentajeRebranding: 0,
              puntosAcumulados: 0,
              totalGastado: 0,
              productosVendidos: 0,
              conteoMetaUnidades: 0,
              conteoMetaUnidadesQ: 0,
              productosMystic: 0,
              productosQerametik: 0,
              puntosMystic: 0,
              puntosQerametik: 0,
              totalImpulsos: 0, // Inicializamos el contador de impulsos
              totalEventos: 0, // Inicializamos el contador de eventos
              totalImpulsos_qerametik: 0, // Inicializamos el contador de impulsos
              totalEventos_qerametik: 0, // Inicializamos el contador de eventos
              dias_impulto_mystic: 0,
              dias_evento_mystic: 0,
              dias_impulso_qerametik: 0,
              dias_evento_qerametik: 0,
              gastosPorMarca: { Mystic: 0, Qerametik: 0 },
              reportes: [],
            } as ReporteAgrupado;
          }

          // Acumular gastos por marca
          reporte.productos.forEach((prod) => {
            const marca = prod.producto.marca;
            if (!result[promotoraId].gastosPorMarca[marca]) {
              result[promotoraId].gastosPorMarca[marca] = 0;
            }
            result[promotoraId].gastosPorMarca[marca] += prod.producto.precio * prod.cantidad;
          });

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

          // Calcular conteoMetaUnidades
          const metaUnidades = reporte.productos.reduce(
            (conteo, prod) => conteo + (prod.cantidad >= 10 ? 1 : 0), // Por ejemplo, contar productos con cantidad >= 10
            0
          );

          let tradicional_Mystic = 0;
          let Rebrandig = 0;

          reporte.productos.forEach((prod) => {
            if (prod.producto.marca === 'Mystic') {
              result[promotoraId].productosMystic += prod.cantidad;
              result[promotoraId].puntosMystic += prod.producto.puntos * prod.cantidad;
              if (reporte.tipo === 'Impulso') {
                result[promotoraId].totalImpulsos += prod.cantidad;
              } else if (reporte.tipo === 'Evento') {
                result[promotoraId].totalEventos += prod.cantidad;
              }
              // Calcular porcentaje de rebranding
              if (prod.producto.linea === 'Rebranding') {
                result[promotoraId].porcentajeRebranding += prod.cantidad;
              }

            } else if (prod.producto.marca === 'Qerametik') {
              result[promotoraId].productosQerametik += prod.cantidad;
              result[promotoraId].puntosQerametik += prod.producto.puntos * prod.cantidad;
              if (reporte.tipo === 'Impulso') {
                result[promotoraId].totalImpulsos_qerametik += prod.cantidad;
              } else if (reporte.tipo === 'Evento') {
                result[promotoraId].totalEventos_qerametik += prod.cantidad;
              }
            }
          });

          // Calcular porcentaje de rebranding
          // result[promotoraId].porcentajeRebranding = (result[promotoraId].porcentajeRebranding / result[promotoraId].productosMystic) * 100;



          // Verificar si la promotora alcanzó la meta de 30 unidades en este reporte
          if (reporte.productos[0]) {

            if (reporte.promotora.fija === true) {
              if (reporte.tipo === 'Impulso') {
                if (reporte.productos[0].producto.marca === 'Mystic') {
                  if (puntosReporte >= this.planificacionService.planificacion()[1].metas.tradicional.mystic.impulso) {
                    result[promotoraId].conteoMetaUnidades += 1;
                  }
                } else {
                  if (puntosReporte >= this.planificacionService.planificacion()[1].metas.tradicional.qerametik.impulso) {
                    result[promotoraId].conteoMetaUnidadesQ += 1;
                  }
                }
              } else {
                if (reporte.productos[0].producto.marca === 'Mystic') {
                  if (puntosReporte >= this.planificacionService.planificacion()[1].metas.tradicional.mystic.evento) {
                    result[promotoraId].conteoMetaUnidades += 1;
                  }
                } else {
                  if (puntosReporte >= this.planificacionService.planificacion()[1].metas.tradicional.qerametik.evento) {
                    result[promotoraId].conteoMetaUnidadesQ += 1;
                  }
                }
              }
            } else {
              if (reporte.tipo === 'Impulso') {
                if (reporte.productos[0].producto.marca === 'Mystic') {
                  if (puntosReporte >= this.planificacionService.planificacion()[1].metas.rebranding.mystic.impulso) {
                    result[promotoraId].conteoMetaUnidades += 1;
                  }
                } else {
                  if (puntosReporte >= this.planificacionService.planificacion()[1].metas.rebranding.qerametik.impulso) {
                    result[promotoraId].conteoMetaUnidadesQ += 1;
                  }
                }
              } else {
                if (reporte.productos[0].producto.marca === 'Mystic') {
                  if (puntosReporte >= this.planificacionService.planificacion()[1].metas.rebranding.mystic.evento) {
                    result[promotoraId].conteoMetaUnidades += 1;
                  }
                } else {
                  if (puntosReporte >= this.planificacionService.planificacion()[1].metas.rebranding.qerametik.evento) {
                    result[promotoraId].conteoMetaUnidadesQ += 1;
                  }
                }
              }
            }
          }

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
              puntos: prod.producto.puntos,
              linea: prod.producto.linea,
              marca: prod.producto.marca,
              cantidad: prod.cantidad,
              inicio: prod.inicio,
              final: prod.final,
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
    console.log(tipoPromotora)
    return this.http.get<reportesResponse[]>(`${this.ruta}/reportes?inicio=${inicio}&fin=${fin}`).pipe(
      map((reportes) => {
        const agrupados = reportes.reduce((result, reporte) => {
          const promotoraId = reporte.promotora?._id;

          if (!promotoraId) {
            // console.warn('Reporte sin promotora válida:', reporte);
            return result;
          }

          // Filtrar por tipo de promotora
          if (reporte.promotora.fija !== tipoPromotora) {
            // console.warn('reportes que no coincidan con el tipoPromotora:', reporte);
            return result; // Ignorar reportes que no coincidan con el tipoPromotora
          }

          if (!result[promotoraId]) {
            result[promotoraId] = {
              promotora: `${reporte.promotora.nombre} ${reporte.promotora.apellido}`,
              marca: reporte.promotora.marca,
              sueldo: reporte.promotora.sueldo,
              region: reporte.promotora.region,
              porcentajeRebranding: 0,
              puntosAcumulados: 0,
              totalGastado: 0,
              productosVendidos: 0,
              conteoMetaUnidades: 0,
              conteoMetaUnidadesQ: 0,
              productosMystic: 0,
              productosQerametik: 0,
              puntosMystic: 0,
              puntosQerametik: 0,
              totalImpulsos: 0, // Inicializamos el contador de impulsos
              totalEventos: 0, // Inicializamos el contador de eventos
              totalImpulsos_qerametik: 0, // Inicializamos el contador de impulsos
              totalEventos_qerametik: 0, // Inicializamos el contador de eventos
              dias_impulto_mystic: 0,
              dias_evento_mystic: 0,
              dias_impulso_qerametik: 0,
              dias_evento_qerametik: 0,
              gastosPorMarca: { Mystic: 0, Qerametik: 0 },
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

          let tradicional_Mystic = 0;
          let Rebrandig = 0;

          reporte.productos.forEach((prod) => {
            if (prod.producto.marca === 'Mystic') {
              result[promotoraId].productosMystic += prod.cantidad;
              result[promotoraId].puntosMystic += prod.producto.puntos * prod.cantidad;
              if (prod.producto.linea === 'Tradicional') {
                tradicional_Mystic += prod.cantidad;
              } else if (prod.producto.linea === 'Rebranding') {
                Rebrandig += prod.cantidad;
              }
            } else if (prod.producto.marca === 'Qerametik') {
              result[promotoraId].productosQerametik += prod.cantidad;
              result[promotoraId].puntosQerametik += prod.producto.puntos * prod.cantidad;
            }
          });


          result[promotoraId].puntosAcumulados += puntosReporte;
          result[promotoraId].totalGastado += precioReporte;
          result[promotoraId].productosVendidos += cantidadProductos;
          result[promotoraId].porcentajeRebranding = (Rebrandig / result[promotoraId].productosMystic) * 100;

          result[promotoraId].reportes.push({
            cliente: reporte.cliente.cliente,
            marca: reporte.cliente.marca,
            tipo: reporte.tipo,
            observacion: reporte.observacion,
            productos: reporte.productos.map((prod) => ({
              producto: prod.producto.producto,
              puntos: prod.producto.puntos,
              linea: prod.producto.linea,
              marca: prod.producto.marca,
              cantidad: prod.cantidad,
              inicio: prod.inicio,
              final: prod.final,
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
