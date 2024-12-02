export interface promotoras{
    nombre:     string;
    apellido:   string;
    correo:     string;
    region:     string;
    telefono:   string;
    sueldo:     string;
    role:       'Admin' | 'Promotora'
    borrado?:   boolean;
    foto?:      string;
    _id?:       string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface productos{
    linea:      string;
    marca:      string;
    producto:   string;
    puntos:     number;
    precio:     number;
    _id?:       string;
    createdAt?: Date;
    updatedAt?: Date;
}


export interface clientes{
    cliente:    string;
    rif:        string;
    informacion:string;
    _id?:       string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface reportesResponse{
    promotora: promotoras;
    cliente:   clientes;
    productos: arrayProductosPopulated[];
    tipo:       string;
    observacion:string;
    evento?:    string;
    _id?:       string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface arrayProductosPopulated{
    producto:productos;
    cantidad:number;
}


export interface reportes{
    promotora: promotoras['_id'];
    cliente:   clientes['_id'];
    productos: arrayProductos[];
    tipo:       string;
    observacion:string;
    evento?:    string;
    _id?:       string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface arrayProductos{
    producto:productos['_id'];
    cantidad:number;
}

export interface ReporteAgrupado {
    promotora: string; // Nombre completo de la promotora
    puntosAcumulados: number; // Total de puntos acumulados
    totalGastado: number; // Total del dinero gastado
    reportes: ReporteSimplificado[]; // Lista de reportes asociados
}

export interface ReporteSimplificado {
    cliente: string; // Nombre del cliente
    tipo: string; // Tipo del reporte
    observacion: string; // Observación del reporte
    productos: ProductoSimplificado[]; // Productos asociados al reporte
    fecha?: Date; // Fecha del reporte
    totalPuntos: number, // Agregar total de puntos por reporte
    totalSubtotal: number, // Agregar total de gastos por reporte
}

export interface ProductoSimplificado {
    producto: string; // Nombre del producto
    linea: string; // Nombre del producto
    marca: string; // Marca del producto
    cantidad: number; // Cantidad de productos reportados
    subtotal: number; // Subtotal calculado (precio * cantidad)
    puntosTotales: number; // Subtotal calculado (precio * cantidad)
}