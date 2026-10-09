/** Asks Cloudinary for a photo no wider than `width` pixels.
 *
 * Listing photos are stored once (up to 1600px wide, see image-compression.ts) and delivered through Cloudinary
 * URLs that only contain `f_auto,q_auto`. A card that shows a 240px thumbnail would otherwise download the full
 * 1600px photo — 5-10x more data per card. Adding `w_<n>,c_limit` makes Cloudinary resize on the fly (never
 * enlarging); the result is cached by Cloudinary's CDN. Anything that is not a Cloudinary upload URL is returned
 * unchanged, so seed/demo images and external URLs keep working. */
export function imageUrl(url: string | null | undefined, width: number): string {
  if (!url) return url ?? '';
  const match = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/);
  if (!match) return url;
  const [, prefix, rest] = match;
  const size = `w_${Math.round(width)},c_limit`;
  // The first path segment is a transformation list ("f_auto,q_auto") unless it is the version ("v123...") or the file.
  const first = rest.split('/')[0];
  const isTransformation = /^[a-z]{1,3}_[^/]*$/.test(first) && !/^v\d+$/.test(first);
  if (/(^|,)w_\d+/.test(first)) return url; // already sized
  return isTransformation ? `${prefix}${first},${size}/${rest.slice(first.length + 1)}` : `${prefix}${size}/${rest}`;
}
