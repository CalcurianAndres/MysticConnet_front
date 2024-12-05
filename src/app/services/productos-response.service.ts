import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { productos } from '@interfaces/req-respons';

interface State {
  productos:productos[],
  loading:boolean
}

@Injectable({
  providedIn: 'root'
})
export class ProductosResponseService {

  private http = inject(HttpClient)


  #state = signal<State>({
    loading: true,
    productos: []
  })


  public productos = computed( () => this.#state().productos );
  public loading = computed( () => this.#state().loading ); 
  public ruta = 'mysticconnectserver-production.up.railway.app/api'



  constructor() {
    
    this.cargarProductos();

   }


   cargarProductos() {
    this.http.get<productos[]>(`${this.ruta}/productos`)
      .subscribe(res => {
        // Ordenar alfabéticamente por la propiedad `producto`
        const sortedProductos = res.sort((a, b) => a.producto.localeCompare(b.producto));
  
        this.#state.set({
          loading: false,
          productos: sortedProductos
        });
      });
    }

  NuevoProducto = async (data: productos) => {
    // Cambiar el estado a "cargando"
    this.#state.set({
      ...this.#state(),
      loading: true,
    });
  
    // Enviar la solicitud al servidor
    this.http.post<productos>(`${this.ruta}/productos`, data).subscribe((res) => {
      // Actualizar el estado agregando el nuevo producto
      this.#state.set({
        ...this.#state(),
        loading: false,
        productos: [...this.#state().productos, res], // Agrega el nuevo usuario al array
      });
    });
  }

  EditarPromotora = async(data:productos) =>{
    // Cambiar el estado a "cargando"
    this.#state.set({
      ...this.#state(),
      loading: true,
    });

    // Enviar la solicitud al servidor
    this.http.put<productos>(`${this.ruta}/productos/${data._id}`, data).subscribe((res) => {
      // Actualizar el estado agregando el nuevo usuario
      this.cargarProductos();
    }); 
  }

  EliminarProducto = async(id:productos["_id"]) => {
    // Cambiar el estado a "cargando"
    this.#state.set({
      ...this.#state(),
      loading: true,
    });

    this.http.delete(`${this.ruta}/productos/${id}`).subscribe((res) =>{
      this.cargarProductos();
    })
  }


}
