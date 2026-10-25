// Tiny zero-dependency static server for previewing the exported site in `out/`.
// Usage: node scripts/serve-static.mjs [--port 3000]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { gzipSync } from "node:zlib";

const root = join(process.cwd(), "out");
const portFlag = process.argv.indexOf("--port");
const port = Number(portFlag > -1 ? process.argv[portFlag + 1] : process.env.PORT ?? 3000);

const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".txt": "text/plain",
  ".woff2": "font/woff2", ".mp4": "video/mp4", ".webm": "video/webm", ".vtt": "text/vtt", ".pdf": "application/pdf",
};

async function resolveFile(urlPath) {
  const safe = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const candidate = join(root, safe);
  if (!candidate.startsWith(root)) return null;
  try {
    const s = await stat(candidate);
    if (s.isDirectory()) return resolveFile(join(safe, "index.html"));
    return candidate;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const file = (await resolveFile(req.url ?? "/")) ?? join(root, "404.html");
  const status = file.endsWith("404.html") && !(req.url ?? "").includes("404") ? 404 : 200;
  try {
    let body = await readFile(file);
    const headers = { "Content-Type": types[extname(file)] ?? "application/octet-stream" };
    // Compress text like a real host (Vercel) would, so local Lighthouse numbers are realistic.
    if (/text|javascript|json|svg/.test(headers["Content-Type"]) && /gzip/.test(req.headers["accept-encoding"] ?? "")) {
      body = gzipSync(body);
      headers["Content-Encoding"] = "gzip";
    }
    if ((req.url ?? "").startsWith("/_next/static/")) headers["Cache-Control"] = "public, max-age=31536000, immutable";
    res.writeHead(status, headers);
    res.end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`Serving out/ at http://127.0.0.1:${port}`));
