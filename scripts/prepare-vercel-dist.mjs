/**
 * Expo "server" web export splits output into dist/client (assets) and
 * dist/server (pre-rendered HTML). Vercel static hosting needs both merged.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const outDir = join(root, "dist-vercel");
const clientDir = join(root, "dist", "client");
const serverDir = join(root, "dist", "server");

if (!existsSync(clientDir) || !existsSync(serverDir)) {
  console.error(
    "Expected dist/client and dist/server — run `npx expo export -p web` first.",
  );
  process.exit(1);
}

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });

cpSync(clientDir, outDir, { recursive: true });

const copyHtmlTree = (from, to) => {
  for (const name of ["index.html", "catalog.html", "settings.html", "add-resource.html", "+not-found.html", "_sitemap.html"]) {
    const src = join(from, name);
    if (existsSync(src)) {
      cpSync(src, join(to, name));
    }
  }
  const resourceDir = join(from, "resource");
  if (existsSync(resourceDir)) {
    cpSync(resourceDir, join(to, "resource"), { recursive: true });
  }
};

copyHtmlTree(serverDir, outDir);

console.log("Prepared Vercel output at dist-vercel/");
