import { getCuidadores, type Cuidador } from "@/src/api/cuidadores";
import { useCallback, useEffect, useState } from "react";

export function useCuidadores() {
  const [cuidadores, setCuidadores] = useState<Cuidador[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCuidadores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCuidadores();
      setCuidadores(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error fetching cuidadores:", err);
      setError(
        err?.message ?? "No se pudieron cargar cuidadores. Intentá de nuevo."
      );
      setCuidadores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getCuidadores();
        if (!mounted) return;
        setCuidadores(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error fetching cuidadores:", err);
        if (mounted)
          setError(
            err?.message ??
              "No se pudieron cargar cuidadores. Intentá de nuevo."
          );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    await fetchCuidadores();
  }, [fetchCuidadores]);

  return {
    cuidadores,
    loading,
    error,
    refresh,
  };
}
