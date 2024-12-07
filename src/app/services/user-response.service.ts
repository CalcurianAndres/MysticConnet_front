import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { promotoras } from '@interfaces/req-respons';
import { delay } from 'rxjs';

interface State {
  promotoras:promotoras[],
  loading:boolean
}

@Injectable({
  providedIn: 'root'
})


export class UserResponseService {

  private http = inject(HttpClient)

  public users = computed( () => this.#state().promotoras );
  public loading = computed( () => this.#state().loading ); 

  #state = signal<State>({
    loading: true,
    promotoras: []
  })

  public ruta = 'https://mysticconnectserver-production.up.railway.app/api'
  
  
  constructor() { 
    
    this.cargarPromotoras();
    
  }
  
  
  cargarPromotoras(){
    this.http.get<promotoras[]>(`${this.ruta}/users`)
    .subscribe( res => {
      this.#state.set({
        loading: false,
        promotoras:res
      })
    })
  }


  NuevaPromotora = async (data: promotoras) => {
    // Cambiar el estado a "cargando"
    this.#state.set({
      ...this.#state(),
      loading: true,
    });
  
    // Enviar la solicitud al servidor
    this.http.post<promotoras>(`${this.ruta}/users`, data).subscribe((res) => {
      // Actualizar el estado agregando el nuevo usuario
      this.#state.set({
        ...this.#state(),
        loading: false,
        promotoras: [...this.#state().promotoras, res], // Agrega el nuevo usuario al array
      });
    });
  };

  EditarPromotora = async(data:promotoras) =>{
    // Cambiar el estado a "cargando"
    this.#state.set({
      ...this.#state(),
      loading: true,
    });

    // Enviar la solicitud al servidor
    this.http.put<promotoras>(`${this.ruta}/users/${data._id}`, data).subscribe((res) => {
      // Actualizar el estado agregando el nuevo usuario
      this.cargarPromotoras();
    });
    
  }

  eliminarPromotora = async(id:promotoras["_id"]) => {
    // Cambiar el estado a "cargando"
    this.#state.set({
      ...this.#state(),
      loading: true,
    });

    this.http.delete(`${this.ruta}/users/${id}`).subscribe((res) =>{
      this.cargarPromotoras();
    })
  }

}
