import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Listing, Category, CATEGORIES, MOROCCO_CITIES } from '../models/listing.model';

// Mock data — in production connect to a real REST API
const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max 256GB Titane',
    description: 'iPhone 15 Pro Max en parfait état, acheté il y a 3 mois. Écran sans rayures, batterie 98%. Avec boîte originale et chargeur.',
    price: 14500,
    currency: 'MAD',
    category: 'ELECTRONICS',
    city: 'Casablanca',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400'],
    status: 'ACTIVE',
    isPremium: true,
    isFeatured: true,
    views: 342,
    phone: '+212600000001',
    whatsapp: '212600000001',
    userId: 'u1',
    user: { id: 'u1', name: 'Ahmed Benali', email: 'ahmed@test.com', city: 'Casablanca', createdAt: new Date('2023-01-01') },
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    title: 'Toyota Corolla 2020 — 45 000 km',
    description: 'Toyota Corolla hybride, première main, entretenue chez concessionnaire. Climatisation, GPS, caméra de recul.',
    price: 185000,
    currency: 'MAD',
    category: 'VEHICLES',
    city: 'Rabat',
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'],
    status: 'ACTIVE',
    isPremium: true,
    isFeatured: true,
    views: 891,
    phone: '+212600000002',
    userId: 'u2',
    user: { id: 'u2', name: 'Fatima Zahra', email: 'fatima@test.com', city: 'Rabat', createdAt: new Date('2022-05-01') },
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: '3',
    title: 'Appartement 3 pièces — Maarif Casablanca',
    description: 'Bel appartement de 85m² au 4ème étage avec ascenseur. Salon, 2 chambres, cuisine équipée, 2 salles de bain. Vue dégagée.',
    price: 850000,
    currency: 'MAD',
    category: 'REAL_ESTATE',
    city: 'Casablanca',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'],
    status: 'ACTIVE',
    isPremium: false,
    isFeatured: false,
    views: 1204,
    phone: '+212600000003',
    userId: 'u3',
    user: { id: 'u3', name: 'Youssef Amrani', email: 'youssef@test.com', city: 'Casablanca', createdAt: new Date('2022-01-01') },
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: '4',
    title: 'MacBook Pro M3 14" — Comme neuf',
    description: 'MacBook Pro 14" puce M3, 16GB RAM, 512GB SSD. Acheté il y a 2 mois, peu utilisé. Vendu avec adaptateur original.',
    price: 18900,
    currency: 'MAD',
    category: 'ELECTRONICS',
    city: 'Marrakech',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
    status: 'ACTIVE',
    isPremium: false,
    isFeatured: false,
    views: 215,
    phone: '+212600000004',
    userId: 'u4',
    user: { id: 'u4', name: 'Sara Idrissi', email: 'sara@test.com', city: 'Marrakech', createdAt: new Date('2023-03-01') },
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    id: '5',
    title: 'Développeur Full Stack — CDI Casablanca',
    description: 'Startup tech recherche développeur Full Stack expérimenté (React/Node.js). 3 ans d\'expérience minimum. Salaire attractif.',
    price: 15000,
    currency: 'MAD',
    category: 'JOBS',
    city: 'Casablanca',
    images: [],
    status: 'ACTIVE',
    isPremium: false,
    isFeatured: false,
    views: 567,
    userId: 'u5',
    user: { id: 'u5', name: 'TechCorp MA', email: 'rh@techcorp.ma', city: 'Casablanca', createdAt: new Date('2021-01-01') },
    createdAt: new Date(Date.now() - 259200000),
  },
  {
    id: '6',
    title: 'Canapé d\'angle en velours — Bleu nuit',
    description: 'Canapé d\'angle 5 places en velours bleu nuit. Très bon état, légère utilisation. Démontable pour transport.',
    price: 3500,
    currency: 'MAD',
    category: 'HOME_GARDEN',
    city: 'Fès',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'],
    status: 'ACTIVE',
    isPremium: false,
    isFeatured: false,
    views: 98,
    phone: '+212600000006',
    userId: 'u6',
    user: { id: 'u6', name: 'Karim Tazi', email: 'karim@test.com', city: 'Fès', createdAt: new Date('2023-06-01') },
    createdAt: new Date(Date.now() - 345600000),
  },
  {
    id: '7',
    title: 'Robe de soirée — Taille 38',
    description: 'Robe longue dorée pour mariage ou cérémonie, portée une seule fois. Taille 38, état impeccable.',
    price: 800,
    currency: 'MAD',
    category: 'FASHION',
    city: 'Tanger',
    images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400'],
    status: 'ACTIVE',
    isPremium: false,
    isFeatured: false,
    views: 145,
    phone: '+212600000007',
    userId: 'u7',
    user: { id: 'u7', name: 'Nadia Berrada', email: 'nadia@test.com', city: 'Tanger', createdAt: new Date('2023-09-01') },
    createdAt: new Date(Date.now() - 432000000),
  },
  {
    id: '8',
    title: 'Plombier professionnel — Toutes interventions',
    description: 'Plombier diplômé avec 10 ans d\'expérience. Disponible 7j/7. Devis gratuit. Dépannage urgent.',
    price: 200,
    currency: 'MAD',
    category: 'SERVICES',
    city: 'Agadir',
    images: [],
    status: 'ACTIVE',
    isPremium: false,
    isFeatured: false,
    views: 312,
    phone: '+212600000008',
    userId: 'u8',
    user: { id: 'u8', name: 'Hassan Ait Ali', email: 'hassan@test.com', city: 'Agadir', createdAt: new Date('2022-12-01') },
    createdAt: new Date(Date.now() - 518400000),
  },
];

@Injectable({ providedIn: 'root' })
export class ListingService {
  private listings = new BehaviorSubject<Listing[]>(MOCK_LISTINGS);

  getAll(filters?: { q?: string; category?: string; city?: string; minPrice?: number; maxPrice?: number }): Listing[] {
    let data = this.listings.getValue();
    if (filters?.q) {
      const q = filters.q.toLowerCase();
      data = data.filter(l => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
    }
    if (filters?.category) data = data.filter(l => l.category === filters.category);
    if (filters?.city) data = data.filter(l => l.city === filters.city);
    if (filters?.minPrice) data = data.filter(l => l.price != null && l.price >= filters.minPrice!);
    if (filters?.maxPrice) data = data.filter(l => l.price != null && l.price <= filters.maxPrice!);
    return data;
  }

  getFeatured(): Listing[] {
    return this.listings.getValue().filter(l => l.isFeatured && l.status === 'ACTIVE');
  }

  getLatest(limit = 8): Listing[] {
    return this.listings.getValue()
      .filter(l => l.status === 'ACTIVE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  getById(id: string): Listing | undefined {
    return this.listings.getValue().find(l => l.id === id);
  }

  getUserListings(userId: string): Listing[] {
    return this.listings.getValue().filter(l => l.userId === userId);
  }

  create(listing: Omit<Listing, 'id' | 'views' | 'createdAt'>): Listing {
    const newListing: Listing = {
      ...listing,
      id: Date.now().toString(),
      views: 0,
      createdAt: new Date(),
    };
    this.listings.next([newListing, ...this.listings.getValue()]);
    return newListing;
  }

  incrementViews(id: string): void {
    const list = this.listings.getValue().map(l =>
      l.id === id ? { ...l, views: l.views + 1 } : l
    );
    this.listings.next(list);
  }
}
