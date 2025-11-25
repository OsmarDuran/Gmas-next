"use client";

import { FormEvent, useEffect, useState } from "react";

interface TipoEquipo {
  id: number;
  nombre: string;
}

interface Marca {
  id: number;
  nombre: string;
}

interface Modelo {
  id: number;
  nombre: string;
  marcaId: number;
  tipoId: number;
}

interface Ubicacion {
  id: number;
  nombre: string;
}

interface Estatus {
  id: number;
  nombre: string;
  tipo: "EQUIPO" | "PERSONAL" | "UBICACION";
}

interface ApiError {
  error: string;
}

export default function NuevoEquipoPage() {
  const [tipos, setTipos] = useState<TipoEquipo[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [estatus, setEstatus] = useState<Estatus[]>([]);

  const [tipoId, setTipoId] = useState<number | "">("");
  const [marcaId, setMarcaId] = useState<number | "">("");
  const [modeloId, setModeloId] = useState<number | "">("");
  const [ubicacionId, setUbicacionId] = useState<number | "">("");
  const [estatusId, setEstatusId] = useState<number | "">("");

  const [numeroSerie, setNumeroSerie] = useState("");
  const [ipFija, setIpFija] = useState("");
  const [puertoEthernet, setPuertoEthernet] = useState("");
  const [notas, setNotas] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cargar catálogos base al montar
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [
          tiposRes,
          ubicacionesRes,
          estatusRes
        ] = await Promise.all([
          fetch("/api/tipos-equipo"),
          fetch("/api/ubicaciones"),
          fetch("/api/estatus?tipo=EQUIPO"),
        ]);

        if (!tiposRes.ok) throw new Error("Error al cargar tipos de equipo");
        if (!ubicacionesRes.ok) throw new Error("Error al cargar ubicaciones");
        if (!estatusRes.ok) throw new Error("Error al cargar estatus");

        const tiposData = (await tiposRes.json()) as TipoEquipo[];
        const ubicacionesData = (await ubicacionesRes.json()) as Ubicacion[];
        const estatusData = (await estatusRes.json()) as Estatus[];

        setTipos(tiposData);
        setUbicaciones(ubicacionesData);
        setEstatus(estatusData);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          "Error al cargar catálogos. Verifica que el backend esté corriendo."
        );
      }
    };

    loadInitialData();
  }, []);

  // Cuando cambia el tipo, cargar marcas
  useEffect(() => {
    const loadMarcas = async () => {
      if (tipoId === "") {
        setMarcas([]);
        setMarcaId("");
        setModelos([]);
        setModeloId("");
        return;
      }

      try {
        const res = await fetch(`/api/marcas?tipoId=${tipoId}`);
        if (!res.ok) throw new Error("Error al cargar marcas");
        const data = (await res.json()) as Marca[];
        setMarcas(data);
        setMarcaId("");
        setModelos([]);
        setModeloId("");
      } catch (error) {
        console.error(error);
        setErrorMessage("Error al cargar marcas para el tipo seleccionado.");
      }
    };

    loadMarcas();
  }, [tipoId]);

  // Cuando cambian tipo y marca, cargar modelos
  useEffect(() => {
    const loadModelos = async () => {
      if (tipoId === "" || marcaId === "") {
        setModelos([]);
        setModeloId("");
        return;
      }

      try {
        const res = await fetch(
          `/api/modelos?tipoId=${tipoId}&marcaId=${marcaId}`
        );
        if (!res.ok) throw new Error("Error al cargar modelos");
        const data = (await res.json()) as Modelo[];
        setModelos(data);
        setModeloId("");
      } catch (error) {
        console.error(error);
        setErrorMessage("Error al cargar modelos para la marca y tipo seleccionados.");
      }
    };

    loadModelos();
  }, [tipoId, marcaId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validar campos requeridos
    if (tipoId === "") {
      setErrorMessage("Debes seleccionar un tipo de equipo.");
      return;
    }

    if (marcaId === "") {
      setErrorMessage("Debes seleccionar una marca.");
      return;
    }

    if (modeloId === "") {
      setErrorMessage("Debes seleccionar un modelo.");
      return;
    }

    if (ubicacionId === "") {
      setErrorMessage("Debes seleccionar una ubicación.");
      return;
    }

    if (estatusId === "") {
      setErrorMessage("Debes seleccionar un estado.");
      return;
    }

    setLoading(true);

    try {
      const payload: {
        tipoId: number;
        marcaId: number;
        modeloId: number;
        ubicacionId: number;
        estatusId: number;
        numeroSerie?: string;
        ipFija?: string;
        puertoEthernet?: string;
        notas?: string;
      } = {
        tipoId: Number(tipoId),
        marcaId: Number(marcaId),
        modeloId: Number(modeloId),
        ubicacionId: Number(ubicacionId),
        estatusId: Number(estatusId),
      };

      if (numeroSerie.trim() !== "") payload.numeroSerie = numeroSerie.trim();
      if (ipFija.trim() !== "") payload.ipFija = ipFija.trim();
      if (puertoEthernet.trim() !== "") payload.puertoEthernet = puertoEthernet.trim();
      if (notas.trim() !== "") payload.notas = notas.trim();

      const res = await fetch("/api/equipos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as ApiError;
        throw new Error(data.error || "Error al crear el equipo");
      }

      // Si llega aquí, todo OK
      setSuccessMessage("Equipo creado correctamente.");
      // Limpiar algunos campos (tipo opcional, según prefieras)
      setNumeroSerie("");
      setIpFija("");
      setPuertoEthernet("");
      setNotas("");
      // Si quieres, también podrías resetear tipo/marca/modelo/ubicación:
      // setTipoId(""); setMarcaId(""); setModeloId(""); setUbicacionId("");
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Error desconocido al crear el equipo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Alta de equipo</h1>

      {successMessage && (
        <div className="mb-4 rounded border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-800">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de equipo */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tipo de equipo <span className="text-red-500">*</span>
          </label>
          <select
            value={tipoId}
            onChange={(e) =>
              setTipoId(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="">Selecciona un tipo</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Marca (dependiente de tipo) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Marca <span className="text-red-500">*</span>
          </label>
          <select
            value={marcaId}
            onChange={(e) =>
              setMarcaId(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full border rounded px-3 py-2 text-sm"
            disabled={tipoId === "" || marcas.length === 0}
          >
            <option value="">
              {tipoId === ""
                ? "Primero selecciona un tipo"
                : marcas.length === 0
                  ? "No hay marcas asociadas"
                  : "Selecciona una marca"}
            </option>
            {marcas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Modelo (dependiente de tipo + marca) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Modelo <span className="text-red-500">*</span>
          </label>
          <select
            value={modeloId}
            onChange={(e) =>
              setModeloId(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full border rounded px-3 py-2 text-sm"
            disabled={
              tipoId === "" || marcaId === "" || modelos.length === 0
            }
          >
            <option value="">
              {tipoId === "" || marcaId === ""
                ? "Primero selecciona tipo y marca"
                : modelos.length === 0
                  ? "No hay modelos disponibles"
                  : "Selecciona un modelo"}
            </option>
            {modelos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Ubicación <span className="text-red-500">*</span>
          </label>
          <select
            value={ubicacionId}
            onChange={(e) =>
              setUbicacionId(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="">Selecciona una ubicación</option>
            {ubicaciones.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Estatus */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Estatus <span className="text-red-500">*</span>
          </label>
          <select
            value={estatusId}
            onChange={(e) =>
              setEstatusId(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="">Selecciona un estado</option>
            {estatus.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Número de serie */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Número de serie
          </label>
          <input
            type="text"
            value={numeroSerie}
            onChange={(e) => setNumeroSerie(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Ej. ABC12345"
          />
        </div>

        {/* IP fija */}
        <div>
          <label className="block text-sm font-medium mb-1">
            IP fija
          </label>
          <input
            type="text"
            value={ipFija}
            onChange={(e) => setIpFija(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Ej. 192.168.1.10"
          />
        </div>

        {/* Puerto Ethernet */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Puerto Ethernet
          </label>
          <input
            type="text"
            value={puertoEthernet}
            onChange={(e) => setPuertoEthernet(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Ej. 0/1/1"
          />
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Notas
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            rows={3}
            placeholder="Observaciones, estado físico, etc."
          />
        </div>

        {/* Botón guardar */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar equipo"}
          </button>
        </div>
      </form>
    </div>
  );
}
