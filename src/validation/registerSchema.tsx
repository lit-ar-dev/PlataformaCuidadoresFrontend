import * as Yup from "yup";

export const usuarioSchema = Yup.object().shape({
  usuario: Yup.object({
    email: Yup.string().email("Email inválido").required("Email requerido"),
    contraseña: Yup.string()
      .min(6, "Mínimo 6 caracteres")
      .required("Contraseña requerida"),
    confirmarContraseña: Yup.string()
      .oneOf([Yup.ref("contraseña")], "Las contraseñas no coinciden")
      .required("Confirmar contraseña requerida"),
    foto: Yup.string().nullable(),
  }),
});

export const personaSchema = Yup.object().shape({
  persona: Yup.object({
    nombre: Yup.string().required("Nombre requerido"),
    apellido: Yup.string().required("Apellido requerido"),
    fechaDeNacimiento: Yup.date()
      .required("Fecha requerida")
      .max(new Date(), "Fecha inválida"),
    telefono: Yup.string().nullable(),
    provinciaId: Yup.number().required("Provincia requerida"),
    ciudadId: Yup.number().required("Ciudad requerida"),
    generoId: Yup.number().nullable(),
  }),
});

export const rolesSchema = Yup.object().shape({
  rolesId: Yup.array()
    .of(Yup.number().required())
    .min(2, "Seleccioná al menos un rol"),

  cliente: Yup.object({
    domicilio: Yup.string().when("rolesId", {
      is: (rolesId: number[]) => rolesId.includes(1),
      then: (schema) => schema.required("Domicilio requerido"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  }),

  cuidador: Yup.object({
    descripcion: Yup.string().when("rolesId", {
      is: (rolesId: number[]) => rolesId.includes(2),
      then: (schema) =>
        schema
          .required("Descripción requerida")
          .min(30, "Mínimo 30 caracteres"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
    experiencia: Yup.string().nullable(),
    formacion: Yup.string().nullable(),
    tarifas: Yup.array()
      .of(
        Yup.object({
          precio: Yup.number().when("rolesId", {
            is: (rolesId: number[]) => rolesId.includes(2),
            then: (schema) =>
              schema
                .typeError("Debe ser un número")
                .required("Precio requerido")
                .min(1, "Mínimo 1"),
            otherwise: (schema) => schema.notRequired().nullable(),
          }),
          servicios: Yup.array().of(Yup.string()).nullable(),
          grupoId: Yup.number().when("rolesId", {
            is: (rolesId: number[]) => rolesId.includes(2),
            then: (schema) => schema.required("Grupo requerido"),
            otherwise: (schema) => schema.notRequired().nullable(),
          }),
        })
      )
      .nullable(),
    tags: Yup.array().of(Yup.string()).nullable(),
  }),
});

export const registerSchema = [usuarioSchema, personaSchema, rolesSchema];
