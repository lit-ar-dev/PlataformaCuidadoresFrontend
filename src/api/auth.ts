import api from "./api";

export interface RegisterPayload {
  usuario: { email: string; contraseña: string };
  persona: {
    nombre: string;
    apellido: string;
    fechaDeNacimiento: string;
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
  try {
    const resp = await api.post("/auth/register", payload);
    return resp.data;
  } catch (error: any) {
    console.error("Error registering user:", error);
    console.log(error?.response?.data);
    throw error;
  }
}

export async function uploadFotoUsuario(fotoForm: FormData, token: string) {
  if (!token) {
    throw new Error("No auth token available for uploading photo");
  }
  try {
    const resp = await api.post(`/usuarios/upload-foto`, fotoForm, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return resp.data;
  } catch (error) {
    console.error("Error uploading user photo:", error);
    throw error;
  }
}

export interface LoginPayload {
  email: string;
  contraseña: string;
}

export async function login(payload: LoginPayload) {
  try {
    const resp = await api.post("/auth/login", payload);
    return resp.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
}

export type Rol = { id: string; nombre: string };

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
  try {
    const res = await api.get(url);
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error("Error checking email existence:", error);
    throw error;
  }
}
