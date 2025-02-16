import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { reportes, reportesResponse } from '@interfaces/req-respons';
import { LoginService } from '@services/login.service';
import { PlanificacionService } from '@services/planificacion.service';
import { ReportesResponseService } from '@services/reportes-response.service';
import { LoadingsComponent } from '@shared/loadings/loadings.component';
import { TitleComponent } from '@shared/title/title.component';
import Chart, { ChartType } from 'chart.js/auto';

@Component({
  selector: 'app-region',
  imports: [TitleComponent, FormsModule, LoadingsComponent, CommonModule, RouterModule],
  templateUrl: './region.component.html',
  styleUrl: './region.component.scss'
})
export default class RegionComponent {

  public login = inject(LoginService)
  public planificacionService = inject(PlanificacionService)
  public ReportesServices = inject(ReportesResponseService)
  public id: any = ''
  public indexPlanificacion = 0
  public reportesAgrupados: any = []
  public promotoras__: boolean = true;


  public marcas_chart!: Chart;
  public lineas_chart!: Chart;
  public tipos_chart!: Chart;
  public qerametik_chart!: Chart;
  public mystic_chart!: Chart;
  public marcas: any = []
  public lineas: any = []
  public tipos: any = []
  public Qerametik: any = []
  public Mystic: any = []

  public clientesArray!: any
  public productoArray!: any


  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      setTimeout(() => {
        this.indexPlanificacion = this.planificacionService.planificacion().length - 1
        this.BuscarReportes();
      }, 1000);
    });
  }


  cambiarPlanificacion() {
    this.marcas_chart.destroy();
    this.lineas_chart.destroy();
    this.tipos_chart.destroy();
    this.qerametik_chart.destroy();
    this.mystic_chart.destroy();
    this.BuscarReportes();
  }

  simplificar(date: string) {
    return date.split('T')[0]
  }

  BuscarReportes() {
    setTimeout(() => {
      if (!this.planificacionService.loading()) {
        // this.promotorasFilteredFunction({ value: this.promotoras__ })
        this.ReportesServices.cargarReportes_(this.planificacionService.planificacion()[this.indexPlanificacion].inicio, this.planificacionService.planificacion()[this.indexPlanificacion].cierre)
          .subscribe((resp: reportesResponse[]) => {

            const canvasMarcas = document.getElementById('marcas') as HTMLCanvasElement;
            const canvasLineas = document.getElementById('lineas') as HTMLCanvasElement;
            const canvasTipos = document.getElementById('tipos') as HTMLCanvasElement;
            const canvasQerametik = document.getElementById('qerametik') as HTMLCanvasElement;
            const canvasMystic = document.getElementById('mystic') as HTMLCanvasElement;

            let filtro = resp.filter((resp: any) => resp.promotora.region === this.id)
            let Productos_Mystic = 0;
            let Productos_Qerametik = 0;
            let tradicional_Mystic = 0
            let tradicional_Qerametik = 0
            let Rebrandig = 0
            let impulsos = 0
            let impulsos_productos = 0
            let eventos = 0
            let eventos_productos = 0

            // Objeto para almacenar las sumas de productos vendidos por cliente
            let productosPorCliente: any = {};
            let productosPorPromotora: any = {};
            let _Productos_Mystic: any = {};
            let _Productos_Qerametik: any = {};

            filtro.forEach((reporte) => {
              if (reporte.tipo === 'Impulso') {
                impulsos += 1;
              } else if (reporte.tipo === 'Evento') {
                eventos += 1;
              }



              reporte.productos.forEach((producto) => {

                const cliente = reporte.cliente.cliente;
                const promotora = `${reporte.promotora.nombre} ${reporte.promotora.apellido}`;
                const producto_ = producto.producto.producto;

                // Inicializamos la entrada del cliente si no existe
                if (!productosPorCliente[cliente]) {
                  productosPorCliente[cliente] = {
                    cliente,
                    cantidad: 0,
                    cantidad_mystic: 0,
                    cantidad_Qerametik: 0
                  };
                }

                // Sumar la cantidad al cliente correspondiente
                productosPorCliente[cliente].cantidad += producto.cantidad;

                if (!productosPorPromotora[promotora]) {
                  productosPorPromotora[promotora] = {
                    promotora,
                    id: reporte.promotora._id,
                    cantidad: 0,
                    cantidad_impulso: 0,
                    cantidad_evento: 0
                  }
                }

                productosPorPromotora[promotora].cantidad += producto.cantidad



                if (reporte.tipo === 'Impulso') {
                  impulsos_productos += producto.cantidad;
                  productosPorPromotora[promotora].cantidad_impulso += producto.cantidad
                } else if (reporte.tipo === 'Evento') {
                  eventos_productos += producto.cantidad;
                  productosPorPromotora[promotora].cantidad_evento += producto.cantidad
                }

                if (producto.producto.marca === 'Mystic') {
                  Productos_Mystic += producto.cantidad;
                  productosPorCliente[cliente].cantidad_mystic += producto.cantidad
                  if (!_Productos_Mystic[producto_]) {
                    _Productos_Mystic[producto_] = {
                      producto: producto_,
                      cantidad: 0
                    }
                  }
                  _Productos_Mystic[producto_].cantidad += producto.cantidad
                  if (producto.producto.linea === 'Rebranding') {
                    Rebrandig += producto.cantidad
                  } else {
                    tradicional_Mystic += producto.cantidad
                  }
                } else {
                  tradicional_Qerametik += producto.cantidad
                  Productos_Qerametik += producto.cantidad
                  productosPorCliente[cliente].cantidad_Qerametik += producto.cantidad
                  if (!_Productos_Qerametik[producto_]) {
                    _Productos_Qerametik[producto_] = {
                      producto: producto_,
                      cantidad: 0
                    }
                  }
                  _Productos_Qerametik[producto_].cantidad += producto.cantidad
                }
              })
            })

            this.clientesArray = Object.values(productosPorCliente).sort((a: any, b: any) => b.cantidad - a.cantidad);
            this.productoArray = Object.values(productosPorPromotora).sort((a: any, b: any) => b.cantidad - a.cantidad);

            // Mapeamos los datos desde _Productos_Qerametik
            const combinedData = Object.values(_Productos_Qerametik)// Filtrar el producto "AGUA 500 ML"
              .map((item: any) => {
                const randomHue = Math.floor(Math.random() * 360); // Generar un color aleatorio en el espectro HSL
                return {
                  label: item.producto, // Nombre del producto
                  data: item.cantidad, // Cantidad del producto vendido
                  backgroundColor: `hsl(${randomHue}, 70%, 50%)`, // Color de fondo
                  borderColor: `hsl(${randomHue}, 80%, 40%)`, // Color de borde
                };
              });

            // Ordenar los datos por la cantidad (data) de mayor a menor
            combinedData.sort((a, b) => b.data - a.data);

            // Extraer los arrays ordenados
            const labels = combinedData.map(item => item.label);
            const data = combinedData.map(item => item.data);
            const backgroundColor = combinedData.map(item => item.backgroundColor);
            const borderColor = combinedData.map(item => item.borderColor);



            // Crear un arreglo temporal para almacenar los datos combinados y filtrar
            const combinedDataMystic = Object.values(_Productos_Mystic)
              .map((item: any) => {
                const randomHue = Math.floor(Math.random() * 360); // Generar un color aleatorio en el espectro HSL
                return {
                  label: item.producto, // Nombre del producto
                  data: item.cantidad, // Cantidad del producto vendido
                  backgroundColor: `hsl(${randomHue}, 70%, 50%)`, // Color de fondo
                  borderColor: `hsl(${randomHue}, 80%, 40%)`, // Color de borde
                };
              });

            // Ordenar los datos por la cantidad (data) de mayor a menor
            combinedDataMystic.sort((a, b) => b.data - a.data);

            // Extraer los arrays ordenados
            const labels_m = combinedDataMystic.map(item => item.label);
            const data_m = combinedDataMystic.map(item => item.data);
            const backgroundColor_m = combinedDataMystic.map(item => item.backgroundColor);
            const borderColor_m = combinedDataMystic.map(item => item.borderColor);



            // Construimos el objeto para el gráfico
            this.Qerametik = {
              labels: labels,
              datasets: [{
                label: 'Productos vendidos',
                data: data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                hoverOffset: 4,
              }]
            };

            const customDataLabelsPlugin_Qerametik = {
              id: 'customDataLabelsQerametik',
              afterDatasetsDraw(chart: any) {
                const { ctx, data } = chart;
                chart.data.datasets.forEach((dataset: any, datasetIndex: any) => {
                  const meta = chart.getDatasetMeta(datasetIndex);
                  meta.data.forEach((bar: any, index: any) => {
                    const value = dataset.data[index];
                    ctx.save();
                    ctx.font = '12px Arial';
                    ctx.fillStyle = '#000';
                    ctx.textAlign = 'center';
                    ctx.fillText(value, bar.x, bar.y - 10); // Ajusta 'bar.y - 10' para la posición
                    ctx.restore();
                  });
                });
              },
            };

            this.qerametik_chart = new Chart(canvasQerametik, {
              type: 'bar',  // o 'line', dependiendo del tipo de gráfico
              data: this.Qerametik,
              options: {
                plugins: {
                  legend: {
                    display: true,
                  },
                },
              },
              plugins: [customDataLabelsPlugin_Qerametik],
            });

            const customDataLabelsPlugin = {
              id: 'customDataLabels',
              afterDatasetsDraw(chart: any) {
                const { ctx, data } = chart;
                chart.data.datasets.forEach((dataset: any, datasetIndex: any) => {
                  const meta = chart.getDatasetMeta(datasetIndex);
                  meta.data.forEach((bar: any, index: any) => {
                    const value = dataset.data[index];
                    ctx.save();
                    ctx.font = '12px Arial';
                    ctx.fillStyle = '#000';
                    ctx.textAlign = 'center';
                    ctx.fillText(value, bar.x, bar.y - 10); // Ajusta 'bar.y - 10' para la posición
                    ctx.restore();
                  });
                });
              },
            };

            this.Mystic = {
              labels: labels_m,
              datasets: [{
                label: 'Productos vendidos',
                data: data_m,
                backgroundColor: backgroundColor_m,
                borderColor: borderColor_m,
                hoverOffset: 4,
              }]
            };

            this.mystic_chart = new Chart(canvasMystic, {
              type: 'bar',  // o 'line'
              data: this.Mystic,
              options: {
                plugins: {
                  legend: {
                    display: true,
                  },
                },
              },
              plugins: [customDataLabelsPlugin],
            });

            this.marcas = {
              labels: [
                'Mystic',
                'Qerametik',
              ],
              datasets: [{
                label: 'Productos vendidos',
                data: [Productos_Mystic, Productos_Qerametik],
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


            const customDoughnutLabelsPlugin = {
              id: 'customDoughnutLabels',
              afterDatasetsDraw(chart: any) {
                const { ctx, data } = chart; // Contexto y datos del gráfico
                const dataset = data.datasets[0]; // Obtén el primer dataset

                chart.getDatasetMeta(0).data.forEach((arc: any, index: any) => {
                  const value = dataset.data[index]; // Valor del segmento
                  const label = data.labels[index]; // Etiqueta del segmento

                  const { x, y } = arc.tooltipPosition(); // Posición central del arco

                  ctx.save();

                  // Fondo blanco detrás del texto
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Fondo semitransparente
                  const padding = 6; // Espaciado alrededor del texto
                  const textWidth = ctx.measureText(value).width;
                  const textHeight = 14; // Altura aproximada de la fuente
                  ctx.fillRect(
                    x - textWidth / 2 - padding / 2, // Posición izquierda del fondo
                    y - textHeight / 2 - padding / 2, // Posición superior del fondo
                    textWidth + padding, // Ancho del fondo
                    textHeight + padding // Altura del fondo
                  );

                  // Borde alrededor del texto (opcional)
                  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                  ctx.lineWidth = 1;
                  ctx.strokeRect(
                    x - textWidth / 2 - padding / 2,
                    y - textHeight / 2 - padding / 2,
                    textWidth + padding,
                    textHeight + padding
                  );

                  // Texto
                  ctx.fillStyle = '#000'; // Color del texto
                  ctx.font = '12px Arial'; // Fuente del texto
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillText(value, x, y);

                  ctx.restore();
                });
              },
            };

            this.marcas_chart = new Chart(canvasMarcas, {
              type: 'doughnut',
              data: this.marcas,
              options: {
                plugins: {
                  legend: {
                    display: true, // Muestra la leyenda
                  },
                },
              },
              plugins: [customDoughnutLabelsPlugin],
            });

            this.lineas = {
              labels: [
                'Tradicional Mystic',
                'Tradicional Qerametik',
                'Rebranding'
              ],
              datasets: [{
                label: 'Productos vendidos',
                data: [tradicional_Mystic, tradicional_Qerametik, Rebrandig],
                backgroundColor: [
                  '#001a72',
                  '#6bcaba',
                  '#fe5000'
                ],
                borderColor: [
                  '#fe5000',
                  '#c99700',
                  '#001a72'
                ],
                hoverOffset: 4
              }]
            }

            const customDoughnutLabelsPlugin_lineas = {
              id: 'customDoughnutLabels',
              afterDatasetsDraw(chart: any) {
                const { ctx, data } = chart; // Contexto y datos del gráfico
                const dataset = data.datasets[0]; // Obtén el primer dataset

                chart.getDatasetMeta(0).data.forEach((arc: any, index: any) => {
                  const value = dataset.data[index]; // Valor del segmento
                  const label = data.labels[index]; // Etiqueta del segmento

                  const { x, y } = arc.tooltipPosition(); // Posición central del arco

                  ctx.save();

                  // Fondo blanco detrás del texto
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Fondo semitransparente
                  const padding = 6; // Espaciado alrededor del texto
                  const textWidth = ctx.measureText(value).width;
                  const textHeight = 14; // Altura aproximada de la fuente
                  ctx.fillRect(
                    x - textWidth / 2 - padding / 2, // Posición izquierda del fondo
                    y - textHeight / 2 - padding / 2, // Posición superior del fondo
                    textWidth + padding, // Ancho del fondo
                    textHeight + padding // Altura del fondo
                  );

                  // Borde alrededor del texto (opcional)
                  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                  ctx.lineWidth = 1;
                  ctx.strokeRect(
                    x - textWidth / 2 - padding / 2,
                    y - textHeight / 2 - padding / 2,
                    textWidth + padding,
                    textHeight + padding
                  );

                  // Texto
                  ctx.fillStyle = '#000'; // Color del texto
                  ctx.font = '12px Arial'; // Fuente del texto
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillText(value, x, y);

                  ctx.restore();
                });
              },
            };

            this.lineas_chart = new Chart(canvasLineas, {
              type: 'doughnut',
              data: this.lineas,
              options: {
                plugins: {
                  legend: {
                    display: true, // Muestra la leyenda
                  },
                },
              },
              plugins: [customDoughnutLabelsPlugin_lineas],
            });


            this.tipos = {
              labels: [
                `${impulsos} Impulsos`,
                `${eventos} Eventos`
              ],
              datasets: [{
                label: 'Productos vendidos',
                data: [impulsos_productos, eventos_productos],
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
            }

            this.tipos_chart = new Chart(canvasTipos, {
              type: 'doughnut',
              data: this.tipos,
              options: {
                plugins: {
                  legend: {
                    display: true, // Muestra la leyenda
                  },
                },
              },
              plugins: [customDoughnutLabelsPlugin_lineas],
            });




          })
      }
    }, 500);
  }

}
