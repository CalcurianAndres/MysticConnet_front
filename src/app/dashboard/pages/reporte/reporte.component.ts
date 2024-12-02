import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { arrayProductos, productos, reportes } from '@interfaces/req-respons';
import { ClientesResponseService } from '@services/clientes-response.service';
import { LoginService } from '@services/login.service';
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

public searchTerm: string = ''; // Término de búsqueda
public filteredProductos:productos[] = []; // Productos filtrados
public Informacion = signal(true)//con esto se muestra la información del despacho
public isRotated = signal(false);
public ProductosSelected:{producto:productos, cantidad:number}[] = [];

public establecimiento:string = '';
public tipo:string = '';
public tipo_evento:string = '';
public obervacion:string = '';

public date_log:string = ''

public CargadaInformacion = signal(false);

public data:reportes =
  {
    promotora: this.loginSevice.usuario._id,
    cliente:'',
    productos:[],
    tipo:'',
    observacion:''
  }


  constructor(){
    this.date_log = this.getFormattedDate()
  }

// Método para filtrar los productos según el nombre
filterProductos(): void {
  if (this.searchTerm.trim() === '') {
    // Si el campo de búsqueda está vacío, mostrar el array vacío
    this.filteredProductos = [];
  } else {
    // Si no está vacío, filtrar los productos según el término de búsqueda
    this.filteredProductos = this.ProductosServices.productos().filter(producto =>
      producto.producto.toLowerCase().includes(this.searchTerm.toLowerCase())
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
  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;

  return formattedDate;
}

toggleInformacion() {
  this.Informacion.update(value => !value)
  this.isRotated.update(value => !value)
}

agregarProducto(index: productos['_id']): void {
  this.searchTerm = '';  // Limpiar el campo de búsqueda
  this.filterProductos();  // Filtrar los productos según el nuevo término de búsqueda (si es necesario)

  // Buscar el producto en el array de Productos
  const productoDB:any = this.ProductosServices.productos().find(producto => producto._id === index);

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
    this.ProductosSelected.push({ producto: productoDB, cantidad: 0 });
  }
}


VerificarReporte(){
  return this.ProductosSelected.every(p => p.cantidad > 0)
}

eliminarDeProductosSelected(index:number){
  this.ProductosSelected.splice(index, 1)
}

Reportar(){
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
        showConfirmButton:false,
        timer:5000,
        toast:true,
        timerProgressBar:true,
        position:'top-end'
      });

      this.data.cliente = this.establecimiento;
      this.data.tipo = this.tipo;
      this.data.evento = this.tipo_evento;
      this.data.productos = this.ProductosSelected.map(selected => ({
        producto: selected.producto._id,
        cantidad: selected.cantidad
      }));
      this.data.observacion = this.obervacion;

      this.ReportesServices.NuevoReporte(this.data)

      this.data = {
        promotora: this.loginSevice.usuario._id,
        cliente:'',
        productos:[],
        tipo:'',
        observacion:''
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

NextStep(){
  this.CargadaInformacion.update(value => true);
  this.isRotated.update(value => true);
  this.Informacion.update(value => false);
}


}