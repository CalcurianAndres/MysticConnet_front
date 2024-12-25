import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientesResponseService } from '@services/clientes-response.service';

@Component({
  selector: 'app-new-planificacion',
  imports: [CommonModule, FormsModule],
  templateUrl: './new-planificacion.component.html',
  styleUrl: './new-planificacion.component.scss'
})
export class NewPlanificacionComponent {


  @Input() newPlanificacion!: boolean;
  @Input() plan!: any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onAgregarPlanificacion = new EventEmitter();

  public Clientes = inject(ClientesResponseService)
  public qlo = ''

  cerrar() {
    this.onCloseModal.emit();
  }

  addCliente(cliente: any) {
    let cliente_separado = cliente.value.split('__');
    let cliente_id = cliente_separado[0];
    let cliente_nombre = cliente_separado[1]

    this.plan.cliente = cliente_id;
    this.plan.cliente_nombre = cliente_nombre
  }

}
