// Kleiner lokaler Server: liefert generate.html aus und speichert die vom Browser gezeichneten PNGs.
//   node branding/server.mjs   ->  http://localhost:4599
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, "social");

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(fs.readFileSync(path.join(dir, "generate.html")));
    } else if (req.method === "POST" && url.pathname === "/save") {
      const name = (url.searchParams.get("name") || "").replace(/[^\w/-]/g, "");
      const chunks = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => {
        const file = path.join(out, `${name}.png`);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, Buffer.concat(chunks));
        res.writeHead(200).end("ok");
      });
    } else res.writeHead(404).end();
  })
  .listen(4599, () => console.log("http://localhost:4599"));
