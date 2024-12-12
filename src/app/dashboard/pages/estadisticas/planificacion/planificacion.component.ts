import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { planificacion } from '@interfaces/req-respons';
import { ClientesResponseService } from '@services/clientes-response.service';
import { PlanificacionService } from '@services/planificacion.service';
import { UserResponseService } from '@services/user-response.service';
import { LoadingsComponent } from '@shared/loadings/loadings.component';

@Component({
  selector: 'app-planificacion',
  imports: [FormsModule, CommonModule, LoadingsComponent],
  templateUrl: './planificacion.component.html',
  styleUrl: './planificacion.component.scss'
})
export default class PlanificacionComponent {


  public servicePlanificacion = inject(PlanificacionService)
  public promotoras = inject(UserResponseService)
  public clientes = inject(ClientesResponseService)

  @Input() active!: boolean;
  @Output() onCloseModal = new EventEmitter();

  constructor() {
    setTimeout(() => {
      this.data.incentivos = this.servicePlanificacion.planificacion()[this.servicePlanificacion.planificacion().length - 1].incentivos
      this.metas = this.data.incentivos.length;
    }, 500);
  }

  public metas = 1
  public semana_selected = 0

  Aja(i: number) {
    if (i === this.semana_selected) {
      return true
    } else {
      return false
    }
  }

  public data: planificacion = {
    mes: '',
    inicio: '',
    cierre: '',
    metas: {
      tradicional: {
        mystic: {
          impulso: 0,
          evento: 0
        },
        qerametik: {
          impulso: 0,
          evento: 0
        }
      },
      rebranding: {
        mystic: {
          impulso: 0,
          evento: 0
        },
        qerametik: {
          impulso: 0,
          evento: 0
        }
      }
    },
    incentivos: [{
      de: 0,
      hasta: 0,
      incentivo: 0
    }]
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


  cerrar() {
    this.onCloseModal.emit();
  }

  addMeta() {
    this.metas++
    this.data.incentivos.push({ de: 0, hasta: 0, incentivo: 0 });
  }

  removeMeta(index: number) {
    this.metas--
    if (this.data.incentivos.length > 1) {
      this.data.incentivos.splice(index, 1);
    }
  }

  sumarMetas() {
    this.metas++
  }

  crearPlanificacion() {
    this.servicePlanificacion.NuevaPlanificacion(this.data);
    this.metas = 1;
    this.data = {
      mes: '',
      inicio: '',
      cierre: '',
      metas: {
        tradicional: {
          mystic: {
            impulso: 0,
            evento: 0
          },
          qerametik: {
            impulso: 0,
            evento: 0
          }
        },
        rebranding: {
          mystic: {
            impulso: 0,
            evento: 0
          },
          qerametik: {
            impulso: 0,
            evento: 0
          }
        }
      },
      incentivos: [{
        de: 0,
        hasta: 0,
        incentivo: 0
      }]
    }
    this.cerrar();
  }


}
