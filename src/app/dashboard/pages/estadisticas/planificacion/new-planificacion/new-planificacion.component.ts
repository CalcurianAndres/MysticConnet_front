import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientesResponseService } from '@services/clientes-response.service';
import { LoginService } from '@services/login.service';

@Component({
  selector: 'app-new-planificacion',
  imports: [CommonModule, FormsModule],
  templateUrl: './new-planificacion.component.html',
  styleUrl: './new-planificacion.component.scss'
})
export class NewPlanificacionComponent {

  public login = inject(LoginService)
  public ClientServices = inject(ClientesResponseService)

  constructor() {
    setTimeout(() => {
      this.plan.ejecutivo = `${this.login.usuario.nombre} ${this.login.usuario.apellido}`;
    }, 1000);
  }

  @Input() newPlanificacion!: boolean;
  @Input() plan!: any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onAgregarPlanificacion = new EventEmitter();

  public Clientes = inject(ClientesResponseService)
  public qlo = ''
  public modalCliente = false;
  public filteredClientes: any = []

  cerrar() {
    this.onCloseModal.emit();
  }

  addCliente_(cliente: any) {
    let union = `${cliente._id}__${cliente.cliente}`;
    this.addCliente({ value: union });
    this.modalCliente = false;
    this.newPlanificacion = true
  }

  addCliente(cliente: any) {
    let cliente_separado = cliente.value.split('__');
    let cliente_id = cliente_separado[0];
    let cliente_nombre = cliente_separado[1]
    console.log(cliente_id, cliente_nombre, '<3')

    this.plan.cliente = cliente_id;
    this.plan.cliente_nombre = cliente_nombre
    this.qlo = cliente.value;
  }


  BuscarCliente(e: any) {
    if (e.value.trim() === '') {
      // Si el campo de búsqueda está vacío, mostrar el array vacío
      this.filteredClientes = [];
    } else {
      // Si no está vacío, filtrar los productos según el término de búsqueda
      this.filteredClientes = this.ClientServices.clientes().filter(cliente =>
        cliente.cliente.toLowerCase().includes(e.value.toLowerCase()) &&
        cliente.marca === this.login.usuario.marca
      );
    }
  }

}
