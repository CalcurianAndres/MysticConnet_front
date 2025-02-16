import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { productos, promotoras, reportes, reportesResponse } from '@interfaces/req-respons';
import { ClientesResponseService } from '@services/clientes-response.service';
import { LoginService } from '@services/login.service';
import { PlanificacionService } from '@services/planificacion.service';
import { ProductosResponseService } from '@services/productos-response.service';
import { ReportesResponseService } from '@services/reportes-response.service';
import { UserResponseService } from '@services/user-response.service';
import { LoadingsComponent } from '@shared/loadings/loadings.component';
import { TitleComponent } from '@shared/title/title.component';
import Chart, { ChartType } from 'chart.js/auto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-promotoras',
  imports: [CommonModule, TitleComponent, LoadingsComponent, FormsModule, RouterModule],
  templateUrl: './promotoras.component.html',
  styleUrl: './promotoras.component.scss'
})
export default class PromotorasComponent {
  public login = inject(LoginService);
  public reportes = inject(ReportesResponseService);
  public planificacion = inject(PlanificacionService);
  public clientes = inject(ClientesResponseService);
  public productoService = inject(ProductosResponseService);
  public promotora = inject(UserResponseService)

  public ReportesFiltradosMystic: any = [];
  public ReportesFiltradosQerametik: any = [];
  public loading = false;

  public EditarReporte: boolean = false;
  public ReporteSeleccionado!: any;

  public MarcaSelected: string = 'Mystic';
  public searchTerm: string = ''; // Término de búsqueda
  public filteredProductos: productos[] = []; // Productos filtradosUtilizar lista antigua
  usarListaAntigua = false;
  public modalCliente = false;
  public filteredClientes: any = [];

  // Inicializar acumuladores globales
  public totalCantidadMystic = 0;
  public totalPuntosMystic = 0;
  public totalCantidadQerametik = 0;
  public totalPuntosQerametik = 0;

  public perfil!: any;

  public loading_perfil = false;
  public loading_clientes = false;
  public indexPlanificacion: number = 0;
  public Separado_por_clientes: any = [];

  public marcas_chart!: Chart;
  public lineas_chart!: Chart;

  public linea!: any;
  public marcas!: any;

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      setTimeout(() => {
        this.indexPlanificacion = this.planificacion.planificacion().length - 1;
        this.loading_perfil = true;
        this.perfil = this.promotora.users().find((p: any) => p._id === id);
        this.RefreshPage();
      }, 1000);
    });
  }

  BuscarCliente(e: any) {
    if (e.value.trim() === '') {
      // Si el campo de búsqueda está vacío, mostrar el array vacío
      this.filteredClientes = [];
    } else {
      // Si no está vacío, filtrar los productos según el término de búsqueda
      this.filteredClientes = this.clientes.clientes().filter(cliente =>
        cliente.cliente.toLowerCase().includes(e.value.toLowerCase()) &&
        cliente.marca === this.MarcaSelected
      );
    }
  }

  addCliente(cliente: any) {
    this.ReporteSeleccionado.cliente = cliente;
    this.modalCliente = false;
  }

  RefreshPage() {
    if (this.lineas_chart) this.lineas_chart.destroy();
    if (this.marcas_chart) this.marcas_chart.destroy();
    setTimeout(() => {
      if (!this.planificacion.loading()) {
        let lastReporte = this.planificacion.planificacion()[this.indexPlanificacion];
        this.reportes.cargarReportes_(lastReporte.inicio, lastReporte.cierre).subscribe(
          (response) => {

            const canvasMarcas = document.getElementById('marcas') as HTMLCanvasElement;
            const canvasLineas = document.getElementById('lineas') as HTMLCanvasElement;

            let Productos_Mystic = 0;
            let Productos_Qerametik = 0;
            let tradicional_Mystic = 0
            let tradicional_Qerametik = 0
            let Rebrandig = 0

            // Filtrar reportes por marca
            this.ReportesFiltradosMystic = response.filter((reporte) =>
              reporte.promotora._id === this.perfil._id &&
              reporte.productos[0]?.producto?.marca === 'Mystic'
            );

            this.ReportesFiltradosQerametik = response.filter((reporte) =>
              reporte.promotora._id === this.perfil._id &&
              reporte.productos[0]?.producto?.marca === 'Qerametik'
            );

            // Inicializar acumuladores globales
            let totalCantidadMystic = 0;
            let totalPuntosMystic = 0;
            let totalCantidadQerametik = 0;
            let totalPuntosQerametik = 0;








            // Calcular totales para Mystic
            this.ReportesFiltradosMystic.forEach((reporte: any) => {
              const cantidad = reporte.productos.reduce((sum: any, producto: any) => sum + producto.cantidad, 0);
              const puntos = reporte.productos.reduce((sum: any, producto: any) => sum + (producto.producto.puntos * producto.cantidad), 0);

              // Guardar en el reporte individual
              reporte.totalCantidad = cantidad;
              reporte.puntuacionTotal = puntos;

              // Acumular globalmente
              totalCantidadMystic += cantidad;
              totalPuntosMystic += puntos;

              reporte.productos.forEach((producto: any) => {
                Productos_Mystic += producto.cantidad;
                if (producto.producto.linea === 'Tradicional') {
                  tradicional_Mystic += producto.cantidad;
                } else if (producto.producto.linea === 'Rebranding') {
                  Rebrandig += producto.cantidad;
                }
              });
            });

            // Calcular totales para Qerametik
            this.ReportesFiltradosQerametik.forEach((reporte: any) => {
              const cantidad = reporte.productos.reduce((sum: any, producto: any) => sum + producto.cantidad, 0);
              const puntos = reporte.productos.reduce((sum: any, producto: any) => sum + (producto.producto.puntos * producto.cantidad), 0);

              // Guardar en el reporte individual
              reporte.totalCantidad = cantidad;
              reporte.puntuacionTotal = puntos;

              // Acumular globalmente
              totalCantidadQerametik += cantidad;
              totalPuntosQerametik += puntos;

              reporte.productos.forEach((producto: any) => {
                Productos_Qerametik += producto.cantidad;
                if (producto.producto.linea === 'Tradicional') {
                  tradicional_Qerametik += producto.cantidad;
                }
              });
            });

            let total_ventas = tradicional_Mystic + Rebrandig;
            let tradicional_Mystic_porcentaje = (tradicional_Mystic / total_ventas) * 100;
            let Rebrandig_porcentaje = (Rebrandig / total_ventas) * 100;

            this.linea = {
              labels: [
                `Tradicional Mystic (${tradicional_Mystic_porcentaje.toFixed(2)}%)`,
                `Tradicional Qerametik`,
                `Rebranding (${Rebrandig_porcentaje.toFixed(2)}%)`
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
              data: this.linea,
              options: {
                plugins: {
                  legend: {
                    display: true, // Muestra la leyenda
                  },
                },
              },
              plugins: [customDoughnutLabelsPlugin_lineas],
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

            // Guardar los valores globales
            this.totalCantidadMystic = totalCantidadMystic;
            this.totalPuntosMystic = totalPuntosMystic;
            this.totalCantidadQerametik = totalCantidadQerametik;
            this.totalPuntosQerametik = totalPuntosQerametik;

            this.loading = true;

            this.Separado_por_clientes = this.agruparYCalcularTotales(response.filter((r: any) => r.promotora._id === this.perfil._id))

            this.Separado_por_clientes = Object.entries(this.Separado_por_clientes).map(([nombre, datos]) => {
              // Verifica si "datos" es un objeto y no es nulo
              if (typeof datos === 'object' && datos !== null) {
                const safeDatos = datos as {
                  cantidadReportes?: number;
                  totalMystic?: number;
                  totalProductosVendidos?: number;
                  totalQerametik?: number;
                };

                return {
                  nombre,
                  cantidadReportes: safeDatos.cantidadReportes || 0,
                  totalMystic: safeDatos.totalMystic || 0,
                  totalProductosVendidos: safeDatos.totalProductosVendidos || 0,
                  totalQerametik: safeDatos.totalQerametik || 0,
                };
              }

              // En caso de que "datos" no sea un objeto válido
              return {
                nombre,
                id: 0,
                cantidadReportes: 0,
                totalMystic: 0,
                totalProductosVendidos: 0,
                totalQerametik: 0,
              };
            }).sort((a, b) => b.totalProductosVendidos - a.totalProductosVendidos);  // Ordenar por totalProductosVendidos en orden descendente;

            this.loading_clientes = true;
          }
        );
      }
    }, 1000);
  }


  EditarReporte_Mystic(reporte: any) {
    setTimeout(() => {
      this.EditarReporte = !this.EditarReporte;
      this.ReporteSeleccionado = this.ReportesFiltradosMystic.find((r: any) => r._id === reporte); // Comparando el _id de cada reporte
      this.MarcaSelected = this.ReporteSeleccionado.productos[0].producto.marca;
      Swal.fire({
        title: "¿Quieres eliminar este reporte?",
        icon: "question",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Eliminar",
        denyButtonText: `No, conservar`
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          this.ReporteSeleccionado.borrado = true;
          this.reportes.NuevoReporte(this.ReporteSeleccionado);
          Swal.fire({
            timer: 2000,
            icon: 'success',
            title: 'Reporte eliminado',
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            timerProgressBar: true
          })
          this.RefreshPage();
        } else if (result.isDenied) {
          Swal.fire({
            timer: 2000,
            icon: 'info',
            title: 'No hubo cambios',
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            timerProgressBar: true
          })
        }
      });
    }, 500);
  }

  EditarReporte_Qera(reporte: any) {
    setTimeout(() => {
      this.EditarReporte = !this.EditarReporte;
      this.ReporteSeleccionado = this.ReportesFiltradosQerametik.find((r: any) => r._id === reporte); // Comparando el _id de cada reporte
      this.MarcaSelected = this.ReporteSeleccionado.productos[0].producto.marca;
      Swal.fire({
        title: "¿Quieres eliminar este reporte?",
        icon: "question",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Eliminar",
        denyButtonText: `No, conservar`
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          this.ReporteSeleccionado.borrado = true;
          this.reportes.NuevoReporte(this.ReporteSeleccionado);
          Swal.fire({
            timer: 2000,
            icon: 'success',
            title: 'Reporte eliminado',
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            timerProgressBar: true
          })
          this.RefreshPage();
        } else if (result.isDenied) {
          Swal.fire({
            timer: 2000,
            icon: 'info',
            title: 'No hubo cambios',
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            timerProgressBar: true
          })
        }
      });
    }, 500);
  }

  BorrarReporte(reporte: any) {
    Swal.fire({
      title: "¿Reportar ventas de hoy?",
      text: "Recuerda verificar bien las cantidades que declaras y los productos seleccionados",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Reportar!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Listo",
          text: "La información fue enviada con exito",
          icon: "success",
          showConfirmButton: false,
          timer: 5000,
          toast: true,
          timerProgressBar: true,
          position: 'top-end'
        });

      }
    });
  }

  // Método para filtrar los productos según el nombre
  filterProductos(): void {
    if (this.searchTerm.trim() === '') {
      // Si el campo de búsqueda está vacío, mostrar el array vacío
      this.filteredProductos = [];
    } else {
      // Si no está vacío, filtrar los productos según el término de búsqueda
      if (!this.usarListaAntigua) {
        this.filteredProductos = this.productoService.productos().filter(producto =>
          producto.producto.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
          producto.marca === this.MarcaSelected &&
          producto.linea != 'Antigua'
        );
      } else {
        this.filteredProductos = this.productoService.productos().filter(producto =>
          producto.producto.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
          producto.marca === this.MarcaSelected &&
          producto.linea === 'Antigua'
        );
      }
    }
  }

  AgregarProducto(producto: any) {
    if (this.ReporteSeleccionado.productos.find((p: any) => p.producto._id === producto._id)) {
      return;
    }
    this.ReporteSeleccionado.productos.push({
      producto: producto,
      inicio: 0,
      final: 0,
      cantidad: 0
    });
    this.filterProductos();
  }

  EliminarProducto(id: any) {
    this.ReporteSeleccionado.productos.splice(id, 1);
  }

  cambiar() {
    this.loading = false;
    this.RefreshPage();
  }

  GuardarReporte() {
    this.loading = false;
    this.reportes.NuevoReporte(this.formatearReporte(this.ReporteSeleccionado))
    this.RefreshPage();
    this.EditarReporte = false;
  }

  formatearReporte(reporte: any) {
    return {
      ...reporte, // Mantiene todos los campos originales
      cliente: reporte.cliente._id, // Reemplaza `cliente` por el `_id`
      promotora: reporte.promotora._id, // Reemplaza `promotora` por el `_id`
      productos: reporte.productos.map((producto: any) => ({
        ...producto,
        producto: producto.producto._id // Reemplaza `producto` por el `_id` de cada producto
      }))
    };
  }

  // Función para agrupar por cliente y calcular totales
  agruparYCalcularTotales = (reportes: reportesResponse[]) => {
    return reportes.reduce((acumulador, reporte) => {
      const clienteId = reporte.cliente.cliente;

      // Si no existe el cliente en el acumulador, lo inicializamos
      if (!acumulador[clienteId]) {
        acumulador[clienteId] = {
          cantidadReportes: 0,
          totalProductosVendidos: 0,
          totalMystic: 0,
          totalQerametik: 0
        };
      }

      // Incrementar el contador de reportes
      acumulador[clienteId].cantidadReportes++;

      // Sumar la cantidad de productos vendidos en este reporte
      const totalProductos = reporte.productos.reduce((suma, producto) => suma + producto.cantidad, 0);
      if (reporte.cliente.marca === 'Mystic') {
        acumulador[clienteId].totalMystic += totalProductos;
      } else if (reporte.cliente.marca === 'Qerametik') {
        acumulador[clienteId].totalQerametik += totalProductos;
      }
      acumulador[clienteId].totalProductosVendidos += totalProductos;

      return acumulador;
    }, {} as Record<string, { cantidadReportes: number; totalProductosVendidos: number; totalMystic: number; totalQerametik: number }>);
  };
}
