import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";
import type { iRecomendacion } from "../../lib/interfaces/recomendacion";
function getCategoryForMap(recomendacion: any) {
  return recomendacion.categoria.nombre;
}
export const GET: APIRoute = async ({ request, params }) => {
  const category = request.url.split("?")[1].split("=")[1];

  let query = supabase
    .from("recomendaciones")
    .select("id,nombre,comentario,votos,url,categoria:categorias(nombre)");

  if (category && category !== "all") {
    query = query.eq("categoria_id", category);
  }
  const { data, error } = await query.order("votos", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const recomendaciones: iRecomendacion[] = data.map((recomendacion) => ({
    ...recomendacion,
    categoria: getCategoryForMap(recomendacion),
  }));

  return new Response(JSON.stringify(recomendaciones), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const recomendacionId = formData.get("id");

  if (!recomendacionId) {
    return new Response("ID faltante", { status: 400 });
  }

  const { data: recom } = await supabase
    .from("recomendaciones")
    .select("votos")
    .eq("id", recomendacionId)
    .single();

  const { data, error } = await supabase
    .from("recomendaciones")
    .update({ votos: recom?.votos + 1 })
    .eq("id", recomendacionId);

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  // Redirigir de nuevo a la página de recomendaciones
  return new Response(null, {
    status: 303,
    headers: {
      Location: "/recomendaciones",
    },
  });
};
