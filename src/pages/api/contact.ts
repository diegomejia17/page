export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    const data = await request.json();

    // Validate data
    if (!data.name || !data.email || !data.message) {
        return new Response(
            JSON.stringify({
                message: 'Faltan campos requeridos',
            }),
            { status: 400 }
        );
    }

    // Simulate storing data or sending email
    console.log('Mensaje recibido:', data);

    return new Response(
        JSON.stringify({
            message: '¡Mensaje enviado con éxito! Te responderé pronto.',
        }),
        { status: 200 }
    );
};
