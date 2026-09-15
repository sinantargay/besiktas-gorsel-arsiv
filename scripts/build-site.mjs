import { mkdir, readFile, rm, writeFile, cp, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const [html, logo, flag, ortakoy, dolmabahce, kartal, worker] = await Promise.all([
  readFile(resolve(root, "site/index.html"), "utf8"),
  readFile(resolve(root, "site/besiktas-belediyesi-logo.png")),
  readFile(resolve(root, "site/turk-bayragi.png")),
  readFile(resolve(root, "site/ortakoy.jpg")),
  readFile(resolve(root, "site/dolmabahce.jpg")),
  readFile(resolve(root, "site/kartal.jpg")),
  readFile(resolve(root, "worker/index.js"), "utf8"),
]);
const referenceDirectory = resolve(root, "site/reference-people");
const referenceFiles = (await readdir(referenceDirectory)).filter((name) => name.toLowerCase().endsWith(".jpg")).sort();
const referenceEntries = await Promise.all(referenceFiles.map(async (name) => [name, (await readFile(resolve(referenceDirectory, name))).toString("base64")]));
const referenceObject = Object.fromEntries(referenceEntries);
await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, "server"), { recursive: true });
await mkdir(resolve(output, ".openai"), { recursive: true });
const generated = `const PAGE = ${JSON.stringify(html)};\nconst LOGO_BYTES = Uint8Array.from(atob(${JSON.stringify(logo.toString("base64"))}), c => c.charCodeAt(0));\nconst FLAG_BYTES = Uint8Array.from(atob(${JSON.stringify(flag.toString("base64"))}), c => c.charCodeAt(0));\nconst ORTAKOY_BYTES = Uint8Array.from(atob(${JSON.stringify(ortakoy.toString("base64"))}), c => c.charCodeAt(0));\nconst DOLMABAHCE_BYTES = Uint8Array.from(atob(${JSON.stringify(dolmabahce.toString("base64"))}), c => c.charCodeAt(0));\nconst KARTAL_BYTES = Uint8Array.from(atob(${JSON.stringify(kartal.toString("base64"))}), c => c.charCodeAt(0));\nconst REFERENCE_IMAGES = Object.fromEntries(Object.entries(${JSON.stringify(referenceObject)}).map(([name,data]) => [name, Uint8Array.from(atob(data), c => c.charCodeAt(0))]));\n${worker}`;
await writeFile(resolve(output, "server/index.js"), generated);
await cp(resolve(root, ".openai/hosting.json"), resolve(output, ".openai/hosting.json"));
await cp(resolve(root, ".openai/drizzle"), resolve(output, ".openai/drizzle"), { recursive: true });
console.log("Server-backed site built.");
