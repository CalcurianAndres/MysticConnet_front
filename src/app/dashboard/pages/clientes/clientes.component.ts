import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { reportesResponse } from '@interfaces/req-respons';
import { PlanificacionService } from '@services/planificacion.service';
import { ReportesResponseService } from '@services/reportes-response.service';
import { TitleComponent } from '@shared/title/title.component';

@Component({
  selector: 'app-clientes',
  imports: [TitleComponent, FormsModule, CommonModule, RouterModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export default class ClientesComponent {

  public planificacion = inject(PlanificacionService);
  public reportes = inject(ReportesResponseService)

  public cliente: any = ''
  public _reportes: reportesResponse[] = []
  public indexPlanificacion = 0;
  public loading = true;

  public promedios: any[] = [];
  public registrosRelleno: any[] = [];

  public almacen: boolean = false
  public detalles: boolean = false
  public Historial: any = []

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      this.cliente = params.get('id');
      setTimeout(() => {
        this.indexPlanificacion = this.planificacion.planificacion().length - 1;
        this.RefreshPage();
      }, 1000);
    });
  }

  cambiar() {
    this.RefreshPage();
  }

  RefreshPage() {
    setTimeout(() => {
      if (!this.planificacion.loading()) {
        let lastReporte = this.planificacion.planificacion()[this.indexPlanificacion];
        this.reportes.cargarReportes_(lastReporte.inicio, lastReporte.cierre).subscribe(
          (response) => {
            this._reportes = response.filter((r: any) => r.cliente.cliente === this.cliente);

            let promediosFinal: { [producto: string]: { total: number; count: number, marca: string } } = {};

            this._reportes.forEach((reporte: any, index: number) => {
              reporte.productos.forEach((producto: any) => {
                if (!promediosFinal[producto.producto.producto]) {
                  promediosFinal[producto.producto.producto] = { total: 0, count: 0, marca: '' };
                }

                promediosFinal[producto.producto.producto].total += producto.final;
                promediosFinal[producto.producto.producto].count++;
                promediosFinal[producto.producto.producto].marca = producto.producto.marca;

                if (index > 0) {
                  const reporteAnterior = this._reportes[index - 1];
                  const productoAnterior = reporteAnterior.productos.find((p: any) => p.producto.producto === producto.producto.producto);

                  if (productoAnterior && producto.inicio > productoAnterior.final) {
                    const diferencia = producto.inicio - productoAnterior.final;
                    this.registrosRelleno.push({
                      producto: producto.producto.producto,
                      fecha: reporte.fecha,
                      relleno: diferencia
                    });
                  }
                }
              });
            });

            this.promedios = Object.keys(promediosFinal).map(producto => ({
              producto,
              marca: promediosFinal[producto].marca,
              promedioFinal: promediosFinal[producto].total / promediosFinal[producto].count
            }));

            this.loading = false;
          }
        );
      }
    }, 500)
  }

  sumarPorductos(reporte: any) {
    return reporte.productos.reduce((suma: any, producto: any) => suma + producto.cantidad, 0);
  }

  FiltrarPorMarca(marca: string) {
    return this.promedios.filter((r: any) => r.marca === marca).sort((a: any, b: any) => b.promedioFinal - a.promedioFinal);
  }

  getReposiciones(producto: string) {
    return this.registrosRelleno.filter((r: any) => r.producto === producto);
  }

  verDetalles(producto: any) {
    this.detalles = true;
    this.Historial = this.getReposiciones(producto);
  }




}
