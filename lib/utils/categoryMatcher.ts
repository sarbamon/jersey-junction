import { JerseyProduct } from '../../types';

function toSlug(str: string): string {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Dynamically matches a product against any category key, slug, or name.
 * Supports standard categories and any custom category created by the Admin.
 */
export function matchesCategory(p: JerseyProduct, catKey: string): boolean {
  if (!catKey || catKey === 'all') return true;

  const keyLower = catKey.toLowerCase().trim();
  const keySlug = toSlug(keyLower);

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

  // 1. Direct exact or slug match on the product's category, sport, or subcategory
  if (
    catLower === keyLower ||
    (catSlug && catSlug === keySlug) ||
    sportLower === keyLower ||
    (sportSlug && sportSlug === keySlug) ||
    subcatLower === keyLower ||
    (subcatSlug && subcatSlug === keySlug)
  ) {
    return true;
  }

  // 2. If the product explicitly belongs to a custom category (e.g. 'fulsleave', 'Jackets', etc.)
  // and does not match the requested category, NEVER let title/tag keyword heuristics hijack it.
  const hasDistinctCategory = Boolean(
    catLower &&
    catLower !== 'soccer' &&
    catLower !== 'general' &&
    catLower !== 'uncategorized'
  );

  if (hasDistinctCategory) {
    // If one contains the other (e.g. 'Fan' in 'Fan Version')
    if (catLower.includes(keyLower) || (keyLower.length > 2 && keyLower.includes(catLower))) {
      return true;
    }
    // Explicitly assigned to a different category
    return false;
  }

  // 3. Fallback for legacy products without an explicit category set
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
