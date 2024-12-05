import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { clientes } from '@interfaces/req-respons';
import { ClientesResponseService } from '@services/clientes-response.service';
import { LoadingsComponent } from '@shared/loadings/loadings.component';
import { ModalClientesComponent } from './modal-clientes/modal-clientes.component';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-clientes',
  imports: [FormsModule, LoadingsComponent, ModalClientesComponent],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent {

  public clientService = inject(ClientesResponseService)

  public Modal = signal<boolean>(false);
  public Edicion = signal<boolean>(false);

  public data:clientes = {
    cliente:'',
    rif:'',
    marca:''
  }


  // Variables para paginación
  currentPage: number = 1;
  itemsPerPage: number = 200;
  
  get totalItems(): number {
    return this.clientService.clientes().length;
  }


  // Calcular el número total de páginas
 get totalPages(): number {
   return Math.ceil(this.totalItems / this.itemsPerPage);
 }

 // Obtener los clientes actuales para la página seleccionada
 get paginatedClientes() {
   const startIndex = (this.currentPage - 1) * this.itemsPerPage;
   const endIndex = startIndex + this.itemsPerPage;
   return this.clientService.clientes().slice(startIndex, endIndex);
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
    cliente:'',
    rif:'',
    marca:''
  }
}

EliminarCliente(cliente:clientes){
  Swal.fire({
    title: `¿Eliminar este cliente ${cliente.cliente}?`,
    text: "¿Estas segura que quieres eliminar a este cliente? aun podras ver reportes anteriores y estadísticas con este cliente pero no podras reportar nuevas ventas de este cliente",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Eliminar!"
  }).then((result) => {
    if (result.isConfirmed) {

      this.clientService.EliminarCliente(cliente._id)

      Swal.fire({
        title: "Eliminada",
        text: "El cliente fué eliminado de la lista",
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

Editar(cliente:clientes){
  this.data = cliente;
  this.Edicion.update(value => !value);
  this.ManejoModal()
}

}
