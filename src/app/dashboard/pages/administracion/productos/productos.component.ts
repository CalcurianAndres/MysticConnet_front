import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductosResponseService } from '@services/productos-response.service';
import { ModalProductosComponent } from './modal-productos/modal-productos.component';
import { productos } from '@interfaces/req-respons';
import { LoadingsComponent } from '@shared/loadings/loadings.component';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-productos',
  imports: [FormsModule, ModalProductosComponent, LoadingsComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export class ProductosComponent {
  
  public productosServices = inject(ProductosResponseService)

  public Modal = signal<boolean>(false);
  public Edicion = signal<boolean>(false)

  public data:productos = {
    linea:'',
    marca:   '',
    producto:  '',
    puntos:  0,
    precio:  0,
  }

   // Variables para paginación
   currentPage: number = 1;
   itemsPerPage: number = 10;

   get totalItems(): number {
    return this.productosServices.productos().length;
  }


   // Calcular el número total de páginas
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  // Obtener los productos actuales para la página seleccionada
  get paginatedProductos() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.productosServices.productos().slice(startIndex, endIndex);
  }

  // Cambiar de página
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return; // No permitir ir fuera de los límites
    this.currentPage = page;
  }


  ManejoModal(){
    this.Modal.update(value => !value);
  }

  cerrarEdicion(){
    this.Edicion.update(value => false)
    this.data = {
      linea:'',
      marca:'',
      producto:'',
      puntos:0,
      precio:0,
    }
  }

  Editar(producto:productos){
    this.data = producto;
    this.Edicion.update(value => !value);
    this.ManejoModal()
  }

  EliminarProducto(producto:productos){
    Swal.fire({
      title: `¿Eliminar este producto ${producto.producto}?`,
      text: "¿Estas segura que quieres eliminar a este producto? aun podras ver reportes anteriores y estadísticas con este producto pero no podras reportar nuevas ventas de este producto",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Eliminar!"
    }).then((result) => {
      if (result.isConfirmed) {
  
        this.productosServices.EliminarProducto(producto._id)
  
        Swal.fire({
          title: "Eliminada",
          text: "El producto fué eliminado de la lista",
          icon: "success",
          showConfirmButton:false,
          timer:5000,
          toast:true,
          timerProgressBar:true,
          position:'top-end'
        });
      }
    });
  }


}
