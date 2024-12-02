import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { promotoras } from '@interfaces/req-respons';
import { UserResponseService } from '@services/user-response.service';
@Component({
  selector: 'app-modal-promotoras',
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-promotoras.component.html',
  styleUrl: './modal-promotoras.component.scss'
})
export class ModalPromotorasComponent {
  
  public UserService = inject(UserResponseService)


  @Input() active!:boolean;
  @Input() Edicion!:boolean;
  @Input({required: true}) data!:promotoras
  @Output() onCloseModal = new EventEmitter();

 


  cerrar(){
    this.onCloseModal.emit();
  }

  nuevaPromotora(){
    this.UserService.NuevaPromotora(this.data);
    this.cerrar();
  }

  EditarPromotora(){
    this.UserService.EditarPromotora(this.data);
    this.cerrar();
  }

}
