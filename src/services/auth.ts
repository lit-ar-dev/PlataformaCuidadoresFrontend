import api from "./api";

export interface RegisterPayload {
  usuario: { email: string; contraseña: string; foto?: string };
  persona: {
    nombre: string;
    apellido: string;
    fechaDeNacimiento: string;
    telefono?: string | null;
    ciudadId: number;
    generoId?: number | null;
  };
  cliente?: { domicilio: string };
  cuidador?: {
    descripcion: string;
    experiencia?: string[];
    formacion?: string[];
    tarifas: { precio: number; servicios: string[]; grupoId: number }[];
    tags?: string[];
  };
  rolesId: number[];
}

export async function register(payload: RegisterPayload) {
  const resp = await api.post("/auth/register", payload);
  return resp.data;
}

export interface LoginPayload {
  email: string;
  contraseña: string;
}

export async function login(payload: LoginPayload) {
  const resp = await api.post("/auth/login", payload);
  return resp.data;
}

export type Rol = { id: number; nombre: string };

export const getRoles = async (): Promise<Rol[]> => {
  try {
    const res = await api.get<Rol[]>("auth/roles");
    return res.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};
