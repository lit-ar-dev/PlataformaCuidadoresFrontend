import { getRoles, Rol } from "@/src/api/auth";
import {
  Ciudad,
  Genero,
  getCiudadesByProvincia,
  getGeneros,
  getGrupos,
  getProvincias,
  Grupo,
  Provincia,
} from "@/src/api/utilidades";
import { useCallback, useEffect, useState } from "react";

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

  const loadCiudades = useCallback(
    async (provinciaId?: number) => {
      // clear previous ciudades immediately
      setCiudades([]);
      if (!provinciaId) return;
      try {
        const c = await getCiudadesByProvincia(provinciaId);
        setCiudades(c);
      } catch (e) {
        console.error("Error al cargar ciudades:", e);
        setCiudades([]);
      }
    },
    [setCiudades]
  );

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
