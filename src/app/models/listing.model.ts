export type Category =
  | 'VEHICLES' | 'REAL_ESTATE' | 'JOBS' | 'ELECTRONICS'
  | 'HOME_GARDEN' | 'FASHION' | 'SERVICES' | 'OTHER'
  | 'BABY_KIDS' | 'PETS' | 'SPORTS_LEISURE';

export type ListingStatus = 'ACTIVE' | 'RESERVED' | 'SOLD' | 'PENDING' | 'REJECTED' | 'EXPIRED'; // updated

export type AttributeType = 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN';
export type Condition = 'NEW' | 'USED';

export interface Subcategory {
  id: string;
  category: Category;
  code: string;
  sortOrder: number;
}

export interface AttributeDefinition {
  id: string;
  subcategoryId: string;
  code: string;
  type: AttributeType;
  required: boolean;
  filterable: boolean;
  sortOrder: number;
  options: string[];
}

export interface ListingAttributeValue {
  id: string;
  attributeDefinitionId: string;
  attributeDefinition?: AttributeDefinition;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
}

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
  subcategoryId?: string;
  subcategory?: Subcategory;
  condition?: Condition;
  city: string;
  region?: string;
  images: string[];
  status: ListingStatus;
  isPremium: boolean;
  isFeatured: boolean;
  views: number;
  phone?: string;
  whatsapp?: string;
  showPhone?: boolean;
  userId: string;
  user?: User;
  attributeValues?: ListingAttributeValue[];
  avgPrice?: number | null;
  bumpedAt?: Date;
  createdAt: Date;
}

export interface ListingAttributesPayload {
  attributes?: Record<string, string | number | boolean>;
}

export interface Review {
  id: string;
  listingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  reviewer?: { id: string; name: string; image?: string | null };
  listing?: { id: string; title: string };
}

export interface SellerProfile {
  id: string;
  name: string;
  city?: string | null;
  image?: string | null;
  createdAt: Date;
  avgRating: number | null;
  reviewCount: number;
  activeListingsCount: number;
  avgResponseHours: number | null;
}

export interface SavedSearch {
  id: string;
  name: string;
  category?: Category;
  subcategoryId?: string;
  q?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition;
  attrs?: Record<string, string[]>;
  createdAt: Date;
}

export interface CategoryConfig {
  value: Category;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { value: 'VEHICLES',       label: 'Véhicules',       icon: '🚗', color: 'cat-blue' },
  { value: 'REAL_ESTATE',    label: 'Immobilier',       icon: '🏠', color: 'cat-green' },
  { value: 'JOBS',           label: 'Emploi',           icon: '💼', color: 'cat-purple' },
  { value: 'ELECTRONICS',    label: 'Électronique',     icon: '📱', color: 'cat-yellow' },
  { value: 'HOME_GARDEN',    label: 'Maison & Jardin',  icon: '🌿', color: 'cat-emerald' },
  { value: 'FASHION',        label: 'Mode',             icon: '👗', color: 'cat-pink' },
  { value: 'SERVICES',       label: 'Services',         icon: '🔧', color: 'cat-orange' },
  { value: 'OTHER',          label: 'Autres',           icon: '📦', color: 'cat-gray' },
  { value: 'BABY_KIDS',      label: 'Bébé & Enfants',   icon: '🧸', color: 'cat-teal' },
  { value: 'PETS',           label: 'Animaux',          icon: '🐾', color: 'cat-brown' },
  { value: 'SPORTS_LEISURE', label: 'Sport & Loisirs',  icon: '⚽', color: 'cat-indigo' },
];

export const CONDITION_CATEGORIES: Category[] = ['VEHICLES', 'ELECTRONICS', 'HOME_GARDEN', 'FASHION', 'BABY_KIDS', 'SPORTS_LEISURE'];

export const HIGHLIGHT_ATTR_CODES: Partial<Record<Category, string[]>> = {
  VEHICLES: ['MILEAGE', 'FUEL_TYPE'],
  ELECTRONICS: ['STORAGE_CAPACITY', 'RAM'],
  REAL_ESTATE: ['LIVING_AREA_SQM', 'ROOMS'],
  FASHION: ['SIZE', 'SIZE_EU'],
  HOME_GARDEN: ['FURNITURE_TYPE'],
};

export const MOROCCO_CITIES = [
  // Grand Casablanca-Settat
  'Casablanca', 'Mohammedia', 'El Jadida', 'Settat', 'Berrechid', 'Benslimane',
  'Médiouna', 'Nouaceur', 'Bouskoura', 'Dar Bouazza', 'Oulad Teima',
  'Azemmour', 'Haouzia', 'Sidi Bennour', 'Khémis Zemamra', 'Oulad Frej',
  'Bir Jdid', 'Lqliaa', 'Sidi Smail', 'Oulad Amrane', 'Had Soualem',
  'Echemmaia', 'Sidi Rahhal', 'Bouznika', 'Benhmed', 'Oulad Abbou',

  // Rabat-Salé-Kénitra
  'Rabat', 'Salé', 'Kénitra', 'Khémisset', 'Sidi Kacem', 'Sidi Slimane',
  'Sidi Yahia du Gharb', 'Lalla Mimouna', 'Mechra Bel Ksiri', 'Jorf El Melha',
  'Ouazzane', 'Had Kourt', 'Aïn Johra', 'Tiflet', 'Rommani', 'Maaziz',
  'Souk el Arbaa', 'Moulay Bousselham', 'Sidi Allal Tazi', 'Arbaoua',

  // Fès-Meknès
  'Fès', 'Meknès', 'Taza', 'Ifrane', 'Azrou', 'Moulay Yacoub',
  'El Hajeb', 'Aïn Taoujdate', 'Missour', 'Boulemane', 'Guercif',
  'Sefrou', 'Imouzzer Kandar', 'Almis Marmoucha', 'Aïn Leuh',
  'Boulmane du Dadès', 'Tahla', 'Ain Bni Mathar', 'Itzer', 'Rich',

  // Marrakech-Safi
  'Marrakech', 'Safi', 'Essaouira', 'Kelaa des Sraghna', 'Chichaoua',
  'Youssoufia', 'Rehamna', 'Ben Guerir', 'Tamansourt', 'Ait Ourir',
  'Amizmiz', 'Tahannaout', 'Tahnaout', 'Asni', 'Tighedouine',
  'Ouarzazate', 'Kelaa M\'Gouna', 'Skoura', 'Agdz', 'Zagora', 'M\'Hamid',
  'Tinzouline', 'Tamegroute', 'Taroudant', 'Aoulouz', 'Oulad Teima',
  'Biougra', 'Aït Baha', 'Massa', 'Imintanoute', 'Imi n\'Tlit',

  // Souss-Massa
  'Agadir', 'Inezgane', 'Aït Melloul', 'Tiznit', 'Taroudant', 'Chtouka Aït Baha',
  'Bensergao', 'Drarga', 'Lqliaa', 'Biougra', 'Aoulouz', 'Tafraout',
  'Sidi Ifni', 'Guelmim', 'Tan-Tan', 'Sidi Bibi', 'Sebt Aït Ahmed',
  'Oulad Dahou', 'Aït Iaazza', 'Aït Amira', 'Dcheira El Jihadia',

  // Tanger-Tétouan-Al Hoceïma
  'Tanger', 'Tétouan', 'Al Hoceïma', 'Chefchaouen', 'Larache', 'Asilah',
  'Fnideq', 'Martil', 'Mdiq', 'Oued Laou', 'Bab Berred', 'Brikcha',
  'Jebha', 'Targuist', 'Imzouren', 'Bni Bouayach', 'Rif',
  'Ksar El Kébir', 'Souk El Arbaa du Rharb', 'Zouada', 'Ain Defali',

  // Oriental
  'Oujda', 'Nador', 'Berkane', 'Taourirt', 'Jerada', 'Figuig',
  'Bouarfa', 'Aïn Bni Mathar', 'Ras El Ma', 'Debdou', 'Aïn Sfa',
  'Zaïo', 'Selouane', 'Ben Taïeb', 'Saidia', 'Aklim', 'Boudnib',
  'Guenfouda', 'Ahfir', 'Garéat Ben Ouali', 'Touissit',

  // Béni Mellal-Khénifra
  'Béni Mellal', 'Khouribga', 'Fquih Ben Salah', 'Azilal', 'Kasba Tadla',
  'Oued Zem', 'Boujad', 'El Ksiba', 'Demnate', 'Aït Attab',
  'Bzou', 'Rahhal', 'Souk Sebt Oulad Nemma', 'El Brouj',
  'Oulad Ayad', 'Afourer', 'Bni Ayat', 'Timoulilt',

  // Drâa-Tafilalet
  'Errachidia', 'Ouarzazate', 'Zagora', 'Tinghir', 'Midelt',
  'Er-Rich', 'Goulmima', 'Erfoud', 'Rissani', 'Merzouga',
  'Aoufous', 'Arfoud', 'Jorf', 'Ksar Souk', 'Alnif', 'Ghris',
  'Tinjdad', 'Tinejdad', 'Boudnib', 'Iknioun',

  // Laâyoune-Sakia El Hamra
  'Laâyoune', 'Boujdour', 'Smara', 'Tarfaya', 'Foum El Oued',
  'Dakhla',

  // Guelmim-Oued Noun
  'Guelmim', 'Tan-Tan', 'Sidi Ifni', 'Assa', 'Zag', 'Tata',
  'Akka', 'Foum Zguid', 'Tissint',

  // Eddakhla-Oued Dahab
  'Dakhla', 'Aousserd', 'Bir Gandouz',

  // Villes supplémentaires et communes
  'Ouled Teima', 'Aïn Harrouda', 'Mansouria', 'Aïn Chock', 'Hay Hassani',
  'Ben Msik', 'Sidi Bernoussi', 'Aïn Sebaâ', 'Sidi Moumen', 'Ain Chock',
  'Oulfa', 'Bel Air', 'Anfa', 'Maarif', 'Gauthier',
  'Agdal', 'Hassan', 'Souissi', 'Hay Riad', 'Yacoub El Mansour',
  'Temara', 'Aïn Atiq', 'Skhirat', 'Harhoura',
  'Aouinet Torkoz', 'Aoulouz', 'Taghazout', 'Aglou', 'Mirleft',
  'Legzira', 'Souss', 'Tasila', 'Imi Mqorn',
  'Imsouane', 'Tamraght', 'Aourir', 'Taghazout',
  'Tiznit', 'Sidi Ifni', 'Belfaa', 'Ait Baamrane',
  'Warzazat', 'Tazzarine', 'Nkob', 'Mhamid El Ghizlane',
  'Tata', 'Tissint', 'Akka Ighane', 'Icht',
  'Bou Izakarn', 'Ifrane Anti-Atlas', 'Aït Herbil',
  'Souk El Had', 'Had Hrara', 'Aït Baha', 'Drarga',
  'Tamzaourt', 'Tikki', 'Imourane', 'Aourir',
  'Oued Souss', 'Tikiouine', 'Tassila',
  'Aït Melloul', 'Dcheira', 'Lqliaa', 'Sebt Gzoula',
  'Sebt Jahjouh', 'Sidi L\'Mokhtar', 'Jemâa Shaïm',
  'Abda', 'Ounagha', 'Ida Ougnidif', 'Chiadma',
  'Chemaia', 'Lalla Fatna', 'Khémis Zemamra',
  'Sidi Aïssa Ben Slimane', 'Sebt Gzoula', 'Tlat Hanchane',
  'Oulad Berhil', 'Tassaout', 'Aït Ourirr',
  'Tnine Chtouka', 'Tnine Aït Ourir', 'Tnine Sidi Yamani',
  'Moulay Abdallah', 'Moulay Brahim', 'Moulay Idriss Zerhoun',
  'Sidi Harazem', 'Sidi Bettache', 'Sidi Bouknadel',
  'Sidi Yahia el Gharb', 'Sidi Allal Bahraoui', 'Sidi Allal Tazi',
  'Sidi Mohamed Ben Abdallah', 'Sidi Taibi', 'Sidi Yahia Zaer',
  'Aïn El Aouda', 'Aïn Taoujdate', 'Aïn Cheggag',
  'Missour', 'Boudnib', 'Aoufous', 'Aït Oumghar',
  'Zaïda', 'Mrirt', 'Khenifra', 'Midelt', 'Aït Ishaq',
  'El Kbab', 'Itzer', 'Timahdite', 'Aïn Leuh',
  'Azrou', 'Ain Aicha', 'Taounate', 'Ghafsai', 'Rhafsai',
  'Aïn Mediouna', 'Galaz', 'Arbala', 'Zoumi',
  'Chefchaouen', 'Bab Berred', 'Derdara', 'Bab Taza',
  'Oulad Amrane', 'Brikcha', 'Dar Chaoui', 'Ain Bahja',
  'Tlat Taghramt', 'Zoumi', 'Ametrasse',
  'Fifi', 'Irherm', 'Askaoun', 'Imi N\'Tlit',
  'Aït Oujane', 'Aït Benhaddou',
].sort();

export function formatPrice(price: number, currency = 'MAD', lang = 'fr'): string {
  const locale = lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : 'fr-MA';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency === 'MAD' ? 'MAD' : 'EUR',
    minimumFractionDigits: 0,
  }).format(price);
}

/** Splits a formatted price into its numeric amount and currency label, so the
 * currency can be rendered smaller/lighter than the amount in the UI. */
export function formatPriceParts(price: number, currency = 'MAD', lang = 'fr'): { amount: string; currency: string } {
  const locale = lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : 'fr-MA';
  const curr = currency === 'MAD' ? 'MAD' : currency === 'EUR' ? 'EUR' : currency;
  const parts = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: 0,
  }).formatToParts(price);
  const amount = parts.filter(p => p.type !== 'currency').map(p => p.value).join('').trim();
  const currencyLabel = parts.find(p => p.type === 'currency')?.value || curr;
  return { amount, currency: currencyLabel };
}

export function timeAgo(date: Date, lang = 'fr'): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  if (seconds < 60) return rtf.format(-seconds, 'second');
  if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), 'minute');
  if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), 'hour');
  if (seconds < 2592000) return rtf.format(-Math.floor(seconds / 86400), 'day');
  return rtf.format(-Math.floor(seconds / 2592000), 'month');
}
