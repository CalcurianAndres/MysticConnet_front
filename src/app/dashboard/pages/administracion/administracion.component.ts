import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TitleComponent } from '@shared/title/title.component';
import { ProductosComponent } from './productos/productos.component';
import { ClientesComponent } from './clientes/clientes.component';
import { PromotorasComponent } from './promotoras/promotoras.component';
import { LoadingsComponent } from '@shared/loadings/loadings.component';

type componentes = 'Productos' | 'Clientes' | 'Promotoras'


@Component({
  selector: 'app-administracion',
  imports: [TitleComponent, ProductosComponent, ClientesComponent, PromotorasComponent, LoadingsComponent, CommonModule],
  templateUrl: './administracion.component.html',
  styleUrl: './administracion.component.scss'
})
export default class AdministracionComponent {



  public Componente = signal<componentes>('Productos')

  setComponente(componente:componentes){
    this.Componente.set(componente)
  }
  

}
