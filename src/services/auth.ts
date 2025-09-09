import api from "./api";

export interface RegisterPayload {
  usuario: { email: string; contraseña: string; foto?: string };
  persona: {
    nombre: string;
    apellido: string;
    fechaDeNacimiento: Date;
    telefono?: string | null;
    ciudadId: number;
    generoId?: number | null;
  };
  cliente?: { domicilio?: string | null };
  cuidador?: {
    descripcion?: string | null;
    experiencia?: string[] | null;
    formacion?: string[] | null;
    tarifas?: { precio: number; servicios: string[]; grupoId: number }[] | null;
    tags?: string[] | null;
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

export async function checkEmailExists(email: string): Promise<boolean> {
  const url = `/auth/email-exists/${email}`;
  console.log("Checking email existence with URL:", url);
  const res = await api.get(url);
  console.log(res.data);

  return res.data;
}
