export type FormValues = {
  usuario: { email: string; contraseña: string };
  persona: {
    nombre: string;
    apellido: string;
    fechaDeNacimiento: Date | undefined;
    telefono?: string | undefined;
    provinciaId?: number | undefined;
    ciudadId: number | undefined;
    generoId?: number | undefined;
  };
  cliente?: { domicilio?: string | undefined };
  cuidador?: {
    descripcion?: string | undefined;
    experiencia?: string[] | undefined;
    formacion?: string[] | undefined;
    tarifas?:
      | {
          precio: number;
          servicios?: string[] | undefined;
          grupoId: number;
        }[]
      | undefined;
    tags?: string[] | undefined;
  };
  rolesId: number[];
};
