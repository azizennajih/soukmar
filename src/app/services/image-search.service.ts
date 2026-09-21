import { Injectable } from '@angular/core';

/** Hands a File across a navigation without round-tripping it through the URL —
 * set right before navigating to /recherche-image, consumed once in that page's ngOnInit. */
@Injectable({ providedIn: 'root' })
export class ImageSearchService {
  private pendingFile: File | null = null;

  setPendingFile(file: File) {
    this.pendingFile = file;
  }

  consumePendingFile(): File | null {
    const file = this.pendingFile;
    this.pendingFile = null;
    return file;
  }
}
