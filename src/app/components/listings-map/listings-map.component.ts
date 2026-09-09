import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges, OnDestroy, SimpleChanges, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import type * as Leaflet from 'leaflet';
import { Listing, formatPriceParts } from '../../models/listing.model';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

const MOROCCO_CENTER: [number, number] = [31.7917, -7.0926];
const DEFAULT_ZOOM = 6;

@Component({
  selector: 'app-listings-map',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './listings-map.component.html',
  styleUrl: './listings-map.component.scss'
})
export class ListingsMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() listings: Listing[] = [];
  /** Canvas height in px — the search page's multi-marker map wants more
   * room than the single-pin map on a listing's own detail page. */
  @Input() heightPx = 520;
  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private router = inject(Router);
  private i18n = inject(I18nService);

  private L: typeof Leaflet | null = null;
  private map: Leaflet.Map | null = null;
  private markersLayer: Leaflet.LayerGroup | null = null;
  private ready = false;

  get withoutLocationCount(): number {
    return this.listings.filter(l => l.lat == null || l.lng == null).length;
  }

  async ngAfterViewInit() {
    // Leaflet touches window/document at import time — never load it during
    // SSR, where a map widget wouldn't make sense to render anyway.
    if (!this.isBrowser) return;
    this.L = await import('leaflet');
    this.map = this.L.map(this.mapEl.nativeElement, { center: MOROCCO_CENTER, zoom: DEFAULT_ZOOM });
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(this.map);
    this.markersLayer = this.L.layerGroup().addTo(this.map);
    this.ready = true;
    this.renderMarkers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['listings'] && this.ready) this.renderMarkers();
  }

  private renderMarkers() {
    const L = this.L;
    if (!L || !this.map || !this.markersLayer) return;
    this.markersLayer.clearLayers();

    const withCoords = this.listings.filter((l): l is Listing & { lat: number; lng: number } => l.lat != null && l.lng != null);
    const icon = L.divIcon({
      className: 'listings-map__pin',
      html: '<span class="listings-map__pin-dot"></span>',
      iconSize: [22, 28],
      iconAnchor: [11, 28],
      popupAnchor: [0, -26],
    });

    for (const listing of withCoords) {
      const marker = L.marker([listing.lat, listing.lng], { icon });
      marker.bindPopup(this.buildPopupContent(listing));
      this.markersLayer.addLayer(marker);
    }

    if (withCoords.length) {
      const bounds = L.latLngBounds(withCoords.map(l => [l.lat, l.lng] as [number, number]));
      this.map.fitBounds(bounds.pad(0.2), { maxZoom: 12 });
    } else {
      this.map.setView(MOROCCO_CENTER, DEFAULT_ZOOM);
    }
  }

  // Built via DOM APIs (textContent, not innerHTML) so listing titles —
  // user-generated content — can never inject markup into the popup.
  private buildPopupContent(listing: Listing): HTMLElement {
    const container = document.createElement('div');
    container.className = 'listings-map__popup';
    container.tabIndex = 0;
    container.role = 'link';

    const firstImage = listing.images?.[0];
    if (firstImage) {
      const img = document.createElement('img');
      img.src = firstImage;
      img.alt = '';
      container.appendChild(img);
    }

    const title = document.createElement('div');
    title.className = 'listings-map__popup-title';
    title.textContent = listing.title;
    container.appendChild(title);

    if (listing.price != null) {
      const parts = formatPriceParts(listing.price, listing.currency, this.i18n.lang());
      const price = document.createElement('div');
      price.className = 'listings-map__popup-price';
      price.textContent = `${parts.amount} ${parts.currency}`;
      container.appendChild(price);
    }

    const city = document.createElement('div');
    city.className = 'listings-map__popup-city';
    city.textContent = `📍 ${listing.city}`;
    container.appendChild(city);

    container.addEventListener('click', () => this.router.navigate(['/annonces', listing.id]));
    return container;
  }

  ngOnDestroy() {
    this.map?.remove();
  }
}
