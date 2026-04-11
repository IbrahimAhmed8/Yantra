const SLUG_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DEFAULT_SHARE_SLUG_LENGTH = 12;

export function createShareSlug(length = DEFAULT_SHARE_SLUG_LENGTH) {
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  let slug = '';

  for (const value of randomValues) {
    slug += SLUG_ALPHABET[value % SLUG_ALPHABET.length];
  }

  return slug;
}
