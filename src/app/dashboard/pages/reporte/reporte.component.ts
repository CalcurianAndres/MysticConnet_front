import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { arrayProductos, clientes, productos, reportes } from '@interfaces/req-respons';
import { ClientesResponseService } from '@services/clientes-response.service';
import { LoginService } from '@services/login.service';
import { PlanificacionService } from '@services/planificacion.service';
import { ProductosResponseService } from '@services/productos-response.service';
import { ReportesResponseService } from '@services/reportes-response.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reporte',
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte.component.html',
  styleUrl: './reporte.component.scss'
})
export default class ReporteComponent {

  public ClientServices = inject(ClientesResponseService);
  public ProductosServices = inject(ProductosResponseService);
  public ReportesServices = inject(ReportesResponseService)
  public loginSevice = inject(LoginService)
  public planificacion = inject(PlanificacionService)

  public searchTerm: string = ''; // Término de búsqueda
  public filteredProductos: productos[] = []; // Productos filtradosUtilizar lista antigua
  public filteredClientes: clientes[] = []; // Productos filtradosUtilizar lista antigua
  public Informacion = signal(true)//con esto se muestra la información del despacho
  public isRotated = signal(false);
  public ProductosSelected: { producto: productos, inicial: number, final: number }[] = [];

  public establecimiento: string = '';
  public tipo: string = '';
  public tipo_evento: string = '';
  public obervacion: string = '';

  public date_log: string = ''

  public CargadaInformacion = signal(false);
  usarListaAntigua = false;

  public data: reportes =
    {
      promotora: this.loginSevice.usuario._id,
      cliente: '',
      productos: [],
      tipo: '',
      observacion: '',
      fecha: this.date_log
    }
  public date_aja!: Date

  public marca_seleccionada = ''
  public cliente = ''
  public modalCliente = false

  constructor() {
    this.date_log = this.getFormattedDate()
    this.date_aja = new Date();
    // setTimeout(() => {
    //   if (this.planification(this.date_aja, this.loginSevice.usuario.nombre).cliente) {
    //     this.establecimiento = this.planification(this.date_aja, this.loginSevice.usuario.nombre).cliente
    //     console.log(this.establecimiento)
    //   }
    // }, 1000);
  }

  addCliente(cliente: any) {
    if (cliente) {
      this.establecimiento = cliente;
    } else {
      this.establecimiento = ''
    }

    this.modalCliente = false;
  }

  // Método para filtrar los productos según el nombre
  filterProductos(): void {
    if (this.searchTerm.trim() === '') {
      // Si el campo de búsqueda está vacío, mostrar el array vacío
      this.filteredProductos = [];
    } else {
      // Si no está vacío, filtrar los productos según el término de búsqueda
      if (!this.usarListaAntigua) {
        this.filteredProductos = this.ProductosServices.productos().filter(producto =>
          producto.producto.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
          producto.marca === this.marca_seleccionada &&
          producto.linea != 'Antigua'
        );
      } else {
        this.filteredProductos = this.ProductosServices.productos().filter(producto =>
          producto.producto.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
          producto.marca === this.marca_seleccionada &&
          producto.linea === 'Antigua'
        );
      }
    }
  }

  BuscarCliente(e: any) {
    console.log(e.value)
    if (e.value.trim() === '') {
      // Si el campo de búsqueda está vacío, mostrar el array vacío
      this.filteredClientes = [];
    } else {
      // Si no está vacío, filtrar los productos según el término de búsqueda
      this.filteredClientes = this.ClientServices.clientes().filter(cliente =>
        cliente.cliente.toLowerCase().includes(e.value.toLowerCase()) &&
        cliente.marca === this.marca_seleccionada
      );
    }
  }


  getFormattedDate(): string {
    const date = new Date();

    // Obtener las partes de la fecha
    const day = String(date.getDate()).padStart(2, '0'); // Asegura que tenga 2 dígitos
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0, así que sumamos 1
    const year = date.getFullYear();

    // Obtener las partes de la hora
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Determinar AM/PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12; // Convertir a formato de 12 horas
    hours = hours ? hours : 12; // La hora 0 debe ser 12

    // Formatear la fecha en el formato deseado
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
  }

  toggleInformacion() {
    this.Informacion.update(value => !value)
    this.isRotated.update(value => !value)
  }

  agregarProducto(index: productos['_id']): void {
    // this.searchTerm = '';  // Limpiar el campo de búsqueda
    // this.filterProductos();  // Filtrar los productos según el nuevo término de búsqueda (si es necesario)

    // Buscar el producto en el array de Productos
    const productoDB: any = this.ProductosServices.productos().find(producto => producto._id === index);

    if (!productoDB) {
      console.error('Producto no encontrado');
      return; // Detener ejecución si no se encuentra el producto
    }

    // Verificar si el producto ya está en el array ProductosSelected
    const productoExistente = this.ProductosSelected.some(
      producto => producto.producto?._id === productoDB._id
    );

    // Solo agregar el producto si no existe en ProductosSelected
    if (!productoExistente) {
      this.ProductosSelected.push({ producto: productoDB, inicial: 0, final: 0 });
    }
  }


  VerificarReporte() {
    return this.ProductosSelected.every(p => p.inicial > 0 && (p.inicial > 0 && p.final <= p.inicial))
  }

  eliminarDeProductosSelected(index: number) {
    this.ProductosSelected.splice(index, 1)
  }

  resta = (x: number, y: number) => {
    return x - y;
  }

  Reportar() {
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

        this.data.cliente = this.establecimiento;
        this.data.tipo = this.tipo;
        this.data.evento = this.tipo_evento;
        this.data.productos = this.ProductosSelected.map(selected => ({
          producto: selected.producto._id,
          inicio: selected.inicial,
          final: selected.final,
          cantidad: this.resta(selected.inicial, selected.final)
        }));
        this.data.observacion = this.obervacion;

        this.data.fecha = this.date_log

        this.ReportesServices.NuevoReporte(this.data)

        this.data = {
          promotora: this.loginSevice.usuario._id,
          cliente: '',
          productos: [],
          tipo: '',
          observacion: '',
          fecha: this.date_log
        }

        this.ProductosSelected = []
        this.establecimiento = '';
        this.tipo = '';
        this.tipo_evento = '';
        this.obervacion = '';
        this.CargadaInformacion.update(value => false);
        this.isRotated.update(value => false);
        this.Informacion.update(value => true);
      }
    });
  }

  reportarFalta() {

    Swal.fire({
      title: "¿Reportar falta el dia de hoy?",
      text: "No generaras puntos ni ventas el dia de hoy",
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

        this.data.cliente = '6756ef7ed60449fa9c3ee3fa';
        this.data.tipo = this.establecimiento;
        this.data.evento = this.tipo_evento;
        this.data.productos = []
        this.data.observacion = 'Promotora reporto falta justificada por lo que no pudo realizar ventas hoy';

        this.data.fecha = this.date_log

        this.ReportesServices.NuevoReporte(this.data)

        this.data = {
          promotora: this.loginSevice.usuario._id,
          cliente: '',
          productos: [],
          tipo: '',
          observacion: '',
          fecha: this.date_log
        }

        this.ProductosSelected = []
        this.establecimiento = '';
        this.tipo = '';
        this.tipo_evento = '';
        this.obervacion = '';
        this.CargadaInformacion.update(value => false);
        this.isRotated.update(value => false);
        this.Informacion.update(value => true);
      }
    });
  }

  NextStep() {
    this.CargadaInformacion.update(value => true);
    this.isRotated.update(value => true);
    this.Informacion.update(value => false);
  }

  verFormato(e: any) {
    console.log(e.value)
  }

  planification(fecha: any, promotora: string) {
    let fecha_f = new Date(fecha);
    const fechaUTC = new Date(fecha_f.getTime() + (0 * 60 * 60 * 1000));
    const fechaConvertida = fechaUTC.toISOString();

    // Aumentar un día
    fechaUTC.setUTCDate(fecha.getUTCDate() + 1);

    // Ajustar la hora a medianoche en UTC
    fechaUTC.setUTCHours(0, 0, 0, 0);
    const fechaConvertida_ = fechaUTC.toISOString();


    console.log(this.planificacion.planificacion()[this.planificacion.planificacion().length - 1].planificacion, '<=>', fechaConvertida_)
    return this.planificacion.planificacion()[this.planificacion.planificacion().length - 1].planificacion.find((p: any) => p.fecha === fechaConvertida_ && p.promotora === promotora)
  }



}