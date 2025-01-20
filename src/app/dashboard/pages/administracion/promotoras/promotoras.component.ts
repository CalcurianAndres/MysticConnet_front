import { Component, inject, signal } from '@angular/core';
import { promotoras } from '@interfaces/req-respons';
import { UserResponseService } from '@services/user-response.service';
import { LoadingsComponent } from '@shared/loadings/loadings.component';
import { ModalPromotorasComponent } from './modal-promotoras/modal-promotoras.component';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-promotoras',
  imports: [LoadingsComponent, ModalPromotorasComponent, CommonModule],
  templateUrl: './promotoras.component.html',
  styleUrl: './promotoras.component.scss'
})
export class PromotorasComponent {

  public UserService = inject(UserResponseService)

  public Modal = signal<boolean>(false)
  public Edicion = signal<boolean>(false);

  public data: promotoras = {
    nombre: '',
    marca: '',
    apellido: '',
    correo: '',
    telefono: '',
    region: '',
    sueldo: '',
    restringido: true,
    fija: true,
    role: 'Promotora'
  };

  constructor() {

  }


  // Variables para paginación
  currentPage: number = 1;
  itemsPerPage: number = 100;

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

  ManejoModal() {
    this.Modal.update(value => !value);
  }

  cerrarEdicion() {
    this.Edicion.update(value => false)
    this.data = {
      nombre: '',
      marca: '',
      apellido: '',
      correo: '',
      telefono: '',
      region: '',
      sueldo: '',
      restringido: true,
      fija: true,
      role: 'Promotora'
    }
  }

  Editar(empleada: promotoras) {
    this.data = empleada;
    this.Edicion.update(value => !value);
    this.ManejoModal()
  }


  ElimiarPromotora(promotora: promotoras) {
    Swal.fire({
      title: `¿Eliminar esta promotora: ${promotora.nombre} ${promotora.apellido}?`,
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
          showConfirmButton: false,
          timer: 5000,
          toast: true,
          timerProgressBar: true,
          position: 'top-end'
        });
      }
    });
  }

  inhabilitarPromotora(promotora: promotoras, estado: 'habilitada' | 'inhabilitada') {
    let title;
    let text;
    let title2;
    let text2;
    let boton;
    let color;
    let color2;

    if (estado === 'habilitada') {
      title = `¿habilitar esta promotora: ${promotora.nombre} ${promotora.apellido}?`
      text = `¿Estas segura que quieres habilitar a esta promotora?`
      title2 = 'Habilitada'
      text2 = 'La promotora ahora esta habilitada'
      boton = 'Habilitar'
      color = "#3085d6"
      color2 = "#d33"
    } else {
      title = `¿Inhabilitar esta promotora: ${promotora.nombre} ${promotora.apellido}?`,
        text = `¿Estas segura que quieres inhabilitar a esta promotora? aun podras ver reportes anteriores pero no podra generar nuevos`
      title2 = "Inhabilitada"
      text2 = "La promotora fue Inhabilitada de la lista"
      boton = 'Inhabilitar'
      color2 = "#3085d6"
      color = "#d33"
    }

    Swal.fire({
      title: title,
      text: text,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: color,
      cancelButtonColor: color2,
      confirmButtonText: boton
    }).then((result) => {
      if (result.isConfirmed) {

        promotora.estado = estado;

        this.UserService.EditarPromotora(promotora);

        Swal.fire({
          title: title2,
          text: text2,
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


  activarCalendario(promotora: promotoras) {
    promotora.restringido = !promotora.restringido
    this.UserService.EditarPromotora(promotora);
  }



}
