#!/usr/bin/env node
/* eslint-disable */
// Read /tmp/broken-indexes.json and, for each broken @Index, comment it out in the source file.
// We identify the line by its 1-based line number and comment the entire physical line containing
// the `@Index([...])` decorator (with a "// " prefix).
//
// The list of broken indexes already contains the matching decorator text, including any
// surrounding whitespace stripped. To avoid double-commenting we look at the indexText's leading
// "@Index" but match on the full bracketed list. For simplicity, we match on the indexText.
// If the file has been modified and text no longer matches, we skip it (idempotent safety).

const fs = require('fs');
const path = require('path');

const INPUT = '/tmp/broken-indexes.json';

function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`Missing ${INPUT}; run scripts/find-broken-indexes.js first.`);
    process.exit(1);
  }
  const broken = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  // Group by file to avoid re-reading
  const byFile = new Map();
  for (const b of broken) {
    if (!byFile.has(b.file)) byFile.set(b.file, []);
    byFile.get(b.file).push(b);
  }

  let totalFixed = 0;
  let totalSkippedAlready = 0;

  for (const [relFile, entries] of byFile.entries()) {
    const absFile = path.join(process.cwd(), relFile);
    const src = fs.readFileSync(absFile, 'utf8');
    const lines = src.split('\n');

    let modifiedAny = false;
    for (const e of entries) {
      const idx = e.lineNumber - 1;
      if (idx < 0 || idx >= lines.length) continue;
      const trimmed = lines[idx].trim();
      // Skip if already commented
      if (trimmed.startsWith('//')) {
        totalSkippedAlready++;
        continue;
      }
      // Verify the line actually contains @Index with the expected columns
      if (!/@Index\s*\(/.test(lines[idx]) || !lines[idx].includes(e.indexText.trim())) {
        // Try to find a nearby line containing this exact @Index text
        const needle = e.indexText.trim();
        let found = -1;
        for (let i = Math.max(0, idx - 3); i <= Math.min(lines.length - 1, idx + 3); i++) {
          if (lines[i].includes(needle)) { found = i; break; }
        }
        if (found < 0) {
          // Skip; can't safely touch it
          continue;
        }
        lines[found] = '// ' + lines[found];
        modifiedAny = true;
        totalFixed++;
        continue;
      }
      lines[idx] = '// ' + lines[idx];
      modifiedAny = true;
      totalFixed++;
    }

    if (modifiedAny) {
      fs.writeFileSync(absFile, lines.join('\n'));
    }
  }

  console.log(`Fixed: ${totalFixed}`);
  console.log(`Already commented (skipped): ${totalSkippedAlready}`);
}

main();
