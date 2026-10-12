import { JerseyProduct } from '../../types';

export function matchesCategory(p: JerseyProduct, catKey: string): boolean {
  if (!catKey || catKey === 'all') return true;

  const keyLower = catKey.toLowerCase().trim();
  const nameLower = (p.name || '').toLowerCase();
  const sportLower = (p.sport || '').toLowerCase();
  const catLower = ((p as any).category || '').toLowerCase();
  const subcatLower = ((p as any).subcategory || '').toLowerCase();
  const leagueLower = (p.league || '').toLowerCase();
  const tagsLower = Array.isArray(p.tags) ? p.tags.map((t: string) => t.toLowerCase()) : [];

  // Direct exact match
  if (
    sportLower === keyLower ||
    catLower === keyLower ||
    subcatLower === keyLower
  ) {
    return true;
  }

  // Handle category IDs / slugs / names:
  if (keyLower === 'player-version' || keyLower.includes('player')) {
    if (catLower.includes('fan') || sportLower === 'fan version' || sportLower === 'fan-version') {
      return false;
    }
    return (
      sportLower === 'player-version' ||
      sportLower === 'player version' ||
      catLower.includes('player') ||
      nameLower.includes('player') ||
      subcatLower.includes('player')
    );
  }

  if (keyLower === 'fan-version' || keyLower.includes('fan')) {
    if (catLower.includes('player') || sportLower === 'player version' || sportLower === 'player-version') {
      return false;
    }
    return (
      sportLower === 'fan-version' ||
      sportLower === 'fan version' ||
      catLower.includes('fan') ||
      nameLower.includes('fan') ||
      subcatLower.includes('fan')
    );
  }

  if (keyLower === 'set' || keyLower.includes('full set') || keyLower.includes('shorts')) {
    return (
      sportLower === 'set' ||
      catLower.includes('set') ||
      catLower.includes('kit') ||
      subcatLower.includes('set') ||
      subcatLower.includes('shorts') ||
      nameLower.includes('set') ||
      nameLower.includes('shorts') ||
      nameLower.includes('kit + shorts')
    );
  }

  if (keyLower === 'retro' || keyLower.includes('retro') || keyLower.includes('vintage')) {
    return (
      sportLower === 'retro' ||
      catLower.includes('retro') ||
      nameLower.includes('retro') ||
      subcatLower.includes('retro') ||
      tagsLower.includes('retro')
    );
  }

  if (keyLower === 'clearance' || keyLower.includes('clearance') || keyLower.includes('sale')) {
    return (
      sportLower === 'clearance' ||
      catLower.includes('clearance') ||
      catLower.includes('sale') ||
      nameLower.includes('clearance') ||
      Boolean(p.originalPrice && p.originalPrice > p.price)
    );
  }

  if (keyLower === 'formula-1' || keyLower === 'f1' || keyLower.includes('formula')) {
    return (
      sportLower === 'formula-1' ||
      leagueLower.includes('formula 1') ||
      leagueLower.includes('f1') ||
      catLower.includes('formula') ||
      catLower.includes('f1') ||
      nameLower.includes('f1') ||
      nameLower.includes('formula')
    );
  }

  if (keyLower === 'cricket' || keyLower.includes('cricket')) {
    return (
      sportLower === 'cricket' ||
      catLower.includes('cricket') ||
      nameLower.includes('cricket') ||
      leagueLower.includes('ipl')
    );
  }

  if (keyLower === 'nba' || keyLower.includes('nba') || keyLower.includes('basketball')) {
    return (
      sportLower === 'nba' ||
      sportLower === 'basketball' ||
      catLower.includes('nba') ||
      catLower.includes('basketball') ||
      leagueLower.includes('nba') ||
      nameLower.includes('nba') ||
      nameLower.includes('basketball')
    );
  }

  if (keyLower === 'jackets' || keyLower.includes('jacket') || keyLower.includes('windbreaker') || keyLower.includes('outerwear')) {
    return (
      sportLower === 'jackets' ||
      catLower.includes('jacket') ||
      catLower.includes('windbreaker') ||
      subcatLower.includes('jacket') ||
      nameLower.includes('jacket') ||
      nameLower.includes('windbreaker')
    );
  }

  if (keyLower === 'polo' || keyLower.includes('polo')) {
    return (
      sportLower === 'polo' ||
      catLower.includes('polo') ||
      subcatLower.includes('polo') ||
      nameLower.includes('polo')
    );
  }

  // General fallback search in category, sport, subcategory, league, or name
  return (
    catLower.includes(keyLower) ||
    sportLower.includes(keyLower) ||
    subcatLower.includes(keyLower) ||
    leagueLower.includes(keyLower) ||
    nameLower.includes(keyLower)
  );
}
