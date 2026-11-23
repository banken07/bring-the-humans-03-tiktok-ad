// bring-the-humans-03: copy VIDEO.json to the make.fun output directory.
// Node 22, standard library only, no network. Deterministic: the output
// bytes are exactly the bytes of VIDEO.json in the repository root.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const source = join(repoRoot, "VIDEO.json");

// Fail loudly instead of shipping a placeholder: VIDEO.json must name a
// real TikTok video URL (no unreplaced <handle> / <id> placeholders).
const entry = JSON.parse(readFileSync(source, "utf8"));
const url = entry?.url;
if (
  typeof url !== "string" ||
  !url.startsWith("https://www.tiktok.com/") ||
  url.includes("<") ||
  url.includes(">")
) {
  throw new Error(
    `VIDEO.json does not name a real TikTok video URL yet: ${JSON.stringify(url)}`,
  );
}
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const destination = join(outDir, "VIDEO.json");
copyFileSync(source, destination);

// Verify the copy is byte-identical to the source, so a silent partial
// write can never pass as a successful run.
const sourceBytes = readFileSync(source);
const copiedBytes = readFileSync(destination);
if (!sourceBytes.equals(copiedBytes)) {
  throw new Error(`VIDEO.json copy mismatch: ${source} -> ${destination}`);
}
