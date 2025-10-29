import api from "./api";

export type Cuidador = {
  id: string;
  descripcion: string;
  usuario: {
    activo: boolean;
    foto: string | null;
    persona: { nombre: string; apellido: string; ciudad: { nombre: string } };
  };
  tarifas: Array<{
    precio: number;
    servicio: { nombre: string };
    grupo: { nombre: string };
    servicios: Array<{ nombre: string }>;
  }>;
  tags: Array<{ nombre: string }>;
};

export const getCuidadores = async (): Promise<Cuidador[]> => {
  const response = await api.get("/cuidadores");
  return response.data;
};
