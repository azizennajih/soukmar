/** Minimal CSV reader for the dealer import: handles a BOM, quoted fields with embedded delimiters, quotes and
 * line breaks, and picks the delimiter (`,` `;` or tab — Excel in German/French locales saves with `;`) from the
 * header line. Returns one object per data row, keyed by the lower-cased header names. */
export function parseCsv(input: string): Record<string, string>[] {
  const text = input.replace(/^﻿/, '');
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const delimiter = [';', '\t', ','].map(d => ({ d, n: firstLine.split(d).length })).sort((a, b) => b.n - a.n)[0]!.d;

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === delimiter) { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      rows.push(row); row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }

  const [header, ...data] = rows.filter(r => r.some(cell => cell.trim() !== ''));
  if (!header) return [];
  const names = header.map(h => h.trim().toLowerCase());
  return data.map(r => Object.fromEntries(names.map((n, i) => [n, (r[i] ?? '').trim()])));
}
