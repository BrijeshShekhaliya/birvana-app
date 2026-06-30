import type { UnifiedTrack, UnifiedArtist, UnifiedCollection } from '../providers/models';

export class SearchRelevanceEngine {
  /**
   * Strictly sorts search results to ensure exact matches surface first.
   * Eliminates the issue of generic/cover bands overtaking official artists.
   */
  static sortResults<T extends { title?: string; name?: string; artistString?: string }>(
    query: string,
    results: T[]
  ): T[] {
    if (!query || results.length === 0) return results;

    const q = query.toLowerCase().trim();

    return [...results].sort((a, b) => {
      const aTitle = (a.title || a.name || '').toLowerCase();
      const bTitle = (b.title || b.name || '').toLowerCase();
      const aArtist = (a.artistString || '').toLowerCase();
      const bArtist = (b.artistString || '').toLowerCase();

      // 1. Exact title match (Highest Priority)
      const aExactTitle = aTitle === q;
      const bExactTitle = bTitle === q;
      if (aExactTitle && !bExactTitle) return -1;
      if (!aExactTitle && bExactTitle) return 1;

      // 2. Exact artist match
      const aExactArtist = aArtist === q;
      const bExactArtist = bArtist === q;
      if (aExactArtist && !bExactArtist) return -1;
      if (!aExactArtist && bExactArtist) return 1;

      // 3. Substring match (Starts with)
      const aStarts = aTitle.startsWith(q) || aArtist.startsWith(q);
      const bStarts = bTitle.startsWith(q) || bArtist.startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // 4. Word overlap (Includes)
      // This solves the problem where searching "Ed Sheeran" returns "Eid Ki Party"
      // because JioSaavn does weird fuzzy matching on "Ed".
      const queryWords = q.split(' ').filter(w => w.length > 2);
      if (queryWords.length > 0) {
        const aContains = queryWords.some(w => aTitle.includes(w) || aArtist.includes(w));
        const bContains = queryWords.some(w => bTitle.includes(w) || bArtist.includes(w));
        if (aContains && !bContains) return -1;
        if (!aContains && bContains) return 1;
      }

      // Maintain original API order if all relevance checks tie
      return 0;
    });
  }
}
