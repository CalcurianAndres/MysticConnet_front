import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { clientes } from '@interfaces/req-respons';
import { ClientesResponseService } from '@services/clientes-response.service';

@Component({
  selector: 'app-modal-clientes',
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-clientes.component.html',
  styleUrl: './modal-clientes.component.scss'
})
export class ModalClientesComponent {

  private ClientService = inject(ClientesResponseService) 

  @Input() active!:boolean;
  @Input() Edicion!:boolean;
  @Input({ required:true }) data!:clientes;
  @Output() onCloseModal = new EventEmitter();
  

  cerrar(){
    this.onCloseModal.emit()
  }

  nuevoCliente(){
    this.ClientService.NuevoCliente(this.data)
    this.cerrar()
  }

  EditarProducto(){
    this.ClientService.EditarClientes(this.data);
    this.cerrar();
  }

}
