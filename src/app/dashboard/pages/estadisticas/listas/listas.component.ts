import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReporteAgrupado } from '@interfaces/req-respons';
import { PlanificacionService } from '@services/planificacion.service';
import { ReportesResponseService } from '@services/reportes-response.service';
import { UserResponseService } from '@services/user-response.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { RouterModule } from '@angular/router';
import { ClientesResponseService } from '@services/clientes-response.service';
import { LoadingsComponent } from '@shared/loadings/loadings.component';

@Component({
  selector: 'app-listas',
  imports: [CommonModule, FormsModule, RouterModule, LoadingsComponent],
  templateUrl: './listas.component.html',
  styleUrl: './listas.component.scss'
})
export class ListasComponent {

  // PRUEBA EXCEL

  exportarExcel() {
    // Obtener los datos de la tabla
    const datos_Mystic: any[] = this.reportesAgrupadosOrdenados
      .filter(promotora => {
        const incentivo = this.obtenerIncentivos(
          promotora.puntosMystic, promotora.puntosQerametik, promotora.promotora,
          promotora.marca, promotora.productosMystic
        ).mystic;

        return promotora.marca === "Mystic" || (promotora.marca !== "Mystic" && incentivo > 0);
      })
      .map(promotora => {
        // Verificar si el porcentaje de rebranding es menor a 30
        const rebranding = this.calcularPromedioRebranding(promotora.productosMystic, promotora.porcentajeRebranding)
        let incentivo = this.obtenerIncentivos(
          promotora.puntosMystic, promotora.puntosQerametik, promotora.promotora,
          promotora.marca, promotora.productosMystic
        ).mystic;

        // Si el Rebranding es menor a 30%, el incentivo se pone a 0
        if (rebranding < 30) {
          incentivo = 0;
        }

        return {
          Promotora: promotora.promotora,
          Marca: promotora.marca,
          Region: promotora.region,
          'Productos vendidos': promotora.productosMystic.toFixed(2),
          'Costo promedio': this.promedio.mystic.toFixed(2),
          Puntuación: promotora.puntosMystic.toFixed(2),
          Incentivo: incentivo.toFixed(2), // Usar el incentivo con 2 decimales
          'Promedio de exito Impuso': this.calcularPorcentaje_impulso_Mystic(
            promotora.totalImpulsos, this.buscarDiasTrabajados(promotora.promotora).impulsoMystic).toFixed(2),
          'Promedio de exito Eventos': this.calcularPorcentaje_evento_Mystic(
            promotora.totalEventos, this.buscarDiasTrabajados(promotora.promotora).eventoMystic).toFixed(2),
          'Promedio General': this.calcularPromedio(this.calcularPorcentaje_impulso_Mystic(
            promotora.totalImpulsos, this.buscarDiasTrabajados(promotora.promotora).impulsoMystic), this.calcularPorcentaje_evento_Mystic(
              promotora.totalEventos, this.buscarDiasTrabajados(promotora.promotora).eventoMystic)).toFixed(2),
          'Rebranding': `${rebranding.toFixed(2)}%`,
          'Monto de Und. Vendidas': (this.promedio.mystic * promotora.productosMystic).toFixed(2),
          Incidencia: (incentivo / (this.promedio.mystic * promotora.productosMystic) * 100).toFixed(2),
          'Total ventas de impulso': promotora.totalImpulsos.toFixed(2),
          'Total ventas de evento': promotora.totalEventos.toFixed(2),
          'Dias impulso': this.buscarDiasTrabajados(promotora.promotora).impulsoMystic.toFixed(2),
          'Dias evento': this.buscarDiasTrabajados(promotora.promotora).eventoMystic.toFixed(2),
          'Sueldo diario': (Number(promotora.sueldo) / this.buscarDiasTrabajados(promotora.promotora).totalDias).toFixed(2),
          'Ventas diarias': ((this.promedio.mystic * promotora.productosMystic) / this.buscarDiasTrabajados(promotora.promotora).totalDias).toFixed(2),
          'incidencia diaria': (((this.promedio.mystic * promotora.productosMystic) / this.buscarDiasTrabajados(promotora.promotora).totalDias * 100) / Number(promotora.sueldo) / this.buscarDiasTrabajados(promotora.promotora).totalDias).toFixed(2)
        };
      })
      .sort((a, b) => Number(b['Puntuación']) - Number(a['Puntuación'])); // Ordenar por Puntuación en orden descendente



    const datos_Qerametik: any[] = this.reportesAgrupadosOrdenados
      .filter(promotora => {
        const incentivo = this.obtenerIncentivos(
          promotora.puntosMystic, promotora.puntosQerametik, promotora.promotora,
          promotora.marca, promotora.productosMystic
        ).qerametik;

        return promotora.marca === "Qerametik" || (promotora.marca !== "Qerametik" && incentivo > 0);
      })
      .map(promotora => ({
        Promotora: promotora.promotora,
        Marca: promotora.marca,
        Region: promotora.region,
        'Productos vendidos': promotora.productosQerametik,
        'Costo promedio': this.promedio.qerametik,
        Puntuación: promotora.puntosQerametik,
        Incentivo: this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik, promotora.promotora, promotora.marca, promotora.productosQerametik).qerametik,
        'Promedio de exito Impuso': this.calcularPorcentaje_impulso_Qerametik(
          promotora.totalImpulsos_qerametik, this.buscarDiasTrabajados(promotora.promotora).impulsoQerametik),
        'Promedio de exito Eventos': this.calcularPorcentaje_evento_Qerametik(
          promotora.totalEventos_qerametik, this.buscarDiasTrabajados(promotora.promotora).eventoQerametik
        ),
        'Promedio General': this.calcularPromedio(this.calcularPorcentaje_impulso_Qerametik(
          promotora.totalImpulsos_qerametik, this.buscarDiasTrabajados(promotora.promotora).impulsoQerametik), this.calcularPorcentaje_evento_Qerametik(
            promotora.totalEventos_qerametik, this.buscarDiasTrabajados(promotora.promotora).eventoQerametik)),
        // 'Promedio exito': this.calcularPorcentaje(promotora.conteoMetaUnidadesQ, this.buscarDiasTrabajados(promotora.promotora).totalDias),
        'Monto de Und. Vendidas': this.promedio.qerametik * promotora.productosQerametik,
        Incidencia: (this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik, promotora.promotora, promotora.marca, promotora.productosQerametik).qerametik / (this.promedio.qerametik * promotora.productosQerametik) * 100).toFixed(2),
        'Total ventas de impulso': promotora.totalImpulsos_qerametik,
        'Total ventas de evento': promotora.totalEventos_qerametik,
        'Dias impulso': this.buscarDiasTrabajados(promotora.promotora).impulsoQerametik,
        'Dias evento': this.buscarDiasTrabajados(promotora.promotora).eventoQerametik,
        'Sueldo diario': Number(promotora.sueldo) / this.buscarDiasTrabajados(promotora.promotora).totalDias,
        'Ventas diarias': (this.promedio.qerametik * promotora.productosQerametik) / this.buscarDiasTrabajados(promotora.promotora).totalDias,
        'incidencia diaria': ((this.promedio.qerametik * promotora.productosQerametik) / this.buscarDiasTrabajados(promotora.promotora).totalDias * 100) / Number(promotora.sueldo) / this.buscarDiasTrabajados(promotora.promotora).totalDias
      }))
      .sort((a, b) => b['Puntuación'] - a['Puntuación']); // Ordenar por Incentivo en orden descendente

    // Crear el libro de Excel
    const hoja_Mystic = XLSX.utils.json_to_sheet(datos_Mystic);
    const hoja_Qerametik = XLSX.utils.json_to_sheet(datos_Qerametik);

    // Crear el libro con la hoja modificada
    const libro: XLSX.WorkBook = { Sheets: { 'Reportes Mystic': hoja_Mystic, 'Reportes Qerametik': hoja_Qerametik }, SheetNames: ['Reportes Mystic', 'Reportes Qerametik'] };

    // Guardar como archivo
    const excelBuffer: any = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'ReportePromotoras.xlsx');
  }


  calcularIncidencia(promotora: any): string {
    // Agrega la lógica necesaria para calcular la incidencia
    return ((this.obtenerIncentivo(promotora.puntosAcumulados, this.planificacionService.planificacion()[this.indexPlanificacion].incentivos) / promotora.totalGastado) * 100).toFixed(2) + '%';
  }

  calcularSueldoPorDia(promotora: any): number {
    return this.puntos(this.BuscarInfo(promotora.promotora)?.sueldo) / promotora.reportes.length;
  }

  calcularVentasPorDia(promotora: any): number {
    return promotora.totalGastado / promotora.reportes.length;
  }

  calcularIncidenciaPorcentaje(promotora: any): string {
    return (
      (this.calcularSueldoPorDia(promotora) / this.calcularVentasPorDia(promotora)) *
      100
    ).toFixed(2) + '%';
  }

  calcularPromedioRebranding(total: number, rebrandig: number) {
    return rebrandig / total * 100
  }


  // PRUEBA EXCEL

  public ReportesServices = inject(ReportesResponseService)
  public reportesAgrupados!: ReporteAgrupado[];
  public planificacionService = inject(PlanificacionService)
  public promotoras = inject(UserResponseService)
  public clientes = inject(ClientesResponseService)

  public datos_Mystic: any[] = [];
  public datos_Qerametik: any[] = [];

  public clientesMystic: { cliente: string; totalProductos: number }[] = [];
  public clientesQerametik: { cliente: string; totalProductos: number }[] = [];
  public ventasPorZonaMystic: { zona: string; totalProductos: number }[] = [];
  public ventasPorZonaQerametik: { zona: string; totalProductos: number }[] = [];
  public clientesNoAtendidos: any = [];


  public fijas = true;
  public clientesArray: any[] = [];
  public promedio: any = {
    mystic: 0,
    qerametik: 0
  }

  public loading = true;



  clientesConProductos: { cliente: string; totalProductos: number }[] = [];

  indexPlanificacion: any = 0;

  ordenActual: { columna: string; ascendente: boolean } = {
    columna: 'totalGastado', // Columna inicial para el ordenamiento
    ascendente: false,       // Orden inicial: descendente
  };

  reportesAgrupadosOrdenados: ReporteAgrupado[] = []; // Para los datos ordenados
  ventasPorZona: { zona: string; totalProductos: number }[] = [];


  constructor() {
    this.indexPlanificacion = this.planificacionService.planificacion().length - 1
    this.refresh()
  }

  cambiar() {
    this.refresh()
  }

  refresh() {
    this.loading = true;
    setTimeout(() => {
      this.promedio.mystic = this.planificacionService.planificacion()[this.indexPlanificacion].precios.Mystic
      this.promedio.qerametik = this.planificacionService.planificacion()[this.indexPlanificacion].precios.Qerametik
      if (!this.planificacionService.loading()) {
        this.ReportesServices.getReportesAgrupados_(this.fijas, this.planificacionService.planificacion()[this.indexPlanificacion].inicio, this.planificacionService.planificacion()[this.indexPlanificacion].cierre).subscribe({
          next: (reportes) => {
            this.reportesAgrupados = reportes;
            this.reportesAgrupadosOrdenados = [...this.reportesAgrupados];

            // Obtener los datos de la tabla
            this.datos_Mystic = this.reportesAgrupadosOrdenados
              .filter(promotora => {
                const incentivo = this.obtenerIncentivos(
                  promotora.puntosMystic, promotora.puntosQerametik, promotora.promotora,
                  promotora.marca, promotora.productosMystic
                ).mystic;

                return promotora.marca === "Mystic" || (promotora.marca !== "Mystic" && incentivo > 0);
              })
              .map(promotora => ({
                Promotora: promotora.promotora,
                Marca: promotora.marca,
                Region: promotora.region,
                Rebranding: promotora.porcentajeRebranding,
                'Productos vendidos': promotora.productosMystic,
                'Costo promedio': this.promedio.mystic,
                Puntuación: promotora.puntosMystic,
                Incentivo: this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik, promotora.promotora, promotora.marca, promotora.productosMystic).mystic,
                'Monto de Und. Vendidas': this.promedio.mystic * promotora.productosMystic,
                Incidencia: (this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik, promotora.promotora, promotora.marca, promotora.productosMystic).mystic / (this.promedio.mystic * promotora.productosMystic) * 100).toFixed(2),
                'Total ventas de impulso': promotora.totalImpulsos,
                'Total ventas de evento': promotora.totalEventos,
                'Dias trabajados': this.buscarDiasTrabajados(promotora.promotora).totalDias,
                'Metas alcanzadas': promotora.conteoMetaUnidades,
                'Dias impulso': this.buscarDiasTrabajados(promotora.promotora).impulsoMystic,
                'Dias evento': this.buscarDiasTrabajados(promotora.promotora).eventoMystic,
                'Sueldo diario': Number(promotora.sueldo) / this.buscarDiasTrabajados(promotora.promotora).totalDias,
                'Ventas diarias': (this.promedio.mystic * promotora.productosMystic) / this.buscarDiasTrabajados(promotora.promotora).totalDias,
              }))
              .sort((a, b) => b['Puntuación'] - a['Puntuación']); // Ordenar por Incentivo en orden descendente

            this.datos_Qerametik = this.reportesAgrupadosOrdenados
              .filter(promotora => {
                const incentivo = this.obtenerIncentivos(
                  promotora.puntosMystic, promotora.puntosQerametik, promotora.promotora,
                  promotora.marca, promotora.productosMystic
                ).qerametik;

                return promotora.marca === "Qerametik" || (promotora.marca !== "Qerametik" && incentivo > 0);
              })
              .map(promotora => ({
                Promotora: promotora.promotora,
                Marca: promotora.marca,
                Region: promotora.region,
                'Productos vendidos': promotora.productosQerametik,
                'Costo promedio': this.promedio.qerametik,
                Puntuación: promotora.puntosQerametik,
                Incentivo: this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik, promotora.promotora, promotora.marca, promotora.productosQerametik).qerametik,
                'Monto de Und. Vendidas': this.promedio.qerametik * promotora.productosQerametik,
                Incidencia: (this.obtenerIncentivos(promotora.puntosMystic, promotora.puntosQerametik, promotora.promotora, promotora.marca, promotora.productosQerametik).qerametik / (this.promedio.qerametik * promotora.productosQerametik) * 100).toFixed(2),
                'Total ventas de impulso': promotora.totalImpulsos_qerametik,
                'Total ventas de evento': promotora.totalEventos_qerametik,
                'Dias trabajados': this.buscarDiasTrabajados(promotora.promotora).totalDias,
                'Metas alcanzadas': promotora.conteoMetaUnidadesQ,
                'Dias impulso': this.buscarDiasTrabajados(promotora.promotora).impulsoQerametik,
                'Dias evento': this.buscarDiasTrabajados(promotora.promotora).eventoQerametik,
                'Sueldo diario': Number(promotora.sueldo) / this.buscarDiasTrabajados(promotora.promotora).totalDias,
                'Ventas diarias': (this.promedio.qerametik * promotora.productosQerametik) / this.buscarDiasTrabajados(promotora.promotora).totalDias,
              }))
              .sort((a, b) => b['Puntuación'] - a['Puntuación']);

            const clientesSet = new Set(); // Usamos un Set para evitar duplicados

            this.clientes.clientes().forEach(cliente => {
              const atendido = this.reportesAgrupadosOrdenados.some(reporte =>
                reporte.reportes.some(r => r.cliente === cliente.cliente)
              );

              if (!atendido) {
                clientesSet.add(cliente.cliente); // Agregamos solo valores únicos
              }
            });

            // Convertimos el Set en array
            this.clientesNoAtendidos = Array.from(clientesSet);
            this.loading = false;
          },
          error: (error) => {
            console.error('Error al cargar los reportes:', error);
          }
        });
        this.calcularProductosPorCliente()
        this.calcularVentasPorZona()
      }
    }, 500);
  }

  buscarDiasTrabajados(nombre: string): {
    totalDias: number;
    impulsoMystic: number;
    eventoMystic: number;
    impulsoQerametik: number;
    eventoQerametik: number;
  } {
    const reporte = this.reportesAgrupados.find(r => r.promotora === nombre);

    if (reporte) {
      const fechasImpulsoMystic = new Set(
        reporte.reportes
          .filter(r => r.tipo === 'Impulso' && r.productos.some(p => p.marca === 'Mystic'))
          .map(r => r.fecha)
      );

      const fechasEventoMystic = new Set(
        reporte.reportes
          .filter(r => r.tipo === 'Evento' && r.productos.some(p => p.marca === 'Mystic'))
          .map(r => r.fecha)
      );

      const fechasImpulsoQerametik = new Set(
        reporte.reportes
          .filter(r => r.tipo === 'Impulso' && r.productos.some(p => p.marca === 'Qerametik'))
          .map(r => r.fecha)
      );

      const fechasEventoQerametik = new Set(
        reporte.reportes
          .filter(r => r.tipo === 'Evento' && r.productos.some(p => p.marca === 'Qerametik'))
          .map(r => r.fecha)
      );

      const totalDias = new Set(reporte.reportes.map(r => r.fecha)).size;

      return {
        totalDias,
        impulsoMystic: fechasImpulsoMystic.size,
        eventoMystic: fechasEventoMystic.size,
        impulsoQerametik: fechasImpulsoQerametik.size,
        eventoQerametik: fechasEventoQerametik.size,
      };
    }

    return { totalDias: 0, impulsoMystic: 0, eventoMystic: 0, impulsoQerametik: 0, eventoQerametik: 0 };
  }

  simplificar(date: string) {
    return date.split('T')[0]
  }

  puntos(puntos: any) {
    if (!puntos) {
      return 0
    } else {
      return puntos
    }
  }


  calcularTotales(datos: any[], propiedad: string): number {
    return datos.reduce((total, item) => total + (item[propiedad] || 0), 0);
  }

  obtenerIncentivo(puntos: number, incentivos: any) {
    // Si los puntos son menores que el mínimo del primer rango
    if (puntos < incentivos[0].de) {
      return 0;  // No hay incentivo
    }

    // Iteramos a través de los incentivos
    for (let i = 0; i < incentivos.length; i++) {
      let incentivo = incentivos[i];

      // Verificamos si los puntos están dentro del rango
      if (puntos >= incentivo.de && puntos <= incentivo.hasta) {
        return incentivo.incentivo;  // Devolvemos el incentivo
      }
    }

    return 0;  // Si no está en ningún rango, devolvemos 0
  }

  obtenerIncentivos(Puntos_Mystic: number, puntos_Qerametik: any, promotora: any, marcas: any, productos: any) {
    let totales = 0;
    let mystic = 0;
    let Qerametik = 0;


    if (this.fijas) {
      if (Puntos_Mystic < this.planificacionService.planificacion()[this.indexPlanificacion].incentivos[0].de) {
        mystic = 0;
      } else {
        for (let i = 0; i < this.planificacionService.planificacion()[this.indexPlanificacion].incentivos.length; i++) {
          let incentivo = this.planificacionService.planificacion()[this.indexPlanificacion].incentivos[i];

          // Verificamos si los puntos están dentro del rango
          if (Puntos_Mystic >= incentivo.de && Puntos_Mystic <= incentivo.hasta) {
            mystic = incentivo.incentivo;  // Devolvemos el incentivo
          }
        }
      }

      if (puntos_Qerametik < this.planificacionService.planificacion()[this.indexPlanificacion].incentivos_qerametik[0].de) {
        Qerametik = 0;
      } else {
        for (let i = 0; i < this.planificacionService.planificacion()[this.indexPlanificacion].incentivos_qerametik.length; i++) {
          let incentivo = this.planificacionService.planificacion()[this.indexPlanificacion].incentivos_qerametik[i];

          // Verificamos si los puntos están dentro del rango
          if (puntos_Qerametik >= incentivo.de && puntos_Qerametik <= incentivo.hasta) {
            Qerametik = incentivo.incentivo;  // Devolvemos el incentivo
          }
        }
      }

      return {
        totales: mystic + Qerametik,
        mystic: mystic,
        qerametik: Qerametik
      }
    } else {

      let dias = this.buscarDiasTrabajados(promotora).totalDias;
      let ventas_diarias_Mystic = this.planificacionService.planificacion()[this.indexPlanificacion].metas.rebranding.mystic.impulso
      let ventas_diarias_Qerametik = this.planificacionService.planificacion()[this.indexPlanificacion].metas.rebranding.qerametik.impulso


      console.log(marcas)

      if (marcas === 'Mystic') {
        let Meta = ventas_diarias_Mystic * dias
        if (productos >= Meta) {
          mystic = 25
        } else {
          mystic = 0
        }
      } else {
        let Meta = ventas_diarias_Qerametik * dias
        if (productos >= Meta) {
          Qerametik = 25
        } else {
          Qerametik = 0
        }
      }

      return {
        totales: mystic + Qerametik,
        mystic: mystic,
        qerametik: Qerametik
      }
    }

  }

  BuscarInfo(prom: string) {
    let promotora = prom.split(' ');
    let nombre = promotora[0];
    let apellido = promotora[1];

    return this.promotoras.users().find(prom => prom.nombre === nombre && prom.apellido === apellido)

  }

  ordenarPor(columna: keyof ReporteAgrupado) {
    if (this.ordenActual.columna === columna) {
      this.ordenActual.ascendente = !this.ordenActual.ascendente;
    } else {
      this.ordenActual.columna = columna;
      this.ordenActual.ascendente = true; // Por defecto, comienza en orden ascendente
    }

    this.reportesAgrupadosOrdenados = [...this.reportesAgrupados].sort((a, b) => {
      const valorA = a[columna];
      const valorB = b[columna];

      if (valorA < valorB) {
        return this.ordenActual.ascendente ? -1 : 1;
      } else if (valorA > valorB) {
        return this.ordenActual.ascendente ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  calcularProductosPorCliente(): void {
    const clienteMap: Record<string, { cliente: string; totalProductos: number; marca: string }> = {};
    const mysticClientes: Array<{ cliente: string; totalProductos: number }> = [];
    const qerametikClientes: Array<{ cliente: string; totalProductos: number }> = [];

    this.ReportesServices.cargarReportes_(
      this.planificacionService.planificacion()[this.indexPlanificacion].inicio,
      this.planificacionService.planificacion()[this.indexPlanificacion].cierre
    ).subscribe({
      next: (_reportes) => {
        this.clientesArray = [] // Reiniciar el array de clientes	
        let productosPorCliente: any = {};
        _reportes = _reportes.filter(x => x.promotora.fija === this.fijas)
        _reportes.forEach((reporte) => {
          if (
            !reporte.cliente ||
            !reporte.cliente._id ||
            reporte.cliente.cliente === 'FALTA JUSTIFICADA'
          ) {
            console.warn('Reporte excluido (cliente inválido o "FALTA JUSTIFICADA"):', reporte);
            return;
          }

          const clienteId = reporte.cliente._id;
          const clienteNombre = reporte.cliente.cliente;
          const clienteMarca = reporte.productos[0]?.producto?.marca; // Asegúrate de que `marca` existe en el objeto cliente.

          if (!clienteMap[clienteId]) {
            clienteMap[clienteId] = {
              cliente: clienteNombre,
              totalProductos: 0,
              marca: clienteMarca,
            };
          }

          // Sumar productos vendidos en este reporte
          const totalProductosEnReporte = reporte.productos.reduce(
            (suma, producto) => suma + producto.cantidad,
            0
          );

          reporte.productos.forEach((producto) => {
            const cliente = reporte.cliente.cliente;
            const promotora = `${reporte.promotora.nombre} ${reporte.promotora.apellido}`;
            const producto_ = producto.producto.producto;
            let productosPorPromotora: any = {};

            let Productos_Mystic = 0;
            let Productos_Qerametik = 0;
            let _Productos_Mystic: any = {};
            let _Productos_Qerametik: any = {};
            let Rebrandig = 0
            let tradicional_Mystic = 0
            let tradicional_Qerametik = 0
            let impulsos = 0
            let impulsos_productos = 0
            let eventos = 0
            let eventos_productos = 0

            // Inicializamos la entrada del cliente si no existe
            if (!productosPorCliente[cliente]) {
              productosPorCliente[cliente] = {
                cliente,
                cantidad: 0,
                cantidad_mystic: 0,
                cantidad_Qerametik: 0
              };
            }

            // Sumar la cantidad al cliente correspondiente
            productosPorCliente[cliente].cantidad += producto.cantidad;

            if (producto.producto.marca === 'Mystic') {
              productosPorCliente[cliente].cantidad_mystic += producto.cantidad
            } else {
              productosPorCliente[cliente].cantidad_Qerametik += producto.cantidad
            }

            // this.productoArray = Object.values(productosPorPromotora).sort((a: any, b: any) => b.cantidad - a.cantidad);

          });

          clienteMap[clienteId].totalProductos += totalProductosEnReporte;
        });
        this.clientesArray = Object.values(productosPorCliente).sort((a: any, b: any) => b.cantidad - a.cantidad);

        // Convertir el objeto a un array
        const clientesArray = Object.values(clienteMap);

        // Separar por marcas y ordenar por cantidad de productos vendidos
        clientesArray.forEach((cliente) => {
          if (cliente.marca === 'Mystic') {
            mysticClientes.push({ cliente: cliente.cliente, totalProductos: cliente.totalProductos });
          } else if (cliente.marca === 'Qerametik') {
            qerametikClientes.push({ cliente: cliente.cliente, totalProductos: cliente.totalProductos });
          }
        });

        // Ordenar cada lista por cantidad de productos vendidos
        this.clientesMystic = mysticClientes.sort((a, b) => b.totalProductos - a.totalProductos);
        this.clientesQerametik = qerametikClientes.sort((a, b) => b.totalProductos - a.totalProductos);
      },
      error: (error) => {
        console.error('Error al cargar los reportes:', error);
      },
    });
  }

  calcularVentasPorZona(): void {
    const zonaMapMystic: Record<string, { zona: string; totalProductos: number }> = {};
    const zonaMapQerametik: Record<string, { zona: string; totalProductos: number }> = {};

    this.ReportesServices.cargarReportes_(
      this.planificacionService.planificacion()[this.indexPlanificacion].inicio,
      this.planificacionService.planificacion()[this.indexPlanificacion].cierre
    ).subscribe({
      next: (_reportes) => {
        _reportes = _reportes.filter(x => x.promotora.fija === this.fijas)
        _reportes.forEach((reporte) => {
          if (!reporte.promotora || !reporte.promotora.region) {
            console.warn('Reporte excluido (promotora sin zona):', reporte);
            return;
          }

          const zona = reporte.promotora.region;

          reporte.productos.forEach((producto) => {
            const cantidad = producto.cantidad;

            if (producto.producto.marca === 'Mystic') {
              if (!zonaMapMystic[zona]) {
                zonaMapMystic[zona] = { zona, totalProductos: 0 };
              }
              zonaMapMystic[zona].totalProductos += cantidad;
            } else if (producto.producto.marca === 'Qerametik') {
              if (!zonaMapQerametik[zona]) {
                zonaMapQerametik[zona] = { zona, totalProductos: 0 };
              }
              zonaMapQerametik[zona].totalProductos += cantidad;
            }
          });
        });

        this.ventasPorZonaMystic = Object.values(zonaMapMystic).sort(
          (a, b) => b.totalProductos - a.totalProductos
        );
        this.ventasPorZonaQerametik = Object.values(zonaMapQerametik).sort(
          (a, b) => b.totalProductos - a.totalProductos
        );
      },
      error: (error) => {
        console.error('Error al cargar los reportes:', error);
      }
    });
  }


  getTotal(key: keyof ReporteAgrupado): number {
    return this.reportesAgrupadosOrdenados.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
  }


  CambiarAfijas(fijas: any) {
    if (fijas.value === 'Fijas') {
      this.fijas = true;
      this.refresh()
      this.ReportesServices.getReportesAgrupados_(true, this.planificacionService.planificacion()[this.indexPlanificacion].inicio, this.planificacionService.planificacion()[this.indexPlanificacion].cierre).subscribe({
        next: (reportes) => {
          this.reportesAgrupados = reportes;
          this.reportesAgrupadosOrdenados = [...this.reportesAgrupados];
        },
        error: (error) => {
          console.error('Error al cargar los reportes:', error);
        }
      });
    } else {
      this.fijas = false;
      this.refresh()
      this.ReportesServices.getReportesAgrupados_(false, this.planificacionService.planificacion()[this.indexPlanificacion].inicio, this.planificacionService.planificacion()[this.indexPlanificacion].cierre).subscribe({
        next: (reportes) => {
          this.reportesAgrupados = reportes;
          this.reportesAgrupadosOrdenados = [...this.reportesAgrupados];
        },
        error: (error) => {
          console.error('Error al cargar los reportes:', error);
        }
      });
    }
  }

  calcularPorcentaje(x: number, y: number) {
    return (x / y) * 100
  }

  calcularPorcentaje_impulso_Mystic(productos: number, dias_trabajados: number) {
    let dias = productos / 30;

    if (dias_trabajados < 1) {
      return 0
    } else {
      return (dias * 100) / dias_trabajados;
    }
  }

  calcularPorcentaje_evento_Mystic(productos: number, dias_trabajados: number) {
    let dias = productos / 40;

    if (dias_trabajados < 1) {
      return 0
    } else {
      return (dias * 100) / dias_trabajados;
    }
  }


  calcularPorcentaje_impulso_Qerametik(productos: number, dias_trabajados: number) {
    let dias = productos / 15;

    if (dias_trabajados < 1) {
      return 0
    } else {
      return (dias * 100) / dias_trabajados;
    }
  }

  calcularPorcentaje_evento_Qerametik(productos: number, dias_trabajados: number) {
    let dias = productos / 30;

    if (dias_trabajados < 1) {
      return 0
    } else {
      return (dias * 100) / dias_trabajados;
    }
  }

  calcularPromedio(x: number, y: number) {

    console.log()
    if (x === 0 || y === 0) {
      return Number((x + y).toFixed(2));
    } else {
      return Number(((x + y) / 2).toFixed(2));
    }
  }

  exportarClientesNoAtendidos(): void {
    if (!this.clientesNoAtendidos || this.clientesNoAtendidos.length === 0) {
      console.warn('No hay clientes para exportar.');
      return;
    }

    // Transformar el array en un formato adecuado para una sola columna
    const data = this.clientesNoAtendidos.map((cliente: any) => ({ Clientes: cliente }));

    // Crear una hoja de cálculo con una sola columna
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // Crear un libro de Excel y añadir la hoja
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes No Atendidos');

    // Generar el archivo Excel en formato binario
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Crear un Blob y guardarlo con file-saver
    const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, 'ClientesNoAtendidos.xlsx');
  }


  exportarClientes(): void {
    if (!this.clientesArray || this.clientesArray.length === 0) {
      console.warn('No hay clientes para exportar.');
      return;
    }

    // Transformar el array en formato adecuado para Excel
    const data = this.clientesArray.map(cliente => ({
      Cliente: cliente.cliente,
      'Cantidad Mystic': cliente.cantidad_mystic,
      'Cantidad Qerametik': cliente.cantidad_Qerametik,
      'Cantidad Total': cliente.cantidad
    }));

    // Crear una hoja de cálculo
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // Crear un libro de Excel y añadir la hoja
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

    // Generar el archivo Excel en formato binario
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Crear un Blob y guardarlo con file-saver
    const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, 'Clientes.xlsx');
  }
}
