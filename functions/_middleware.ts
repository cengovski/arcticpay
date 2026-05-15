// functions/_middleware.ts
// Cloudflare Pages middleware for SPA routing
// Serves index.html for all non-static routes

export async function onRequest(context: any) {
  const { request, next } = context;
  const url = new URL(request.url);

  // Skip static assets
  if (url.pathname.startsWith("/_next/") ||
      url.pathname.startsWith("/static/") ||
      url.pathname.includes(".")) {
    return next();
  }

  // For all other routes, serve index.html (SPA routing)
  const response = await next();

  // If 404, try serving index.html
  if (response.status === 404) {
    const indexUrl = new URL("/", url.origin);
    const indexResponse = await fetch(indexUrl.toString(), request);
    if (indexResponse.ok) {
      return new Response(indexResponse.body, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
          ...Object.fromEntries(indexResponse.headers.entries()),
        },
      });
    }
  }

  return response;
}
