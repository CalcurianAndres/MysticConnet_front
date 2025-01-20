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
    setTimeout(() => {
      if (!this.planificacion.loading()) {
        let lastReporte = this.planificacion.planificacion()[this.indexPlanificacion];
        this.reportes.cargarReportes_(lastReporte.inicio, lastReporte.cierre).subscribe(
          (response) => {

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
            });

            // Guardar los valores globales
            this.totalCantidadMystic = totalCantidadMystic;
            this.totalPuntosMystic = totalPuntosMystic;
            this.totalCantidadQerametik = totalCantidadQerametik;
            this.totalPuntosQerametik = totalPuntosQerametik;

            this.loading = true;

            console.log('Total Mystic:', {
              cantidad: this.totalCantidadMystic,
              puntos: this.totalPuntosMystic
            });
            console.log('Total Qerametik:', {
              cantidad: this.totalCantidadQerametik,
              puntos: this.totalPuntosQerametik
            });

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
    }, 500);
  }

  EditarReporte_Qera(reporte: any) {
    setTimeout(() => {
      this.EditarReporte = !this.EditarReporte;
      this.ReporteSeleccionado = this.ReportesFiltradosQerametik.find((r: any) => r._id === reporte); // Comparando el _id de cada reporte
      this.MarcaSelected = this.ReporteSeleccionado.productos[0].producto.marca;
    }, 500);
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
