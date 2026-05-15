// Substring search index for controls. Case-insensitive matching against
// id, name, desc, and (optional) framework cross-refs. Supports both
// in-framework search and autocomplete suggestions.

export interface Searchable {
  readonly id: string;
  readonly name: string;
  readonly desc?: string;
  readonly refs?: readonly string[];
}

export interface SearchIndex<T extends Searchable> {
  readonly items: readonly T[];
  readonly haystacks: readonly string[]; // lowercased, parallel to items
}

export function buildIndex<T extends Searchable>(items: readonly T[]): SearchIndex<T> {
  const haystacks = items.map((item) => {
    const parts = [item.id, item.name, item.desc ?? '', ...(item.refs ?? [])];
    return parts.join('').toLowerCase();
  });
  return Object.freeze({ items, haystacks });
}

export function search<T extends Searchable>(
  index: SearchIndex<T>,
  query: string,
): readonly T[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return index.items;
  const out: T[] = [];
  for (let i = 0; i < index.items.length; i += 1) {
    const hay = index.haystacks[i];
    if (hay !== undefined && hay.includes(q)) out.push(index.items[i] as T);
  }
  return Object.freeze(out);
}

// Autocomplete returns short ID/name suggestions that contain the query.
// Sorted: exact ID match first, then ID prefix matches, then name matches.
export function autocompleteSuggestions<T extends Searchable>(
  index: SearchIndex<T>,
  query: string,
  limit = 10,
): readonly { readonly id: string; readonly name: string }[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return Object.freeze([]);
  const ranked: { item: T; rank: number }[] = [];
  for (const item of index.items) {
    const id = item.id.toLowerCase();
    const name = item.name.toLowerCase();
    let rank = -1;
    if (id === q) rank = 0;
    else if (id.startsWith(q)) rank = 1;
    else if (id.includes(q)) rank = 2;
    else if (name.includes(q)) rank = 3;
    if (rank >= 0) ranked.push({ item, rank });
  }
  ranked.sort((a, b) => a.rank - b.rank);
  const sliced = ranked.slice(0, Math.max(0, limit));
  return Object.freeze(sliced.map(({ item }) => ({ id: item.id, name: item.name })));
}
