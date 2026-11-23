/**
 * Vercel serverless entry point.
 *
 * Every `/api/*` request lands here and is handed to the same Express app the
 * local dev server uses, so there is one implementation of the routes, auth and
 * Neon access. Exporting the app itself is the documented Vercel Node pattern.
 */
import app from '../server/app';

export default app;
