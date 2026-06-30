export const SAAVN_BASE_URL = 'https://www.jiosaavn.com/api.php';

/**
 * A centralized fetch wrapper for JioSaavn API.
 * Injects a language cookie to force global/international content
 * instead of defaulting to regional music.
 */
export async function fetchSaavn(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${SAAVN_BASE_URL}?${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  
  // Default to all languages so Search returns comprehensive results globally.
  // Specific API calls (like Home Page) can override this to force English/International content.
  if (!headers.has('Cookie')) {
    headers.set('Cookie', 'L=english,hindi,tamil,telugu,punjabi,marathi,gujarati,bengali,kannada,bhojpuri,malayalam,urdu,haryanvi,rajasthani,odia,assamese;');
  }
  // Set common headers
  headers.set('Accept', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`JioSaavn API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
