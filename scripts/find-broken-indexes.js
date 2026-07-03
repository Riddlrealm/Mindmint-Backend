#!/usr/bin/env node
/* eslint-disable */
const fs = require('fs');
const path = require('path');

const SRC = path.join(process.cwd(), 'src');

const COLUMN_DECORATOR_RE =
  /@(?:PrimaryGeneratedColumn|PrimaryColumn|Column|CreateDateColumn|UpdateDateColumn|DeleteDateColumn|VersionColumn)\b[^\n]*\n[^\n]*?(\w+)\s*[:?]/g;

const INDEX_RE = /@Index\s*\(\s*\[([^\]]*)\]\s*\)/g;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.entity.ts')) out.push(full);
  }
  return out;
}

function stripQuotes(s) {
  return s.replace(/['"`]/g, '').trim();
}

function parseIndexColumns(s) {
  return s.split(',').map(stripQuotes).filter(Boolean);
}

function findBrokenIndexes(file) {
  const src = fs.readFileSync(file, 'utf8');

  // Match every class, capturing the prefix (decorators before the class) and the body.
  const classRe = /([\s\S]*?)export\s+class\s+(\w+)\s*\{([\s\S]*?)\n\s*\}/g;

  const broken = [];

  let m;
  while ((m = classRe.exec(src)) !== null) {
    const prefix = m[1];
    const className = m[2];
    const body = m[3];

    const columns = new Set();
    COLUMN_DECORATOR_RE.lastIndex = 0;
    let cm;
    while ((cm = COLUMN_DECORATOR_RE.exec(body)) !== null) {
      columns.add(cm[1]);
    }

    // Find @Index in prefix OR body
    const combined = prefix + '\n' + body;
    INDEX_RE.lastIndex = 0;
    let im;
    while ((im = INDEX_RE.exec(combined)) !== null) {
      const refs = parseIndexColumns(im[1]);
      const missing = refs.filter((r) => !columns.has(r));
      if (missing.length === 0) continue;
      const absIdx = src.indexOf(im[0]);
      const lineNumber = absIdx >= 0 ? src.slice(0, absIdx).split('\n').length : -1;
      broken.push({
        file: path.relative(process.cwd(), file),
        className,
        indexText: im[0],
        missingColumns: missing,
        lineNumber,
      });
    }
  }
  return broken;
}

function main() {
  const files = walk(SRC);
  const all = [];
  for (const f of files) {
    all.push(...findBrokenIndexes(f));
  }
  fs.writeFileSync('/tmp/broken-indexes.json', JSON.stringify(all, null, 2));
  console.log(`Files scanned: ${files.length}`);
  console.log(`Broken @Index references: ${all.length}`);
  console.log('-'.repeat(80));
  for (const b of all) {
    console.log(`${b.file}:${b.lineNumber}  [${b.className}]  missing: ${b.missingColumns.join(', ')}`);
  }
}

main();
