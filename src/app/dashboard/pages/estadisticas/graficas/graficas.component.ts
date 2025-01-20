import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import EstadisticasComponent from '../estadisticas.component';
import { TitleComponent } from '@shared/title/title.component';
import Chart, { ChartType } from 'chart.js/auto';
import { LoadingsComponent } from '@shared/loadings/loadings.component';
import { ReporteAgrupado } from '@interfaces/req-respons';
import { ReportesResponseService } from '@services/reportes-response.service';
import { UserResponseService } from '@services/user-response.service';
import { PlanificacionService } from '@services/planificacion.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-graficas',
  imports: [FormsModule, CommonModule, LoadingsComponent],
  templateUrl: './graficas.component.html',
  styleUrl: './graficas.component.scss'
})
export default class GraficasComponent {

  public marcas_chart!: Chart;
  public lineas_chart!: Chart;
  public vendedoras_chart!: Chart;
  public vendedoras_qerametik!: Chart;
  public top3_chart!: Chart;
  public top3_chart_Qerametik!: Chart;

  public Reportes!: ReporteAgrupado[];

  public ServiceReportes = inject(ReportesResponseService)
  public promotoras = inject(UserResponseService);
  public planificacionService = inject(PlanificacionService);

  indexPlanificacion: number = 0

  public vendedoras!: any;
  public vendedoras_qeral!: any;
  public marcas!: any;
  public lineas!: any;
  public top3!: any;
  public top3_Qera!: any;
  public Cargado: boolean = false;
  public fijas: boolean = true;
  public Top3PromotorasMystic!: any;
  public Top3PromotorasQerametik!: any;
  public topProductos!: any;

  public ProductoMasVendidoPorMarca: any = {
    Mystic: '',
    Qerametik: ''
  }

  constructor() {
    setTimeout(() => {
      if (!this.planificacionService.loading()) {
        this.indexPlanificacion = this.planificacionService.planificacion().length - 1;
        this.recargarInfo();
      }
    }, 500);
  }


  cambiarPlanificacion() {
    this.marcas_chart.destroy();
    this.vendedoras_chart.destroy();
    this.vendedoras_qerametik.destroy();
    this.lineas_chart.destroy();
    this.top3_chart.destroy();
    this.top3_chart_Qerametik.destroy();
    this.recargarInfo();
  }

  simplificar(date: string) {
    return date.split('T')[0]
  }

  FijasPorDestajo() {
    this.fijas = !this.fijas;
    this.cambiarPlanificacion();
  }

  recargarInfo() {
    setTimeout(() => {
      if (!this.planificacionService.loading()) {
        this.Cargado = true;
        console.log(this.fijas)
        const canvasVendedoras = document.getElementById('vendedoras') as HTMLCanvasElement;
        const canvasVendedorasQerametik = document.getElementById('vendedoras_Qerametik') as HTMLCanvasElement;
        const canvasMarcas = document.getElementById('marcas') as HTMLCanvasElement;
        const canvasLineas = document.getElementById('lineas') as HTMLCanvasElement;
        const canvasTop3 = document.getElementById('top3') as HTMLCanvasElement;
        const canvasTop3Qera = document.getElementById('top3_Qerametik') as HTMLCanvasElement;

        this.ServiceReportes.getReportesAgrupados(this.fijas, this.planificacionService.planificacion()[this.indexPlanificacion].inicio, this.planificacionService.planificacion()[this.indexPlanificacion].cierre).subscribe(res => {
          this.Reportes = res;
          console.log(res)

          const labels: string[] = [];
          const data: number[] = [];
          const labels_Mystic: string[] = [];
          const data_Mystic: number[] = [];

          this.promotoras.users()
            .filter(promotora => promotora.fija === this.fijas && promotora.marca === 'Qerametik') // Filtrar solo donde fija = true
            .forEach((promotora) => {
              labels.push(`${promotora.nombre} ${promotora.apellido}`);
              data.push(this.getPuntos(promotora.nombre, promotora.apellido)); // Cambiar por puntosAcumulados si es necesario
            });

          this.promotoras.users()
            .filter(promotora => promotora.fija === this.fijas && promotora.marca === 'Mystic') // Filtrar solo donde fija = true
            .forEach((promotora) => {
              labels_Mystic.push(`${promotora.nombre} ${promotora.apellido}`);
              data_Mystic.push(this.getPuntos(promotora.nombre, promotora.apellido)); // Cambiar por puntosAcumulados si es necesario
            });

          this.vendedoras_qeral = {
            labels: labels,
            datasets: [{
              label: 'Ventas por vendedora',
              data: data,
              backgroundColor: [
                'rgba(255, 99, 132, 1)', // Color 1
                'rgba(54, 162, 235, 1)', // Color 2
                'rgba(255, 206, 86, 1)', // Color 3
                'rgba(75, 192, 192, 1)', // Color 4
                'rgba(153, 102, 255, 1)', // Color 5
                'rgba(255, 159, 64, 1)', // Color 6
                'rgba(231, 76, 60, 1)',  // Color 7
                'rgba(46, 204, 113, 1)', // Color 8
                'rgba(52, 152, 219, 1)', // Color 9
                'rgba(241, 196, 15, 1)', // Color 10
                'rgba(155, 89, 182, 1)', // Color 11
                'rgba(41, 128, 185, 1)', // Color 12
                'rgba(52, 152, 219, 1)', // Color 13
                'rgba(22, 160, 133, 1)', // Color 14
                'rgba(230, 126, 34, 1)', // Color 15
                'rgba(211, 84, 0, 1)', // Color 16
                'rgba(149, 165, 166, 1)', // Color 17
                'rgba(236, 240, 241, 1)', // Color 18
                'rgba(46, 204, 113, 1)', // Color 19
                'rgba(41, 128, 185, 1)', // Color 20
                'rgba(238, 112, 82, 1)', // Color 21
                'rgba(43, 206, 72, 1)', // Color 22
                'rgba(255, 127, 80, 1)', // Color 23
                'rgba(70, 130, 180, 1)', // Color 24
                'rgba(238, 130, 238, 1)', // Color 25
                'rgba(255, 105, 180, 1)', // Color 26
                'rgba(153, 50, 204, 1)', // Color 27
                'rgba(34, 193, 195, 1)', // Color 28
                'rgba(253, 187, 45, 1)', // Color 29
                'rgba(255, 218, 185, 1)', // Color 30
                'rgba(127, 255, 212, 1)', // Color 31
                'rgba(186, 85, 211, 1)', // Color 32
                'rgba(255, 140, 105, 1)', // Color 33
                'rgba(255, 165, 0, 1)', // Color 34
                'rgba(255, 99, 71, 1)', // Color 35
                'rgba(255, 0, 255, 1)', // Color 36
                'rgba(0, 255, 255, 1)', // Color 37
                'rgba(173, 216, 230, 1)', // Color 38
                'rgba(0, 128, 0, 1)', // Color 39
                'rgba(255, 192, 203, 1)', // Color 40
                'rgba(0, 255, 127, 1)', // Color 41
                'rgba(0, 0, 255, 1)', // Color 42
                'rgba(100, 149, 237, 1)', // Color 43
                'rgba(255, 99, 132, 1)', // Color 44
                'rgba(0, 255, 0, 1)', // Color 45
                'rgba(255, 140, 0, 1)', // Color 46
                'rgba(255, 105, 180, 1)', // Color 47
                'rgba(255, 69, 0, 1)', // Color 48
                'rgba(255, 228, 181, 1)', // Color 49
                'rgba(220, 20, 60, 1)', // Color 50
                'rgba(255, 0, 0, 1)', // Color 51
                'rgba(0, 191, 255, 1)', // Color 52
                'rgba(255, 140, 255, 1)', // Color 53
                'rgba(255, 20, 147, 1)', // Color 54
                'rgba(127, 255, 0, 1)', // Color 55
                'rgba(255, 99, 132, 1)', // Color 56
                'rgba(75, 0, 130, 1)', // Color 57
                'rgba(50, 205, 50, 1)', // Color 58
                'rgba(248, 248, 255, 1)', // Color 59
                'rgba(255, 228, 196, 1)', // Color 60
                'rgba(240, 128, 128, 1)', // Color 61
                'rgba(0, 250, 154, 1)', // Color 62
                'rgba(255, 99, 71, 1)', // Color 63
                'rgba(176, 224, 230, 1)', // Color 64
                'rgba(245, 222, 179, 1)', // Color 65
                'rgba(255, 182, 193, 1)', // Color 66
                'rgba(135, 206, 235, 1)', // Color 67
                'rgba(255, 160, 122, 1)', // Color 68
                'rgba(255, 105, 180, 1)', // Color 69
                'rgba(255, 127, 80, 1)'  // Color 70
              ],
              borderColor: [
                'rgb(255, 99, 132)',    // Color 1
                'rgb(54, 162, 235)',    // Color 2
                'rgb(255, 206, 86)',    // Color 3
                'rgb(75, 192, 192)',    // Color 4
                'rgb(153, 102, 255)',   // Color 5
                'rgb(255, 159, 64)',    // Color 6
                'rgb(231, 76, 60)',     // Color 7
                'rgb(46, 204, 113)',    // Color 8
                'rgb(52, 152, 219)',    // Color 9
                'rgb(241, 196, 15)',    // Color 10
                'rgb(155, 89, 182)',    // Color 11
                'rgb(41, 128, 185)',    // Color 12
                'rgb(52, 152, 219)',    // Color 13
                'rgb(22, 160, 133)',    // Color 14
                'rgb(230, 126, 34)',    // Color 15
                'rgb(211, 84, 0)',      // Color 16
                'rgb(149, 165, 166)',   // Color 17
                'rgb(236, 240, 241)',   // Color 18
                'rgb(46, 204, 113)',    // Color 19
                'rgb(41, 128, 185)',    // Color 20
                'rgb(238, 112, 82)',    // Color 21
                'rgb(43, 206, 72)',     // Color 22
                'rgb(255, 127, 80)',    // Color 23
                'rgb(70, 130, 180)',    // Color 24
                'rgb(238, 130, 238)',   // Color 25
                'rgb(255, 105, 180)',   // Color 26
                'rgb(153, 50, 204)',    // Color 27
                'rgb(34, 193, 195)',    // Color 28
                'rgb(253, 187, 45)',    // Color 29
                'rgb(255, 218, 185)',   // Color 30
                'rgb(127, 255, 212)',   // Color 31
                'rgb(186, 85, 211)',    // Color 32
                'rgb(255, 140, 105)',   // Color 33
                'rgb(255, 165, 0)',     // Color 34
                'rgb(255, 99, 71)',     // Color 35
                'rgb(255, 0, 255)',     // Color 36
                'rgb(0, 255, 255)',     // Color 37
                'rgb(173, 216, 230)',   // Color 38
                'rgb(0, 128, 0)',       // Color 39
                'rgb(255, 192, 203)',   // Color 40
                'rgb(0, 255, 127)',     // Color 41
                'rgb(0, 0, 255)',       // Color 42
                'rgb(100, 149, 237)',   // Color 43
                'rgb(255, 99, 132)',    // Color 44
                'rgb(0, 255, 0)',       // Color 45
                'rgb(255, 140, 0)',     // Color 46
                'rgb(255, 105, 180)',   // Color 47
                'rgb(255, 69, 0)',      // Color 48
                'rgb(255, 228, 181)',   // Color 49
                'rgb(220, 20, 60)',     // Color 50
                'rgb(255, 0, 0)',       // Color 51
                'rgb(0, 191, 255)',     // Color 52
                'rgb(255, 140, 255)',   // Color 53
                'rgb(255, 20, 147)',    // Color 54
                'rgb(127, 255, 0)',     // Color 55
                'rgb(255, 99, 132)',    // Color 56
                'rgb(75, 0, 130)',      // Color 57
                'rgb(50, 205, 50)',     // Color 58
                'rgb(248, 248, 255)',   // Color 59
                'rgb(255, 228, 196)',   // Color 60
                'rgb(240, 128, 128)',   // Color 61
                'rgb(0, 250, 154)',     // Color 62
                'rgb(255, 99, 71)',     // Color 63
                'rgb(176, 224, 230)',   // Color 64
                'rgb(245, 222, 179)',   // Color 65
                'rgb(255, 182, 193)',   // Color 66
                'rgb(135, 206, 235)',   // Color 67
                'rgb(255, 160, 122)',   // Color 68
                'rgb(255, 105, 180)',   // Color 69
                'rgb(255, 127, 80)'     // Color 70
              ],
              hoverOffset: 4
            }]
          };

          this.vendedoras = {
            labels: labels_Mystic,
            datasets: [{
              label: 'Ventas por vendedora',
              data: data_Mystic,
              backgroundColor: [
                'rgba(255, 99, 132, 1)', // Color 1
                'rgba(54, 162, 235, 1)', // Color 2
                'rgba(255, 206, 86, 1)', // Color 3
                'rgba(75, 192, 192, 1)', // Color 4
                'rgba(153, 102, 255, 1)', // Color 5
                'rgba(255, 159, 64, 1)', // Color 6
                'rgba(231, 76, 60, 1)',  // Color 7
                'rgba(46, 204, 113, 1)', // Color 8
                'rgba(52, 152, 219, 1)', // Color 9
                'rgba(241, 196, 15, 1)', // Color 10
                'rgba(155, 89, 182, 1)', // Color 11
                'rgba(41, 128, 185, 1)', // Color 12
                'rgba(52, 152, 219, 1)', // Color 13
                'rgba(22, 160, 133, 1)', // Color 14
                'rgba(230, 126, 34, 1)', // Color 15
                'rgba(211, 84, 0, 1)', // Color 16
                'rgba(149, 165, 166, 1)', // Color 17
                'rgba(236, 240, 241, 1)', // Color 18
                'rgba(46, 204, 113, 1)', // Color 19
                'rgba(41, 128, 185, 1)', // Color 20
                'rgba(238, 112, 82, 1)', // Color 21
                'rgba(43, 206, 72, 1)', // Color 22
                'rgba(255, 127, 80, 1)', // Color 23
                'rgba(70, 130, 180, 1)', // Color 24
                'rgba(238, 130, 238, 1)', // Color 25
                'rgba(255, 105, 180, 1)', // Color 26
                'rgba(153, 50, 204, 1)', // Color 27
                'rgba(34, 193, 195, 1)', // Color 28
                'rgba(253, 187, 45, 1)', // Color 29
                'rgba(255, 218, 185, 1)', // Color 30
                'rgba(127, 255, 212, 1)', // Color 31
                'rgba(186, 85, 211, 1)', // Color 32
                'rgba(255, 140, 105, 1)', // Color 33
                'rgba(255, 165, 0, 1)', // Color 34
                'rgba(255, 99, 71, 1)', // Color 35
                'rgba(255, 0, 255, 1)', // Color 36
                'rgba(0, 255, 255, 1)', // Color 37
                'rgba(173, 216, 230, 1)', // Color 38
                'rgba(0, 128, 0, 1)', // Color 39
                'rgba(255, 192, 203, 1)', // Color 40
                'rgba(0, 255, 127, 1)', // Color 41
                'rgba(0, 0, 255, 1)', // Color 42
                'rgba(100, 149, 237, 1)', // Color 43
                'rgba(255, 99, 132, 1)', // Color 44
                'rgba(0, 255, 0, 1)', // Color 45
                'rgba(255, 140, 0, 1)', // Color 46
                'rgba(255, 105, 180, 1)', // Color 47
                'rgba(255, 69, 0, 1)', // Color 48
                'rgba(255, 228, 181, 1)', // Color 49
                'rgba(220, 20, 60, 1)', // Color 50
                'rgba(255, 0, 0, 1)', // Color 51
                'rgba(0, 191, 255, 1)', // Color 52
                'rgba(255, 140, 255, 1)', // Color 53
                'rgba(255, 20, 147, 1)', // Color 54
                'rgba(127, 255, 0, 1)', // Color 55
                'rgba(255, 99, 132, 1)', // Color 56
                'rgba(75, 0, 130, 1)', // Color 57
                'rgba(50, 205, 50, 1)', // Color 58
                'rgba(248, 248, 255, 1)', // Color 59
                'rgba(255, 228, 196, 1)', // Color 60
                'rgba(240, 128, 128, 1)', // Color 61
                'rgba(0, 250, 154, 1)', // Color 62
                'rgba(255, 99, 71, 1)', // Color 63
                'rgba(176, 224, 230, 1)', // Color 64
                'rgba(245, 222, 179, 1)', // Color 65
                'rgba(255, 182, 193, 1)', // Color 66
                'rgba(135, 206, 235, 1)', // Color 67
                'rgba(255, 160, 122, 1)', // Color 68
                'rgba(255, 105, 180, 1)', // Color 69
                'rgba(255, 127, 80, 1)'  // Color 70
              ],
              borderColor: [
                'rgb(255, 99, 132)',    // Color 1
                'rgb(54, 162, 235)',    // Color 2
                'rgb(255, 206, 86)',    // Color 3
                'rgb(75, 192, 192)',    // Color 4
                'rgb(153, 102, 255)',   // Color 5
                'rgb(255, 159, 64)',    // Color 6
                'rgb(231, 76, 60)',     // Color 7
                'rgb(46, 204, 113)',    // Color 8
                'rgb(52, 152, 219)',    // Color 9
                'rgb(241, 196, 15)',    // Color 10
                'rgb(155, 89, 182)',    // Color 11
                'rgb(41, 128, 185)',    // Color 12
                'rgb(52, 152, 219)',    // Color 13
                'rgb(22, 160, 133)',    // Color 14
                'rgb(230, 126, 34)',    // Color 15
                'rgb(211, 84, 0)',      // Color 16
                'rgb(149, 165, 166)',   // Color 17
                'rgb(236, 240, 241)',   // Color 18
                'rgb(46, 204, 113)',    // Color 19
                'rgb(41, 128, 185)',    // Color 20
                'rgb(238, 112, 82)',    // Color 21
                'rgb(43, 206, 72)',     // Color 22
                'rgb(255, 127, 80)',    // Color 23
                'rgb(70, 130, 180)',    // Color 24
                'rgb(238, 130, 238)',   // Color 25
                'rgb(255, 105, 180)',   // Color 26
                'rgb(153, 50, 204)',    // Color 27
                'rgb(34, 193, 195)',    // Color 28
                'rgb(253, 187, 45)',    // Color 29
                'rgb(255, 218, 185)',   // Color 30
                'rgb(127, 255, 212)',   // Color 31
                'rgb(186, 85, 211)',    // Color 32
                'rgb(255, 140, 105)',   // Color 33
                'rgb(255, 165, 0)',     // Color 34
                'rgb(255, 99, 71)',     // Color 35
                'rgb(255, 0, 255)',     // Color 36
                'rgb(0, 255, 255)',     // Color 37
                'rgb(173, 216, 230)',   // Color 38
                'rgb(0, 128, 0)',       // Color 39
                'rgb(255, 192, 203)',   // Color 40
                'rgb(0, 255, 127)',     // Color 41
                'rgb(0, 0, 255)',       // Color 42
                'rgb(100, 149, 237)',   // Color 43
                'rgb(255, 99, 132)',    // Color 44
                'rgb(0, 255, 0)',       // Color 45
                'rgb(255, 140, 0)',     // Color 46
                'rgb(255, 105, 180)',   // Color 47
                'rgb(255, 69, 0)',      // Color 48
                'rgb(255, 228, 181)',   // Color 49
                'rgb(220, 20, 60)',     // Color 50
                'rgb(255, 0, 0)',       // Color 51
                'rgb(0, 191, 255)',     // Color 52
                'rgb(255, 140, 255)',   // Color 53
                'rgb(255, 20, 147)',    // Color 54
                'rgb(127, 255, 0)',     // Color 55
                'rgb(255, 99, 132)',    // Color 56
                'rgb(75, 0, 130)',      // Color 57
                'rgb(50, 205, 50)',     // Color 58
                'rgb(248, 248, 255)',   // Color 59
                'rgb(255, 228, 196)',   // Color 60
                'rgb(240, 128, 128)',   // Color 61
                'rgb(0, 250, 154)',     // Color 62
                'rgb(255, 99, 71)',     // Color 63
                'rgb(176, 224, 230)',   // Color 64
                'rgb(245, 222, 179)',   // Color 65
                'rgb(255, 182, 193)',   // Color 66
                'rgb(135, 206, 235)',   // Color 67
                'rgb(255, 160, 122)',   // Color 68
                'rgb(255, 105, 180)',   // Color 69
                'rgb(255, 127, 80)'     // Color 70
              ],
              hoverOffset: 4
            }]
          };

          this.vendedoras_chart = new Chart(canvasVendedoras, {
            type: 'bar',  // o 'line', dependiendo del tipo de gráfico
            data: this.vendedoras,
          });

          this.vendedoras_qerametik = new Chart(canvasVendedorasQerametik, {
            type: 'bar',
            data: this.vendedoras_qeral
          })


          this.ServiceReportes.cargarReportes_(this.planificacionService.planificacion()[this.indexPlanificacion].inicio, this.planificacionService.planificacion()[this.indexPlanificacion].cierre)
            .subscribe(res => {
              let reportes_ = res;

              let cantidadMystic = 0;
              let cantidadQerametik = 0;
              let cantidadTradicional = 0;
              let cantidadRebranding = 0;

              // Objeto para acumular las ventas por promotora
              const ventasPorPromotora: { [promotoraId: string]: number } = {};

              // Objetos para acumular las ventas de productos por marca
              const ventasPorProductoMystic: { [productoId: string]: { nombre: string, cantidad: number, linea: string } } = {};
              const ventasPorProductoQerametik: { [productoId: string]: { nombre: string, cantidad: number, linea: string } } = {};

              // Objeto para acumular ventas por promotora y marca
              const ventasPorPromotoraPorMarca: {
                [promotoraId: string]: {
                  Mystic: number;
                  Qerametik: number;
                };
              } = {};

              // Recorrer todos los reportes y productos para contar las cantidades
              reportes_.forEach((reporte) => {
                const promotoraId = `${reporte.promotora.nombre} ${reporte.promotora.apellido}`; // Nombre completo de la promotora

                // Asegurarse de que la promotora tenga un registro inicial en el objeto
                if (!ventasPorPromotoraPorMarca[promotoraId]) {
                  ventasPorPromotoraPorMarca[promotoraId] = {
                    Mystic: 0,
                    Qerametik: 0,
                  };
                }

                // Iterar sobre los productos de cada reporte
                if (reporte.promotora.marca === 'Mystic') {
                  reporte.productos.forEach((item: any) => {
                    if (item.producto.marca === 'Mystic') {
                      ventasPorPromotoraPorMarca[promotoraId].Mystic += item.cantidad * item.producto.puntos;
                    }
                  });
                } else if (reporte.promotora.marca === 'Qerametik') {
                  reporte.productos.forEach((item: any) => {
                    if (item.producto.marca === 'Qerametik') {
                      ventasPorPromotoraPorMarca[promotoraId].Qerametik += item.cantidad * item.producto.puntos;
                    }
                  });
                }

                // Calcular el top 3 de promotoras por Mystic
                const top3PromotorasMystic = Object.entries(ventasPorPromotoraPorMarca)
                  .map(([promotoraId, marcas]) => ({
                    promotoraId,
                    cantidadMystic: marcas.Mystic,
                  }))
                  .sort((a, b) => b.cantidadMystic - a.cantidadMystic) // Ordenar por Mystic
                  .slice(0, 3); // Obtener las 3 principales

                // Calcular el top 3 de promotoras por Qerametik
                const top3PromotorasQerametik = Object.entries(ventasPorPromotoraPorMarca)
                  .map(([promotoraId, marcas]) => ({
                    promotoraId,
                    cantidadQerametik: marcas.Qerametik,
                  }))
                  .sort((a, b) => b.cantidadQerametik - a.cantidadQerametik) // Ordenar por Qerametik
                  .slice(0, 3); // Obtener las 3 principales

                // Asignar los resultados a variables para la vista
                this.Top3PromotorasMystic = top3PromotorasMystic;
                this.Top3PromotorasQerametik = top3PromotorasQerametik;

                // Iterar sobre los productos de cada reporte
                reporte.productos.forEach((item: any) => {
                  // Contar la cantidad por marca
                  if (item.producto.marca === 'Mystic') {
                    cantidadMystic += item.cantidad;
                    // Acumular ventas por producto de Mystic
                    if (ventasPorProductoMystic[item.producto._id]) {
                      ventasPorProductoMystic[item.producto._id].cantidad += item.cantidad;
                    } else {
                      ventasPorProductoMystic[item.producto._id] = { nombre: item.producto.producto, cantidad: item.cantidad, linea: item.producto.linea };
                    }
                  } else if (item.producto.marca === 'Qerametik') {
                    cantidadQerametik += item.cantidad;
                    // Acumular ventas por producto de Qerametik
                    if (ventasPorProductoQerametik[item.producto._id]) {
                      ventasPorProductoQerametik[item.producto._id].cantidad += item.cantidad;
                    } else {
                      ventasPorProductoQerametik[item.producto._id] = { nombre: item.producto.producto, cantidad: item.cantidad, linea: item.producto.linea };
                    }
                  }
                  // Contar la cantidad por línea
                  if (item.producto.linea === 'Tradicional') {
                    cantidadTradicional += item.cantidad;
                  } else if (item.producto.linea === 'Rebranding') {
                    cantidadRebranding += item.cantidad;
                  }

                  // Acumular ventas por promotora
                  const promotoraId = `${reporte.promotora.nombre} ${reporte.promotora.apellido}`; // Nombre completo de la promotora
                  if (ventasPorPromotora[promotoraId]) {
                    ventasPorPromotora[promotoraId] += item.cantidad;
                  } else {
                    ventasPorPromotora[promotoraId] = item.cantidad;
                  }

                })
              })


              // Ordenar los productos más vendidos por Mystic y obtener el top 3
              const top3ProductosMystic = Object.entries(ventasPorProductoMystic)
                .map(([productoId, datos]) => ({
                  productoId,
                  linea: datos.linea,
                  nombre: datos.nombre,
                  cantidad: datos.cantidad,
                }))
                .sort((a, b) => b.cantidad - a.cantidad) // Ordenar por cantidad de mayor a menor
                .slice(0, 3); // Obtener los 3 principales

              // Ordenar los productos más vendidos por Qerametik y obtener el top 3
              const top3ProductosQerametik = Object.entries(ventasPorProductoQerametik)
                .map(([productoId, datos]) => ({
                  productoId,
                  linea: datos.linea,
                  nombre: datos.nombre,
                  cantidad: datos.cantidad,
                }))
                .sort((a, b) => b.cantidad - a.cantidad) // Ordenar por cantidad de mayor a menor
                .slice(0, 3); // Obtener los 3 principales

              // Asignar los resultados a variables para la vista
              this.topProductos = {
                Mystic: top3ProductosMystic,
                Qerametik: top3ProductosQerametik,
              }

              // Ordenar las promotoras por el total de ventas (de mayor a menor)
              const top3Promotoras = Object.entries(ventasPorPromotora)
                .map(([promotoraId, totalVentas]) => ({ promotoraId, totalVentas }))
                .sort((a, b) => b.totalVentas - a.totalVentas) // Ordenar de mayor a menor
                .slice(0, 3) // Obtener las 3 principales
                .map((promotora) => ({
                  nombre: promotora.promotoraId, // Nombre completo de la promotora
                  totalVentas: promotora.totalVentas
                }));

              this.marcas = {
                labels: [
                  'Mystic',
                  'Qerametik',
                ],
                datasets: [{
                  label: 'Marca mas vendida',
                  data: [cantidadMystic, cantidadQerametik],
                  backgroundColor: [
                    '#001a72',
                    '#6bcaba',
                  ],
                  borderColor: [
                    '#fe5000',
                    '#c99700',
                  ],
                  hoverOffset: 4
                }]
              };



              this.marcas_chart = new Chart(canvasMarcas, {
                type: 'doughnut',
                data: this.marcas
              });

              this.lineas = {
                labels: [
                  'Tradicional',
                  'Rebranding',
                ],
                datasets: [{
                  label: 'Marca mas vendida',
                  data: [cantidadTradicional, cantidadRebranding],
                  backgroundColor: [
                    '#001a72',
                    '#6bcaba',
                  ],
                  borderColor: [
                    '#fe5000',
                    '#c99700',
                  ],
                  hoverOffset: 4
                }]
              };

              this.lineas_chart = new Chart(canvasLineas, {
                type: 'doughnut',
                data: this.lineas
              });

              // Suponiendo que contarTotalesPorMarcaYLinea devuelve un objeto con top3Promotoras
              const top3Data = this.Top3PromotorasMystic;
              const top3Qera = this.Top3PromotorasQerametik;

              // Extraemos los nombres y las ventas totales de las promotoras
              const labels_ = top3Data.map((promotora: any) => promotora.promotoraId);
              const data_ = top3Data.map((promotora: any) => promotora.cantidadMystic);

              // Extraemos los nombres y las ventas totales de las promotoras
              const _labels_ = top3Qera.map((promotora: any) => promotora.promotoraId);
              const _data_ = top3Qera.map((promotora: any) => promotora.cantidadQerametik);

              // Asignamos los valores a this.top3
              this.top3 = {
                labels: labels_,
                datasets: [{
                  axis: 'y',
                  label: 'Ventas realizadas',
                  data: data_,
                  fill: false,
                  backgroundColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 205, 86, 1)',
                  ],
                  borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                  ],
                  borderWidth: 1
                }]
              };

              // Asignamos los valores a this.top3
              this.top3_Qera = {
                labels: _labels_,
                datasets: [{
                  axis: 'y',
                  label: 'Ventas realizadas',
                  data: _data_,
                  fill: false,
                  backgroundColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 205, 86, 1)',
                  ],
                  borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                  ],
                  borderWidth: 1
                }]
              };

              this.top3_chart = new Chart(canvasTop3, {
                type: 'bar',
                data: this.top3,
                options: {
                  indexAxis: 'y',
                }
              });

              this.top3_chart_Qerametik = new Chart(canvasTop3Qera, {
                type: 'bar',
                data: this.top3_Qera,
                options: {
                  indexAxis: 'y',
                }
              })


              // FINAL
            });


        });

      }

    }, 1000);
  }

  getPuntos(nombre: string, apellido: string): number {
    const reporte = this.Reportes.find(r => r.promotora === `${nombre} ${apellido}`);
    return reporte ? reporte.puntosAcumulados : 0;
  }


}
