// Cloudflare Pages Worker for SPA routing
// Serves static assets from the out/ directory
// Falls back to index.html for all non-asset routes

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Try to serve the static file first
    let response = await env.ASSETS.fetch(request);

    // If 404 and not a static asset request, serve index.html (SPA)
    if (response.status === 404 && !url.pathname.includes('.')) {
      const indexRequest = new Request(`${url.origin}/index.html`, request);
      response = await env.ASSETS.fetch(indexRequest);
    }

    return response;
  },
};
