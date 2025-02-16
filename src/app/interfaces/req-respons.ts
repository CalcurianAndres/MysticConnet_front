export interface promotoras {
    nombre: string;
    apellido: string;
    correo: string;
    region: string;
    telefono: string;
    sueldo: string;
    role: 'Admin' | 'Promotora' | 'coordinadora' | 'Ejecutiva';
    restringido: boolean;
    fija: boolean;
    marca: string;
    estado?: 'habilitada' | 'inhabilitada';
    borrado?: boolean;
    foto?: string;
    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface productos {
    linea: string;
    marca: string;
    producto: string;
    puntos: number;
    precio: number;
    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}


export interface clientes {
    cliente: string;
    rif: string;
    marca: 'Mystic' | 'Qerametik';
    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface reportesResponse {
    promotora: promotoras;
    cliente: clientes;
    productos: arrayProductosPopulated[];
    tipo: string;
    observacion: string;
    fecha: string;
    evento?: string;
    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface arrayProductosPopulated {
    producto: productos;
    inicio: number;
    final: number;
    cantidad: number;
}


export interface reportes {
    promotora: promotoras['_id'];
    cliente: clientes['_id'];
    productos: arrayProductos[];
    tipo: string;
    observacion: string;
    fecha: string;
    evento?: string;
    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface arrayProductos {
    producto: productos['_id'];
    inicio: number;
    final: number;
    cantidad: number
}

export interface ReporteAgrupado {
    promotora: string; // Nombre completo de la promotora
    sueldo: string; // Sueldo de la promotora
    marca: string; // Nombre completo de la promotora
    region: string;
    porcentajeRebranding: number;
    puntosAcumulados: number; // Total de puntos acumulados
    totalGastado: number; // Total del dinero gastado
    productosVendidos: number;
    conteoMetaUnidades: number,
    conteoMetaUnidadesQ: number,
    productosMystic: number,
    productosQerametik: number,
    puntosMystic: number,
    puntosQerametik: number,
    gastosPorMarca: any,
    totalImpulsos: number, // Inicializamos el contador de impulsos
    totalEventos: number, // Inicializamos el contador de eventos
    totalImpulsos_qerametik: number, // Inicializamos el contador de impulsos
    totalEventos_qerametik: number, // Inicializamos el contador de eventos
    dias_impulto_mystic: any,
    dias_evento_mystic: any,
    dias_impulso_qerametik: any,
    dias_evento_qerametik: any,
    reportes: ReporteSimplificado[]; // Lista de reportes asociados
}

export interface ReporteSimplificado {
    cliente: string; // Nombre del cliente
    marca: 'Mystic' | 'Qerametik';
    tipo: string; // Tipo del reporte
    observacion: string; // Observación del reporte
    productos: ProductoSimplificado[]; // Productos asociados al reporte
    totalPuntos: number, // Agregar total de puntos por reporte
    totalSubtotal: number, // Agregar total de gastos por reporte
    fecha?: string; // Fecha del reporte
}

export interface ProductoSimplificado {
    producto: string; // Nombre del producto
    puntos: number; // Puntos del producto
    linea: string; // Nombre del producto
    marca: string; // Marca del producto
    cantidad: number; // Cantidad de productos reportados
    inicio: number; // Cantidad de productos reportados
    final: number; // Cantidad de productos reportados
    subtotal: number; // Subtotal calculado (precio * cantidad)
    puntosTotales: number; // Subtotal calculado (precio * cantidad)
}

export interface metas {
    impulso: number;
    evento: number;
}

export interface incentivos_ {
    de: number,
    hasta: number,
    incentivo: number
}

export interface planificacion {
    mes: string, // Valor seleccionado en el dropdown de meses
    inicio: string, // Fecha de inicio seleccionada
    cierre: string, // Fecha de cierre seleccionada
    metas: {
        tradicional: {
            mystic: {
                impulso: number, // Impulso diario de Mystic (Promotoras fijas)
                evento: number   // Evento de Mystic (Promotoras fijas)
            },
            qerametik: {
                impulso: number, // Impulso diario de Qerametik (Promotoras fijas)
                evento: number   // Evento de Qerametik (Promotoras fijas)
            }
        },
        rebranding: {
            mystic: {
                impulso: number, // Impulso diario de Mystic (Promotoras por destajo)
                evento: number   // Evento de Mystic (Promotoras por destajo)
            },
            qerametik: {
                impulso: number, // Impulso diario de Qerametik (Promotoras por destajo)
                evento: number   // Evento de Qerametik (Promotoras por destajo)
            }
        }
    },
    incentivos: incentivos_[],
    incentivos_qerametik: incentivos_[],
    planificacion: any, // Planificación semanal (por promotora y cliente)
    precios: {
        Mystic: number,
        Qerametik: number
    }
    _id?: string,
}