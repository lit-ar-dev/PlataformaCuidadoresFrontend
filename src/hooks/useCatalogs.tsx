import { useEffect, useState } from "react";
import {
  getProvincias,
  getGeneros,
  getCiudadesByProvincia,
  Provincia,
  Genero,
  Ciudad,
  Grupo,
  getGrupos,
} from "../services/utilidades";
import { getRoles, Rol } from "../services/auth";

export function useCatalogs() {
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [p, g, r, G] = await Promise.all([
          getProvincias(),
          getGeneros(),
          getRoles(),
          getGrupos(),
        ]);
        if (!mounted) return;
        setProvincias(p);
        setGeneros(g);
        setRoles(r);
        setGrupos(G);
      } catch (e) {
        console.error(e);
        if (mounted) setError("No se pudieron cargar catálogos");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const loadCiudades = async (provinciaId?: number) => {
    setCiudades([]);
    if (!provinciaId) return;
    const c = await getCiudadesByProvincia(provinciaId);
    setCiudades(c);
  };

  return {
    provincias,
    ciudades,
    generos,
    roles,
    grupos,
    loading,
    error,
    loadCiudades,
  };
}
