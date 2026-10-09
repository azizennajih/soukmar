import { describe, it, expect } from 'vitest';
import { imageUrl } from './image-url';

const BASE = 'https://res.cloudinary.com/do6bhwcs3/image/upload';

describe('imageUrl', () => {
  it('adds a width limit next to the existing automatic format/quality settings', () => {
    expect(imageUrl(`${BASE}/f_auto,q_auto/v1/soukmar/listings/abc?_a=XYZ`, 480))
      .toBe(`${BASE}/f_auto,q_auto,w_480,c_limit/v1/soukmar/listings/abc?_a=XYZ`);
  });

  it('adds a transformation when the URL has none', () => {
    expect(imageUrl(`${BASE}/v1/soukmar/listings/abc`, 240)).toBe(`${BASE}/w_240,c_limit/v1/soukmar/listings/abc`);
  });

  it('does not size a photo twice', () => {
    const sized = `${BASE}/f_auto,q_auto,w_480,c_limit/v1/a`;
    expect(imageUrl(sized, 900)).toBe(sized);
  });

  it('leaves other hosts, empty values and relative URLs untouched', () => {
    expect(imageUrl('https://images.unsplash.com/photo-1?w=800', 480)).toBe('https://images.unsplash.com/photo-1?w=800');
    expect(imageUrl('/assets/x.jpg', 480)).toBe('/assets/x.jpg');
    expect(imageUrl('', 480)).toBe('');
    expect(imageUrl(undefined, 480)).toBe('');
    expect(imageUrl(null, 480)).toBe('');
  });

  it('rounds the width', () => {
    expect(imageUrl(`${BASE}/f_auto,q_auto/v1/a`, 479.6)).toContain('w_480,c_limit');
  });
});
