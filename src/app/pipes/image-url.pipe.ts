import { Pipe, PipeTransform } from '@angular/core';
import { imageUrl } from '../utils/image-url';

/** `{{ listing.images[0] | imageUrl:480 }}` — a photo URL resized to at most 480px wide (see imageUrl). */
@Pipe({ name: 'imageUrl', standalone: true })
export class ImageUrlPipe implements PipeTransform {
  transform(url: string | null | undefined, width: number): string {
    return imageUrl(url, width);
  }
}
