/**
 * Vercel serverless entry point.
 *
 * Every `/api/*` request lands here and is handed to the same Express app the
 * local dev server uses, so there is one implementation of the routes, auth and
 * Neon access.
 *
 * The import is dynamic on purpose: if the app cannot boot (missing
 * DATABASE_URL, a bad module specifier) Vercel would otherwise answer with an
 * opaque 500 HTML page. This way the failure is a JSON message you can read in
 * the browser or in the function logs.
 */
type NodeHandler = (req: unknown, res: unknown) => void;

let app: NodeHandler | null = null;

export default async function handler(req: any, res: any) {
  try {
    if (!app) {
      const mod = await import('../server/app.js');
      app = mod.default as NodeHandler;
    }
    return app(req, res);
  } catch (err) {
    console.error('[api] failed to boot', err);
    const detail = err instanceof Error ? err.message : String(err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: false, error: 'API failed to start', detail }));
  }
}
