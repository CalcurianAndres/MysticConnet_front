import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
  public _reportes: any = []
  public indexPlanificacion = 0;
  public loading = true;

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
            this._reportes = response.filter((r: any) => r.cliente.cliente === this.cliente)
            this.loading = false
          })
      }
    }, 500)
  }

  sumarPorductos(reporte: any) {
    return reporte.productos.reduce((suma: any, producto: any) => suma + producto.cantidad, 0);
  }




}
