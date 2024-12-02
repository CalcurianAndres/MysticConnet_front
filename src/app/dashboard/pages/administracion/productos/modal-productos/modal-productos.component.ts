import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { productos } from '@interfaces/req-respons';
import { ProductosResponseService } from '@services/productos-response.service';

@Component({
  selector: 'app-modal-productos',
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-productos.component.html',
  styleUrl: './modal-productos.component.scss'
})
export class ModalProductosComponent {

  private ProductoService = inject(ProductosResponseService)


  @Input() active!:boolean;
  @Input() Edicion!:boolean;
  @Input({ required: true}) data!:productos
  @Output() onCloseModal = new EventEmitter();

  cerrar(){
    this.onCloseModal.emit();
  }

  nuevoProducto(){
    this.ProductoService.NuevoProducto(this.data);
    this.cerrar();
  }

  EditarProducto(){
    this.ProductoService.EditarPromotora(this.data);
    this.cerrar();
  }

}
