/**
 * Local/dev entry point. On Vercel this file is not used: `api/[...path].ts`
 * hands the same app to the serverless runtime.
 */
import 'dotenv/config';
import app from './app';

const PORT = Number(process.env.API_PORT) || 8787;

const server = app.listen(PORT, () => {
  console.log(`TrainWise API  http://localhost:${PORT}`);
  console.log(`Neon           ${process.env.DATABASE_URL ? 'DATABASE_URL loaded' : 'DATABASE_URL missing'}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already taken. Stop the other process or set API_PORT=8790.`);
    process.exit(1);
  }
  throw err;
});
