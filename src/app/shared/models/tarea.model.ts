export type EstadoTarea = 'INICIADA' | 'PENDIENTE' | 'COMPLETADA';

export interface Tarea{

    idTarea?: number;
    titulo: string;
    descripcion?: string;
    fechafin: string;
    estado: EstadoTarea;
}