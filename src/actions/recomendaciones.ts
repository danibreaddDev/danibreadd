import { ActionError, defineAction } from "astro:actions";
import type { iRecomendacion } from "../lib/interfaces/recomendacion";
import { supabase } from "../lib/supabase";
import { z } from "astro:content";
export const recomendaciones = {
  getRecomendaciones: defineAction({
    handler: async () => {
      let query = supabase
        .from("recomendaciones")
        .select("id,nombre,comentario,votos,url,categoria:categorias(nombre)");

      const { data, error } = await query.order("votos", { ascending: false });

      if (error) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Error obteniendo las recomendaciones",
        });
      }

      const recomendaciones: iRecomendacion[] = data.map((recomendacion) => ({
        ...recomendacion,
        categoria: getCategoryForMap(recomendacion),
      }));

      return { recomendaciones, error };
    },
  }),
  actualizarVotos: defineAction({
    accept: "form",
    input: z.object({ id: z.string() }),
    handler: async (input) => {
      const { data: votosActuales, error: errorVotos } = await supabase
        .from("recomendaciones")
        .select("votos")
        .eq("id", input.id)
        .single();
      if (errorVotos) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Error obteniendo votos",
        });
      }
      const nuevosVotos = Number(votosActuales.votos + 1);
      const { error: errorActualizarVotos } = await supabase
        .from("recomendaciones")
        .update({ votos: nuevosVotos })
        .eq("id", input.id);
      if (errorActualizarVotos) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Error obteniendo votos",
        });
      }
      return { nuevosVotos };
    },
  }),
  filtrarRecomendaciones: defineAction({
    accept: "form",
    input: z.object({ category: z.string() }),
    handler: async (input) => {
      let query = supabase
        .from("recomendaciones")
        .select("id,nombre,comentario,votos,url,categoria:categorias(nombre)");

      if (input.category && input.category !== "all") {
        query = query.eq("categoria_id", input.category);
      }
      const { data, error } = await query.order("votos", { ascending: false });

      if (error) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Error obteniendo las recomendaciones",
        });
      }

      const recomendaciones: iRecomendacion[] = data.map((recomendacion) => ({
        ...recomendacion,
        categoria: getCategoryForMap(recomendacion),
      }));

      return { recomendaciones };
    },
  }),
};
function getCategoryForMap(recomendacion: any) {
  return recomendacion.categoria.nombre;
}
