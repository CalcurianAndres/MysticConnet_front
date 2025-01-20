import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReportesResponseService } from '@services/reportes-response.service';
import { TitleComponent } from '@shared/title/title.component';

@Component({
  selector: 'app-detalle',
  imports: [TitleComponent, CommonModule, RouterModule],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss'
})
export default class DetalleComponent {

  public reporte = inject(ReportesResponseService)

  public loading = true;
  public _reporte: any = []

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      let id = params.get('id');
      this.reporte.BuscarPorID(id).subscribe(
        (response) => {
          this._reporte = response;
          console.log(this._reporte)
          this.loading = false;
        }
      )

    });
  }

}
