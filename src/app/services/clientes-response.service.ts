import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { clientes } from '@interfaces/req-respons';

interface State {
  clientes: clientes[],
  loading: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ClientesResponseService {

  private http = inject(HttpClient)


  #state = signal<State>({
    loading: true,
    clientes: []
  })

  public clientes = computed(() => this.#state().clientes);
  public loading = computed(() => this.#state().loading);
  public ruta = 'https://mysticconnectserver-production.up.railway.app/api'




  constructor() {
    this.cargarClientes();
  }


  cargarClientes() {
    this.http.get<clientes[]>(`${this.ruta}/clientes`)
      .subscribe(res => {
        // Ordenar alfabéticamente por la propiedad `producto`
        const sortedProductos = res.sort((a, b) => a.cliente.localeCompare(b.cliente));

        this.#state.set({
          loading: false,
          clientes: sortedProductos
        });
      });
  }

  ClientePorMarca(marca: string) {
    return this.clientes().filter(cliente => cliente.marca === marca)
  }

  clienteBuscarPorId(id: string) {
    return this.clientes().find(cliente => cliente._id === id)

  }

  NuevoCliente = async (data: clientes) => {
    // Cambiar el estado a "cargando"
    this.#state.set({
      ...this.#state(),
      loading: true,
    });

    // Enviar la solicitud al servidor
    this.http.post<clientes>(`${this.ruta}/clientes`, data).subscribe((res) => {
      // Actualizar el estado agregando el nuevo producto
      this.#state.set({
        ...this.#state(),
        loading: false,
        clientes: [...this.#state().clientes, res], // Agrega el nuevo usuario al array
      });
    });
  }

  EliminarCliente = async (id: clientes["_id"]) => {
    // Cambiar el estado a "cargando"
    this.#state.set({
      ...this.#state(),
      loading: true,
    });

    this.http.delete(`${this.ruta}/clientes/${id}`).subscribe((res) => {
      this.cargarClientes();
    })
  }

  EditarClientes = async (data: clientes) => {
    // Cambiar el estado a "cargando"
    this.#state.set({
      ...this.#state(),
      loading: true,
    });

    // Enviar la solicitud al servidor
    this.http.put<clientes>(`${this.ruta}/clientes/${data._id}`, data).subscribe((res) => {
      // Actualizar el estado agregando el nuevo usuario
      this.cargarClientes();
    });
  }

}
