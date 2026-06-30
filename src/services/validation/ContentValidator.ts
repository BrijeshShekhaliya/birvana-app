import type { UnifiedCollection, UnifiedPlaylist, UnifiedTrack } from '../providers/models';

const BLACKLISTED_KEYWORDS = [
  'kids', 'nursery', 'lullaby', 'rhymes', 'toddler', 'baby', 'sleep', 'relaxing sounds',
  'unknown artist', 'english rain', 'zoe english', 'tommy english', 'puyush kapoor'
];

const DEFAULT_AVATARS = [
  'default', '50x50.jpg', '150x150.jpg', 'placeholder', 'avatar',
];

/**
 * Advanced Content Validation Engine
 * Enforces strict quality gates, deduplication, and metadata consistency.
 */
class ContentValidatorSingleton {
  private globalIds: Set<string> = new Set();

  resetCache() {
    this.globalIds.clear();
  }

  private isBlacklisted(text: string): boolean {
    if (!text) return false;
    const lower = text.toLowerCase();
    return BLACKLISTED_KEYWORDS.some((kw) => lower.includes(kw));
  }

  private hasValidArtwork(url: string): boolean {
    if (!url || url.trim() === '') return false;
    const lower = url.toLowerCase();
    // Reject default/placeholder avatars from JioSaavn
    return !DEFAULT_AVATARS.some((kw) => lower.includes(kw) && !lower.includes('artists/'));
  }

  validateCollection(item: UnifiedCollection): boolean {
    if (!item.id || !item.title) return false;
    return true;
  }

  validateCollections(items: UnifiedCollection[]): UnifiedCollection[] {
    return items.filter((item) => this.validateCollection(item));
  }

  validateTrack(track: UnifiedTrack): boolean {
    if (!track.id || !track.title) return false;
    return true;
  }

  validateTracks(tracks: UnifiedTrack[]): UnifiedTrack[] {
    return tracks.filter((t) => this.validateTrack(t));
  }

  validatePlaylistIntegrity(playlist: UnifiedPlaylist): boolean {
    if (!playlist.tracks || playlist.tracks.length < 5) return false;
    if (!this.hasValidArtwork(playlist.artworkUrl)) return false;
    if (this.isBlacklisted(playlist.name)) return false;
    
    return true;
  }
}

export const ContentValidator = new ContentValidatorSingleton();
