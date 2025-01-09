import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { planificacion } from '@interfaces/req-respons';
import { ClientesResponseService } from '@services/clientes-response.service';
import { PlanificacionService } from '@services/planificacion.service';
import { UserResponseService } from '@services/user-response.service';
import { LoadingsComponent } from '@shared/loadings/loadings.component';
import { NewPlanificacionComponent } from "./new-planificacion/new-planificacion.component";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-planificacion',
  imports: [FormsModule, CommonModule, LoadingsComponent, NewPlanificacionComponent],
  templateUrl: './planificacion.component.html',
  styleUrl: './planificacion.component.scss'
})
export default class PlanificacionComponent {


  public servicePlanificacion = inject(PlanificacionService)
  public promotoras = inject(UserResponseService)
  public clientes = inject(ClientesResponseService)
  public aprobado: boolean[] = [];
  _aprobados_: { [key: number]: boolean[] } = {};
  public newPlanificacion: boolean = false;
  public indexPlanificacion: any = 0;

  @Input() active!: boolean;
  @Output() onCloseModal = new EventEmitter();

  public plan = {
    cliente: '',
    fecha: '',
    promotora: '',
    ejecutivo: '',
    observacion: '',
    tipo: '',
    cliente_nombre: ''
  }

  public data: planificacion = {
    mes: '', // Valor seleccionado en el dropdown de meses
    inicio: '', // Fecha de inicio seleccionada
    cierre: '', // Fecha de cierre seleccionada
    metas: {
      tradicional: {
        mystic: {
          impulso: 0, // Impulso diario de Mystic (Promotoras fijas)
          evento: 0   // Evento de Mystic (Promotoras fijas)
        },
        qerametik: {
          impulso: 0, // Impulso diario de Qerametik (Promotoras fijas)
          evento: 0   // Evento de Qerametik (Promotoras fijas)
        }
      },
      rebranding: {
        mystic: {
          impulso: 0, // Impulso diario de Mystic (Promotoras por destajo)
          evento: 0   // Evento de Mystic (Promotoras por destajo)
        },
        qerametik: {
          impulso: 0, // Impulso diario de Qerametik (Promotoras por destajo)
          evento: 0   // Evento de Qerametik (Promotoras por destajo)
        }
      }
    },
    incentivos: [{
      de: 0,
      hasta: 0,
      incentivo: 0
    }],
    incentivos_qerametik: [{
      de: 0,
      hasta: 0,
      incentivo: 0
    }],  // Array de incentivos por ventas (de, hasta, incentivo)
    planificacion: [] // Planificación semanal (por promotora y cliente)
  };


  constructor() {
    setTimeout(() => {
      if (this.servicePlanificacion.planificacion().length > 0) {
        this.data = this.servicePlanificacion.planificacion()[this.servicePlanificacion.planificacion().length - 1]
        this.metas = this.data.incentivos.length;
        this.metas_ = this.data.incentivos_qerametik.length;
        this.data.inicio = new Date(this.data.inicio).toISOString().slice(0, 10);
        this.data.cierre = new Date(this.data.cierre).toISOString().slice(0, 10);
        this.calcularSemanas()
        this.indexPlanificacion = this.servicePlanificacion.planificacion().length - 1;
      }
    }, 500);
  }

  public metas = 1
  public metas_ = 1
  public semana_selected = 0

  Aja(i: number) {
    if (i === this.semana_selected) {
      return true
    } else {
      return false
    }
  }

  semanas: any[] = [];

  calcularSemanas() {
    if (this.data.inicio && this.data.cierre) {
      // Convertir las fechas de inicio y cierre en objetos Date
      const inicio = new Date(this.data.inicio);
      const cierre = new Date(this.data.cierre);

      let currentDate = new Date(inicio);
      const semanas = [];

      // Calcular las semanas
      let semana = [];
      // Empezar desde la fecha de inicio
      while (currentDate <= cierre) {
        // Crear un objeto para el día actual
        semana.push({
          dia: this.diaSemana(currentDate.getDay()),  // Obtener el nombre del día
          fecha: new Date(currentDate)
        });

        // Si ya tenemos 7 días, es una semana completa
        if (semana.length === 7) {
          semanas.push(semana);
          semana = [];  // Reiniciar la semana para la siguiente
        }

        // Avanzar al siguiente día
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Si la última semana tiene menos de 7 días, la agregamos tal cual
      if (semana.length > 0) {
        semanas.push(semana);
      }

      this.semanas = semanas;
      console.log(this.semanas)
    }
  }

  diaSemana(dia: number): string {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return dias[dia];
  }

  filtrarMese() {
    return ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].filter(m =>
      !this.servicePlanificacion.planificacion().some(plan => plan.mes === m))
  }


  cambiarPlanificacion(dato: any) {
    if (!isNaN(Number(dato.value))) {
      this.data = { ...this.servicePlanificacion.planificacion()[dato.value] };
      this.data.inicio = this.servicePlanificacion.planificacion()[dato.value].inicio.split('T')[0]
      this.data.cierre = this.servicePlanificacion.planificacion()[dato.value].cierre.split('T')[0]
      this.calcularSemanas()
    } else {
      this.data.mes = dato.value;
      this.data.inicio = ''
      this.data.cierre = ''
      this.data.planificacion = []
      if (this.data._id) {
        delete this.data._id
      }
      this.semanas = []
    }
  }


  cerrar() {
    this.onCloseModal.emit();
  }

  addMeta() {
    this.metas++
    this.data.incentivos.push({ de: 0, hasta: 0, incentivo: 0 });
  }
  addMeta_() {
    this.metas_++
    this.data.incentivos_qerametik.push({ de: 0, hasta: 0, incentivo: 0 });
  }

  removeMeta(index: number) {
    this.metas--
    if (this.data.incentivos.length > 1) {
      this.data.incentivos.splice(index, 1);
    }
  }

  removeMeta_(index: number) {
    this.metas_--
    if (this.data.incentivos_qerametik.length > 1) {
      this.data.incentivos_qerametik.splice(index, 1);
    }
  }

  sumarMetas() {
    this.metas++
  }

  crearPlanificacion() {
    console.log(this.data)
    this.servicePlanificacion.NuevaPlanificacion(this.data);
    setTimeout(() => {
      Swal.fire({
        title: 'Guardado cambios en la planificación',
        showConfirmButton: false,
        timer: 5000,
        toast: true,
        position: 'top-end',
        timerProgressBar: true,
        icon: 'success'
      })
    }, 1000);

    this.cerrar();
  }

  togle_Aprobados(promotoraIndex: number, ventaIndex: number, promotora_index: string, fecha: string) {
    if (!this._aprobados_[promotoraIndex]) {
      this._aprobados_[promotoraIndex] = [];
    }
    this._aprobados_[promotoraIndex][ventaIndex] = !this._aprobados_[promotoraIndex][ventaIndex];

    if (!this.data.planificacion[promotora_index]) {
      const formattedDate = new Date(fecha).toISOString().split('T')[0];
      this.data.planificacion[promotora_index] = { fecha: formattedDate, cliente: '' };
    }
  }

  generarPlan(promotora: string, fecha: any) {
    let fecha_f = new Date(fecha);
    const fechaUTC = new Date(fecha_f.getTime() + (0 * 60 * 60 * 1000));
    const fechaConvertida = fechaUTC.toISOString();
    this.plan.promotora = promotora;
    this.plan.fecha = fechaConvertida;
    this.newPlanificacion = true;
  }

  cerrar_() {
    this.newPlanificacion = false;
    this.plan = {
      cliente: '',
      fecha: '',
      promotora: '',
      ejecutivo: '',
      observacion: '',
      tipo: '',
      cliente_nombre: ''
    }
  }

  addplanificacion() {
    this.data.planificacion.push(this.plan)
    this.cerrar_();
    console.log(this.data)
    Swal.fire({
      title: 'Se agregó plan a promotora',
      icon: 'success',
      timer: 5000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      timerProgressBar: true
    })
  }

  existe(fecha: any, promotora: string) {
    let fecha_f = new Date(fecha);
    const fechaUTC = new Date(fecha_f.getTime() + (0 * 60 * 60 * 1000));
    const fechaConvertida = fechaUTC.toISOString();
    return this.data.planificacion.some((p: any) => p.fecha == fechaConvertida && p.promotora === promotora)
  }

  planification(fecha: any, promotora: string) {
    let fecha_f = new Date(fecha);
    const fechaUTC = new Date(fecha_f.getTime() + (0 * 60 * 60 * 1000));
    const fechaConvertida = fechaUTC.toISOString();
    return this.data.planificacion.find((p: any) => p.fecha === fechaConvertida && p.promotora === promotora)
  }

  existe_(fecha: any, promotora: string) {
    return this.data.planificacion.some((p: any) => p.fecha == fecha && p.promotora === promotora)
  }

  planification_(fecha: any, promotora: string) {
    return this.data.planificacion.find((p: any) => p.fecha === fecha && p.promotora === promotora)
  }

  planificacion(fecha: any, promotora: string): any {
    let fecha_f = new Date(fecha);
    const fechaUTC = new Date(fecha_f.getTime() + (0 * 60 * 60 * 1000));
    const fechaConvertida = fechaUTC.toISOString();
    return this.data.planificacion.filter(
      (p: any) => p.fecha == fechaConvertida && p.promotora === promotora);

  }




}

