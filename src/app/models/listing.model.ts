export type Category =
  | 'VEHICLES' | 'REAL_ESTATE' | 'JOBS' | 'ELECTRONICS'
  | 'HOME_GARDEN' | 'FASHION' | 'SERVICES' | 'OTHER';

export type ListingStatus = 'ACTIVE' | 'SOLD' | 'PENDING' | 'REJECTED' | 'EXPIRED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  image?: string;
  createdAt: Date;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price?: number;
  currency: string;
  category: Category;
  subcategory?: string;
  city: string;
  region?: string;
  images: string[];
  status: ListingStatus;
  isPremium: boolean;
  isFeatured: boolean;
  views: number;
  phone?: string;
  whatsapp?: string;
  userId: string;
  user?: User;
  createdAt: Date;
}

export interface CategoryConfig {
  value: Category;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { value: 'VEHICLES',    label: 'Véhicules',       icon: '🚗', color: 'cat-blue' },
  { value: 'REAL_ESTATE', label: 'Immobilier',       icon: '🏠', color: 'cat-green' },
  { value: 'JOBS',        label: 'Emploi',           icon: '💼', color: 'cat-purple' },
  { value: 'ELECTRONICS', label: 'Électronique',     icon: '📱', color: 'cat-yellow' },
  { value: 'HOME_GARDEN', label: 'Maison & Jardin',  icon: '🌿', color: 'cat-emerald' },
  { value: 'FASHION',     label: 'Mode',             icon: '👗', color: 'cat-pink' },
  { value: 'SERVICES',    label: 'Services',         icon: '🔧', color: 'cat-orange' },
  { value: 'OTHER',       label: 'Autres',           icon: '📦', color: 'cat-gray' },
];

export const MOROCCO_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir',
  'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Safi', 'Mohammedia',
  'El Jadida', 'Béni Mellal', 'Nador', 'Taza', 'Settat', 'Berrechid',
  'Khémisset', 'Larache', 'Khouribga', 'Guelmim', 'Berkane', 'Taourirt',
];

export function formatPrice(price: number, currency = 'MAD'): string {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: currency === 'MAD' ? 'MAD' : 'EUR',
    minimumFractionDigits: 0,
  }).format(price);
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)}h`;
  if (seconds < 2592000) return `il y a ${Math.floor(seconds / 86400)}j`;
  return `il y a ${Math.floor(seconds / 2592000)} mois`;
}
