export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    const trimmed = error.message.trim();
    // Do not display raw HTML error pages to the user
    if (trimmed.toLowerCase().startsWith('<!doctype html>') || trimmed.toLowerCase().startsWith('<html')) {
      return fallback;
    }
    // Truncate excessively long non-HTML dumps
    if (trimmed.length > 200) {
      return trimmed.substring(0, 200) + '...';
    }
    return trimmed;
  }

  return fallback;
}
