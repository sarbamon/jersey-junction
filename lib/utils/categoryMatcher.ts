import { JerseyProduct } from '../../types';
import { categoryService } from '../services/categoryService';

function toSlug(str: string): string {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Dynamically matches a product against any category key, slug, or name.
 * Resolves category definitions (slug <-> name) to ensure custom categories
 * work seamlessly when filtering by slug (e.g. ?category=full-sleeve-set) or name.
 */
export function matchesCategory(
  p: JerseyProduct,
  catKey: string,
  categoryList?: Array<{ name: string; slug?: string; id?: string }>
): boolean {
  if (!catKey || catKey === 'all') return true;

  const keyLower = catKey.toLowerCase().trim();
  const keySlug = toSlug(keyLower);

  // 0. Resolve the category definition from categoryList or live cache
  const cats = categoryList && categoryList.length > 0 
    ? categoryList 
    : categoryService.getCategoriesSync();

  const matchedCatDef = cats.find(
    (c) =>
      (c.slug && c.slug.toLowerCase() === keyLower) ||
      (c.id && c.id.toLowerCase() === keyLower) ||
      (c.slug && toSlug(c.slug) === keySlug) ||
      toSlug(c.name) === keySlug ||
      c.name.toLowerCase() === keyLower ||
      (keySlug.replace(/-/g, '') === toSlug(c.name).replace(/-/g, ''))
  );

  const targetNames = new Set<string>();
  const targetSlugs = new Set<string>();

  targetNames.add(keyLower);
  targetSlugs.add(keySlug);

  if (matchedCatDef) {
    if (matchedCatDef.name) {
      targetNames.add(matchedCatDef.name.toLowerCase().trim());
      targetSlugs.add(toSlug(matchedCatDef.name));
    }
    if (matchedCatDef.slug) {
      targetNames.add(matchedCatDef.slug.toLowerCase().trim());
      targetSlugs.add(toSlug(matchedCatDef.slug));
    }
    if (matchedCatDef.id) {
      targetNames.add(matchedCatDef.id.toLowerCase().trim());
      targetSlugs.add(toSlug(matchedCatDef.id));
    }
  }

  const catRaw = String((p as any).category || '').trim();
  const catLower = catRaw.toLowerCase();
  const catSlug = toSlug(catLower);

  const sportRaw = String(p.sport || '').trim();
  const sportLower = sportRaw.toLowerCase();
  const sportSlug = toSlug(sportLower);

  const subcatRaw = String((p as any).subcategory || '').trim();
  const subcatLower = subcatRaw.toLowerCase();
  const subcatSlug = toSlug(subcatLower);

  const leagueLower = String(p.league || '').toLowerCase().trim();
  const nameLower = String(p.name || '').toLowerCase();
  const tagsLower = Array.isArray(p.tags) ? p.tags.map((t: string) => String(t || '').toLowerCase()) : [];

  // 1. Direct exact or slug match on the product's category, sport, or subcategory against resolved targets
  for (const tName of targetNames) {
    if (catLower === tName || sportLower === tName || subcatLower === tName) {
      return true;
    }
  }

  for (const tSlug of targetSlugs) {
    if (
      (catSlug && catSlug === tSlug) ||
      (sportSlug && sportSlug === tSlug) ||
      (subcatSlug && subcatSlug === tSlug)
    ) {
      return true;
    }
  }

  // 2. If the product explicitly belongs to a known category that doesn't match targets,
  // do not let generic keyword heuristics steal it into another category.
  const hasDistinctCategory = Boolean(
    catLower &&
    catLower !== 'soccer' &&
    catLower !== 'general' &&
    catLower !== 'uncategorized'
  );

  if (hasDistinctCategory) {
    return false;
  }

  // 4. Fallback for legacy products without an explicit category set
  if (keySlug === 'player-version' || keyLower.includes('player')) {
    return nameLower.includes('player') || subcatLower.includes('player') || sportLower.includes('player');
  }

  if (keySlug === 'fan-version' || keyLower.includes('fan')) {
    return nameLower.includes('fan') || subcatLower.includes('fan') || sportLower.includes('fan');
  }

  if (keySlug === 'retro' || keyLower.includes('retro') || keyLower.includes('vintage')) {
    return nameLower.includes('retro') || tagsLower.includes('retro') || subcatLower.includes('retro');
  }

  if (keySlug === 'clearance' || keyLower.includes('clearance') || keyLower.includes('sale')) {
    return nameLower.includes('clearance') || Boolean(p.originalPrice && p.originalPrice > p.price);
  }

  if (keySlug === 'formula-1' || keySlug === 'f1') {
    return leagueLower.includes('f1') || leagueLower.includes('formula') || nameLower.includes('f1');
  }

  // General fallback for legacy data: tags, league, or title
  return (
    tagsLower.includes(keyLower) ||
    tagsLower.includes(keySlug) ||
    leagueLower.includes(keyLower) ||
    nameLower.includes(keyLower)
  );
}
