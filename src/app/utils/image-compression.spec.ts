import { vi } from 'vitest';

const compressionMock = vi.fn();
vi.mock('browser-image-compression', () => ({
  default: (...args: unknown[]) => compressionMock(...args)
}));

import { compressListingPhoto, compressAvatar } from './image-compression';

function makeFile(name = 'photo.jpg', type = 'image/jpeg'): File {
  return new File([new Blob(['fake-image-bytes'])], name, { type });
}

describe('compressListingPhoto / compressAvatar', () => {
  beforeEach(() => {
    compressionMock.mockReset();
  });

  it('returns the compressed file on success', async () => {
    const original = makeFile();
    const compressed = makeFile('photo-compressed.jpg');
    compressionMock.mockResolvedValue(compressed);

    const result = await compressListingPhoto(original);

    expect(result).toBe(compressed);
    expect(compressionMock).toHaveBeenCalledWith(
      original,
      expect.objectContaining({ maxWidthOrHeight: 1600, maxSizeMB: 1.5, useWebWorker: true })
    );
  });

  it('uses a tighter size cap for avatars than for listing photos', async () => {
    compressionMock.mockResolvedValue(makeFile());
    await compressAvatar(makeFile());
    expect(compressionMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ maxWidthOrHeight: 640, maxSizeMB: 0.3 })
    );
  });

  it('falls back to the original file when compression throws — never blocks the upload', async () => {
    const original = makeFile();
    compressionMock.mockRejectedValue(new Error('unsupported format'));

    const result = await compressListingPhoto(original);

    expect(result).toBe(original);
  });
});
