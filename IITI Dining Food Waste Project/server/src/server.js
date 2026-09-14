import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

// Load server/.env reliably regardless of current working directory.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const port = process.env.PORT || 4000;

async function start() {
  // Import after dotenv so env-dependent modules initialize correctly.
  const [{ default: app }, { connectToDatabase }] = await Promise.all([
    import('./app.js'),
    import('./utils/db.js')
  ]);

  await connectToDatabase();
  const server = http.createServer(app);
  server.listen(port, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://0.0.0.0:${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});


