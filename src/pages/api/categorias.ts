import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const GET: APIRoute = async ({ params }) => {
  const { data, error } = await supabase.from("categorias").select("*");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
