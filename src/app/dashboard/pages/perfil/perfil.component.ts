import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { productos, reportes, reportesResponse } from '@interfaces/req-respons';
import { ClientesResponseService } from '@services/clientes-response.service';
import { LoginService } from '@services/login.service';
import { PlanificacionService } from '@services/planificacion.service';
import { ProductosResponseService } from '@services/productos-response.service';
import { ReportesResponseService } from '@services/reportes-response.service';
import { LoadingsComponent } from '@shared/loadings/loadings.component';
import { TitleComponent } from '@shared/title/title.component';

@Component({
  selector: 'app-perfil',
  imports: [TitleComponent, CommonModule, LoadingsComponent, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export default class PerfilComponent {

  public login = inject(LoginService);
  public reportes = inject(ReportesResponseService);
  public planificacion = inject(PlanificacionService);
  public clientes = inject(ClientesResponseService);
  public productoService = inject(ProductosResponseService);

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

  constructor() {
    this.RefreshPage();
  }

  BuscarCliente(e: any) {
    console.log(e.value)
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
        let lastReporte = this.planificacion.planificacion()[this.planificacion.planificacion().length - 1];
        this.reportes.cargarReportes_(lastReporte.inicio, lastReporte.cierre).subscribe(
          (response) => {
            // Filtrar reportes por marca
            this.ReportesFiltradosMystic = response.filter((reporte) =>
              reporte.promotora._id === this.login.usuario._id &&
              reporte.productos[0].producto.marca === 'Mystic'
            );
            this.ReportesFiltradosQerametik = response.filter((reporte) =>
              reporte.promotora._id === this.login.usuario._id &&
              reporte.productos[0].producto.marca === 'Qerametik'
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
    this.ReporteSeleccionado.productos.splice(this.ReporteSeleccionado.productos.findIndex((p: any) => p.producto._id === id), 1);
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


}
