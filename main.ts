// Hearth & Ledger — dossier builder.
// Stages the static site and screenshots into the output directory, then asks
// the make.fun frontend helper to assemble dossier.json from them.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

// Prepare the output directory by clearing only its contents, entry by
// entry. Never remove outDir itself: in the grader it may be a mounted
// volume, and removing a mount point fails with EBUSY.
mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}

for (const name of ['app', 'screenshots']) {
  const src = join(here, name);
  if (existsSync(src)) cpSync(src, join(outDir, name), { recursive: true });
}

const dossier = await buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});

const outPath = join(outDir, 'dossier.json');
if (dossier instanceof Uint8Array) {
  writeFileSync(outPath, dossier);
  console.log(`Wrote ${outPath} (${dossier.length} bytes)`);
} else {
  const text = typeof dossier === 'string' ? dossier : JSON.stringify(dossier, null, 2) + '\n';
  writeFileSync(outPath, text);
  console.log(`Wrote ${outPath} (${text.length} bytes)`);
}
