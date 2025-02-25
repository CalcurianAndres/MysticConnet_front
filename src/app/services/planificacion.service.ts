import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { planificacion } from '@interfaces/req-respons';

interface State {
  planificacion: planificacion[],
  loading: boolean
}

@Injectable({
  providedIn: 'root'
})
export class PlanificacionService {

  private http = inject(HttpClient)


  #state = signal<State>({
    loading: true,
    planificacion: []
  })


  public planificacion = computed(() => this.#state().planificacion);
  public loading = computed(() => this.#state().loading);
  // public ruta = 'http://localhost:8080/api'
  public ruta = 'https://mysticconnectserver-production.up.railway.app/api'



  constructor() {
    this.cargarPlanificacion()
  }

  cargarPlanificacion() {
    this.http.get<planificacion[]>(`${this.ruta}/planificacion`)
      .subscribe(res => {
        this.#state.set({
          loading: false,
          planificacion: res
        });

        console.log(res)
      });
  }


  NuevaPlanificacion = async (data: planificacion) => {
    // Cambiar el estado a "cargando"
    this.#state.set({
      ...this.#state(),
      loading: true,
    });

    // Enviar la solicitud al servidor
    this.http.post<planificacion>(`${this.ruta}/planificacion`, data).subscribe((res) => {
      console.log(data)
      // Actualizar el estado agregando el nuevo producto
      this.#state.set({
        ...this.#state(),
        loading: false,
        planificacion: [...this.#state().planificacion, res], // Agregar la nueva planificación
      });
    });
  }







}
