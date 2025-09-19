import { ActionError, defineAction } from "astro:actions";
import type { iRecomendacion } from "../lib/interfaces/recomendacion";
import { supabase } from "../lib/supabase";
import type { iCategory } from "../lib/interfaces/category";
export const categorias = {
  getCategorias: defineAction({
    handler: async () => {
      const { data, error } = await supabase.from("categorias").select("*");

      if (error) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Error obteniendo las categorias",
        });
      }
      const categories: iCategory[] = data;
      return { categories, error };
    },
  }),
};
