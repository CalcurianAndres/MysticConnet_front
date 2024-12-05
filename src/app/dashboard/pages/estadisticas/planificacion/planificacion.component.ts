import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { planificacion } from '@interfaces/req-respons';
import { PlanificacionService } from '@services/planificacion.service';
import { LoadingsComponent } from '@shared/loadings/loadings.component';

@Component({
  selector: 'app-planificacion',
  imports: [FormsModule, CommonModule, LoadingsComponent],
  templateUrl: './planificacion.component.html',
  styleUrl: './planificacion.component.scss'
})
export class PlanificacionComponent {


  public servicePlanificacion = inject(PlanificacionService)

  @Input() active!:boolean;
  @Output() onCloseModal = new EventEmitter();

  public metas = 1

  public data:planificacion = {
    mes : '',
    inicio : '',
    cierre : '',
    metas:{
      tradicional:{
        mystic:{
          impulso:0,
          evento:0
        },
        qerametik:{
          impulso:0,
          evento:0
        }
      },
      rebranding:{
        mystic:{
          impulso:0,
          evento:0
        },
        qerametik:{
          impulso:0,
          evento:0
        }
      }
    },
    incentivos:[{
      de:0,
      hasta:0,
      incentivo:0
    }]
  }


  cerrar(){
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

  sumarMetas(){
    this.metas++
  }

  crearPlanificacion(){
    this.servicePlanificacion.NuevaPlanificacion(this.data);
    this.metas = 1;
    this.data = {
      mes : '',
    inicio : '',
    cierre : '',
    metas:{
      tradicional:{
        mystic:{
          impulso:0,
          evento:0
        },
        qerametik:{
          impulso:0,
          evento:0
        }
      },
      rebranding:{
        mystic:{
          impulso:0,
          evento:0
        },
        qerametik:{
          impulso:0,
          evento:0
        }
      }
    },
    incentivos:[{
      de:0,
      hasta:0,
      incentivo:0
    }]
    }
    this.cerrar();
  }


}
