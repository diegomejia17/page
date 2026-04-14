export const prerender = false;

import type { APIRoute } from "astro";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("El email no es válido"),
  message: z.string().min(1, "El mensaje es requerido"),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate data
    const result = contactSchema.safeParse(data);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          message: "Datos inválidos",
          errors: result.error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    const WEBHOOK_URL = import.meta.env.N8N_WEBHOOK_URL || import.meta.env.API_SECRET_URL;
    const authUser = import.meta.env.API_SECRET_USER;
    const authPass = import.meta.env.API_SECRET_PASSWORD;

    if (!WEBHOOK_URL) {
      console.error("Webhook URL is not defined");
      return new Response(
        JSON.stringify({
          message: "Error de configuración del servidor",
        }),
        { status: 500 }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authUser && authPass) {
      headers["Authorization"] = `Basic ${btoa(`${authUser}:${authPass}`)}`;
    }

    // Forward to n8n
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(result.data),
    });

    if (!response.ok) {
      throw new Error(`N8N webhook error: ${response.statusText}`);
    }

    return new Response(
      JSON.stringify({
        message: "¡Mensaje enviado con éxito!",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting form:", error);
    return new Response(
      JSON.stringify({
        message: "Error al enviar el mensaje. Por favor intenta de nuevo.",
      }),
      { status: 500 }
    );
  }
};
