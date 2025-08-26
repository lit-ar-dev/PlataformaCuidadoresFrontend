import api from "./api";

export type Provincia = { id: number; nombre: string };
export type Ciudad = { id: number; nombre: string };
export type Genero = { id: number; nombre: string };

export const getProvincias = async (): Promise<Provincia[]> => {
  try {
    const res = await api.get<Provincia[]>("utilidades/provincias");
    return res.data;
  } catch (error) {
    console.error("Error fetching provincias:", error);
    throw error;
  }
};

export const getCiudadesByProvincia = async (
  provinciaId: number
): Promise<Ciudad[]> => {
  try {
    const res = await api.get<Ciudad[]>(
      `utilidades/provincias/${provinciaId}/ciudades`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching ciudades:", error);
    throw error;
  }
};

export const getGeneros = async (): Promise<Genero[]> => {
  try {
    const res = await api.get<Genero[]>("utilidades/generos");
    return res.data;
  } catch (error) {
    console.error("Error fetching generos:", error);
    throw error;
  }
};
