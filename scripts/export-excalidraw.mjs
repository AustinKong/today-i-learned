import { exportDiagram } from "@moona3k/excalidraw-export";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const notesRoot = path.join(root, "notes");
const markdownExtensions = new Set([".md", ".markdown"]);

const excalidrawFiles = [];
const markdownFiles = [];

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      await collectFiles(path.join(dir, entry.name));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const file = path.join(dir, entry.name);
    const extension = path.extname(entry.name).toLowerCase();

    if (extension === ".excalidraw") {
      excalidrawFiles.push(file);
    } else if (markdownExtensions.has(extension)) {
      markdownFiles.push(file);
    }
  }
}

function toDisplayPath(file) {
  return path.relative(root, file) || ".";
}

function replaceExcalidrawEmbeds(markdown) {
  return markdown
    .replace(/(!\[\[[^\]\n]*?)\.excalidraw((?:[|#][^\]\n]*)?\]\])/g, "$1.svg$2")
    .replace(/(!\[[^\]\n]*\]\([^)\n]*?)\.excalidraw((?:[?#][^)\n\s]*)?(?:\s+['"][^)\n]*['"])?\))/g, "$1.svg$2");
}

await collectFiles(notesRoot);

for (const inputFile of excalidrawFiles.sort()) {
  const outputFile = inputFile.replace(/\.excalidraw$/i, ".svg");
  exportDiagram(inputFile, outputFile, { format: "svg"/*, background: false*/ });
  console.log(`exported ${toDisplayPath(outputFile)}`);
}

for (const markdownFile of markdownFiles.sort()) {
  const original = await readFile(markdownFile, "utf8");
  const updated = replaceExcalidrawEmbeds(original);

  if (updated !== original) {
    await writeFile(markdownFile, updated);
    console.log(`updated ${toDisplayPath(markdownFile)}`);
  }
}
