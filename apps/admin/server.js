import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' };
const port = Number(process.env.PORT || 5174);

createServer(async (req, res) => {
  const requestPath = new URL(req.url, 'http://localhost').pathname;
  if (requestPath === '/') {
    res.writeHead(302, { Location: '/design/standalone.html' });
    res.end();
    return;
  }
  const requested = requestPath;
  const filePath = normalize(join(root, requested));
  if (!filePath.startsWith(root)) { res.writeHead(403); res.end('Forbidden'); return; }
  try {
    const content = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': mime[extname(filePath)] || 'application/octet-stream' });
    res.end(content);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, () => console.log(`CredX Admin Portal listening on http://localhost:${port}`));
