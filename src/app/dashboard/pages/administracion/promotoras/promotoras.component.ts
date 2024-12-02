import { Component, inject, signal } from '@angular/core';
import { promotoras} from '@interfaces/req-respons';
import { UserResponseService } from '@services/user-response.service';
import { LoadingsComponent } from '@shared/loadings/loadings.component';
import { ModalPromotorasComponent } from './modal-promotoras/modal-promotoras.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-promotoras',
  imports: [LoadingsComponent, ModalPromotorasComponent],
  templateUrl: './promotoras.component.html',
  styleUrl: './promotoras.component.scss'
})
export class PromotorasComponent {
  
  public UserService = inject(UserResponseService)

  public Modal = signal<boolean>(false)
  public Edicion = signal<boolean>(false);

  public data:promotoras = {
    nombre:'',
    apellido:'',
    correo:'',
    telefono:'',
    region:'',
    sueldo:'',
    role:'Promotora'
  };

  constructor(){
    
  }


  // Variables para paginación
currentPage: number = 1;
itemsPerPage: number = 10;

get totalItems(): number {
  return this.UserService.users().length;
}

// Calcular el número total de páginas
get totalPages(): number {
  return Math.ceil(this.totalItems / this.itemsPerPage);
}

// Obtener las promotoras actuales para la página seleccionada
get paginatedPromotoras() {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  return this.UserService.users().slice(startIndex, endIndex);
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
    nombre:'',
    apellido:'',
    correo:'',
    telefono:'',
    region:'',
    sueldo:'',
    role:'Promotora'
  }
}

Editar(empleada:promotoras){
  this.data = empleada;
  this.Edicion.update(value => !value);
  this.ManejoModal()
}


ElimiarPromotora(promotora:promotoras){
  Swal.fire({
    title: `¿Eliminar esta promotora ${promotora.nombre} ${promotora.apellido}?`,
    text: "¿Estas segura que quieres eliminar a esta promotora? aun podras ver reportes anteriores pero no podra generar nuevos",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Eliminar!"
  }).then((result) => {
    if (result.isConfirmed) {

      this.UserService.eliminarPromotora(promotora._id)

      Swal.fire({
        title: "Eliminada",
        text: "La promotora fue eliminada de la lista",
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
