import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../services/listing.service';
import { Listing, CATEGORIES, formatPrice, timeAgo } from '../../models/listing.model';

@Component({
  selector: 'app-annonce-detail',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './annonce-detail.component.html',
  styleUrl: './annonce-detail.component.scss'
})
export class AnnonceDetailComponent implements OnInit {
  listing?: Listing;
  message = '';
  messageSent = false;
  selectedImage = 0;

  constructor(private route: ActivatedRoute, private router: Router, private ls: ListingService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.listing = this.ls.getById(id);
    if (!this.listing) { this.router.navigate(['/annonces']); return; }
    this.ls.incrementViews(id);
  }

  get category() { return CATEGORIES.find(c => c.value === this.listing?.category); }
  get priceDisplay() {
    return this.listing?.price != null
      ? formatPrice(this.listing.price, this.listing.currency)
      : 'Prix à négocier';
  }
  get timeDisplay() { return this.listing ? timeAgo(this.listing.createdAt) : ''; }

  sendMessage() {
    if (this.message.trim()) { this.messageSent = true; }
  }
}
