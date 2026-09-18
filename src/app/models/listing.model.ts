export type Category =
  | 'VEHICLES' | 'REAL_ESTATE' | 'JOBS' | 'ELECTRONICS'
  | 'HOME_GARDEN' | 'FASHION' | 'SERVICES' | 'OTHER'
  | 'BABY_KIDS' | 'PETS' | 'SPORTS_LEISURE' | 'LESSONS_COURSES' | 'CARPOOLING' | 'TRANSPORT' | 'RENTAL'
  | 'TICKETS' | 'GIVEAWAY_SWAP' | 'MOVING';

export type ListingStatus = 'ACTIVE' | 'RESERVED' | 'SOLD' | 'PENDING' | 'REJECTED' | 'EXPIRED'; // updated

export type AttributeType = 'TEXT' | 'NUMBER' | 'SELECT' | 'MULTI_SELECT' | 'BOOLEAN' | 'DATE';
export type Condition = 'NEW' | 'USED';
export type AccountType = 'PRIVATE' | 'BUSINESS';

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
  sortable: boolean;
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
  accountType?: AccountType;
  createdAt: Date;
  avgRating?: number | null;
  reviewCount?: number;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export type ListingIntent = 'OFFER' | 'SEARCH';
export type PriceType = 'FIXED' | 'NEGOTIABLE' | 'FREE';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price?: number;
  priceType?: PriceType;
  currency: string;
  intent?: ListingIntent;
  category: Category;
  subcategoryId?: string;
  subcategory?: Subcategory;
  condition?: Condition;
  city: string;
  region?: string;
  country?: string;
  lat?: number;
  lng?: number;
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
  expiresAt?: Date | null;
  expiryExtended?: boolean;
}

export interface ListingAttributesPayload {
  attributes?: Record<string, string | number | boolean | string[]>;
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
  accountType?: AccountType;
  createdAt: Date;
  avgRating: number | null;
  reviewCount: number;
  activeListingsCount: number;
  avgResponseHours: number | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
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
  { value: 'BABY_KIDS',      label: 'Bébé & Enfants',   icon: '🧸', color: 'cat-teal' },
  { value: 'LESSONS_COURSES', label: 'Cours & Leçons',  icon: '📚', color: 'cat-cyan' },
  { value: 'PETS',           label: 'Animaux',          icon: '🐾', color: 'cat-brown' },
  { value: 'SPORTS_LEISURE', label: 'Sport & Loisirs',  icon: '⚽', color: 'cat-indigo' },
  { value: 'CARPOOLING',     label: 'Covoiturage',      icon: '🚕', color: 'cat-blue' },
  { value: 'TRANSPORT',      label: 'Transport',        icon: '🚛', color: 'cat-orange' },
  { value: 'RENTAL',         label: 'Location',         icon: '🚙', color: 'cat-purple' },
  { value: 'TICKETS',        label: 'Billets & Tickets', icon: '🎫', color: 'cat-yellow' },
  { value: 'GIVEAWAY_SWAP',  label: 'Dons & Échanges',  icon: '🎁', color: 'cat-green' },
  { value: 'MOVING',         label: 'Déménagement',     icon: '🚚', color: 'cat-brown' },
  { value: 'OTHER',          label: 'Autres',           icon: '📦', color: 'cat-gray' },
];

// Suggested values for the free-text "Beruf"/"Profession" attribute on job
// listings (labelPrefix `job_professions.`) — a datalist, not an enum: the
// seller can always type something not on this list. Grouped by INDUSTRY
// sector code so the suggestions shown can be narrowed to whichever
// sector(s) are currently selected.
export const JOB_PROFESSIONS_BY_SECTOR: Record<string, string[]> = {
  HEALTHCARE: ['DOCTOR', 'DENTIST', 'PHARMACIST', 'NURSE', 'PHYSIOTHERAPIST', 'OCCUPATIONAL_THERAPIST', 'MIDWIFE', 'MEDICAL_ASSISTANT', 'PSYCHOLOGIST', 'PARAMEDIC', 'LAB_TECHNICIAN', 'OTHER_HEALTHCARE'],
  IT: ['COMPUTER_SCIENTIST', 'SOFTWARE_DEVELOPER', 'WEB_DEVELOPER', 'APP_DEVELOPER', 'IT_SYSTEM_ADMIN', 'NETWORK_ADMIN', 'CYBERSECURITY', 'DATA_SCIENTIST_AI', 'DATABASE_ADMIN', 'IT_SUPPORT', 'SAP_SPECIALIST', 'DEVOPS_CLOUD', 'IT_PROJECT_MANAGER'],
  SKILLED_TRADES: ['ELECTRICIAN', 'INSTALLER', 'HEATING_SANITARY', 'MECHANIC', 'AUTO_MECHATRONIC', 'LOCKSMITH', 'CARPENTER', 'ROOF_CARPENTER', 'MASON', 'PAINTER', 'ROOFER', 'TILER', 'METAL_WORKER', 'PLANT_MECHANIC', 'INDUSTRIAL_MECHANIC', 'MECHATRONICS_TECH', 'CNC_SPECIALIST'],
  CONSTRUCTION: ['CIVIL_ENGINEER', 'ARCHITECT', 'SITE_MANAGER', 'STRUCTURAL_ENGINEER', 'SURVEYING', 'CIVIL_WORKS', 'BUILDING_CONSTRUCTION', 'ROAD_CONSTRUCTION', 'CONSTRUCTION_HELPER'],
  OFFICE_ADMIN: ['BUSINESS_CLERK', 'CASE_WORKER', 'ADMINISTRATION', 'RECEPTION', 'SECRETARIAT', 'ASSISTANT', 'HR', 'ACCOUNTING', 'CONTROLLING', 'PURCHASING', 'QUALITY_MANAGEMENT'],
  FINANCE: ['BANKING', 'INSURANCE', 'TAX_ADVISOR', 'AUDITOR', 'FINANCIAL_ADVISOR', 'CONTROLLER', 'ACCOUNTANT', 'REAL_ESTATE_FINANCE', 'MANAGEMENT_CONSULTING'],
  SALES: ['SALESPERSON', 'RETAIL', 'WHOLESALE', 'CASHIER', 'STORE_MANAGEMENT', 'FIELD_SALES', 'SALES_REP', 'ECOMMERCE', 'CUSTOMER_ADVISOR'],
  LOGISTICS_TRANSPORT: ['TRUCK_DRIVER', 'BUS_DRIVER', 'TAXI_DRIVER', 'COURIER_DRIVER', 'WAREHOUSE_WORKER', 'ORDER_PICKER', 'LOGISTICS', 'FREIGHT_FORWARDING', 'DISPATCHER', 'WAREHOUSE_MANAGEMENT'],
  HOSPITALITY: ['COOK', 'KITCHEN_HELPER', 'WAITER', 'RESTAURANT_STAFF', 'BAKER', 'PASTRY_CHEF', 'HOTEL', 'FRONT_DESK', 'HOUSEKEEPING'],
  EDUCATION: ['TEACHER', 'EDUCATOR', 'PEDAGOGUE', 'PROFESSOR', 'LECTURER', 'TRAINER', 'RESEARCH', 'SCIENCE'],
  LEGAL_SECURITY: ['LAWYER', 'NOTARY', 'LEGAL_EXPERT', 'LEGAL_ASSISTANT', 'POLICE', 'FIRE_DEPARTMENT', 'SECURITY_SERVICE', 'JUDICIARY'],
  MANUFACTURING: ['PRODUCTION_WORKER', 'MACHINE_OPERATOR', 'PLANT_OPERATOR', 'QUALITY_CONTROL', 'PRODUCTION_TECHNICIAN', 'WELDER', 'MANUFACTURING_GENERAL', 'FOOD_PRODUCTION', 'INDUSTRIAL_MECHANIC'],
  AGRICULTURE_ENVIRONMENT: ['FARMER', 'GARDENER', 'FORESTER', 'ANIMAL_CARETAKER', 'AGRICULTURAL_HELPER', 'ENVIRONMENTAL_TECH', 'RECYCLING'],
  MEDIA_DESIGN: ['GRAPHIC_DESIGNER', 'WEB_DESIGNER', 'PHOTOGRAPHER', 'VIDEOGRAPHER', 'JOURNALIST', 'SOCIAL_MEDIA', 'MARKETING', 'ADVERTISING', 'TRANSLATOR', 'INTERPRETER'],
  BEAUTY_PERSONAL_SERVICES: ['HAIRDRESSER', 'BEAUTICIAN', 'NAIL_DESIGNER', 'FOOT_CARE', 'MASSEUR', 'CLEANING_STAFF', 'HOUSEHOLD_HELP'],
  CARE_SOCIAL: ['CHILDCARE', 'EDUCATOR', 'SOCIAL_WORKER', 'ELDERLY_CARE', 'CARE_WORKER', 'DISABILITY_SUPPORT', 'FAMILY_SUPPORT'],
  ENGINEERING_SCIENCE: ['MECHANICAL_ENGINEERING', 'ELECTRICAL_ENGINEERING', 'CIVIL_ENGINEERING', 'INDUSTRIAL_ENGINEERING', 'CHEMISTRY', 'BIOLOGY', 'PHYSICS', 'ENVIRONMENTAL_TECH', 'MECHATRONICS'],
  SPORTS: ['FOOTBALL_COACH', 'SPORTS_TEACHER', 'FITNESS_TRAINER', 'PHYSIOTHERAPY', 'SPORTS_MANAGEMENT', 'SPORTS_CLUB'],
};

// Flattened, de-duplicated view of the sector map above — several
// professions are intentionally listed under more than one sector (e.g.
// "Erzieher/in" under both Bildung and Betreuung, matching the original
// brief), so the "no sector selected yet" fallback must not show them twice.
export const JOB_PROFESSION_CODES: string[] = [...new Set(Object.values(JOB_PROFESSIONS_BY_SECTOR).flat())];

export const CONDITION_CATEGORIES: Category[] = ['VEHICLES', 'ELECTRONICS', 'HOME_GARDEN', 'FASHION', 'BABY_KIDS', 'SPORTS_LEISURE', 'GIVEAWAY_SWAP'];

// Standard EU shoe sizes (adult range, half sizes included) — SHOE_TYPE's
// SIZE_EU is a NUMBER attribute, but a raw number input is a poor fit for a
// value that only ever comes from this one fixed, well-known set. Rendered
// via app-text-autocomplete instead of a plain <input type="number">
// wherever SIZE_EU shows up (search filter, deposer-annonce form).
export const SHOE_SIZES_EU: string[] = (() => {
  const sizes: string[] = [];
  for (let s = 35; s <= 48; s += 0.5) sizes.push(s % 1 === 0 ? String(s) : s.toFixed(1));
  return sizes;
})();

/** Groups TRANSPORT's DESTINATION_COUNTRY option codes (see catalog-data.ts's
 * TRANSPORT_COUNTRIES on the backend, which this must stay in sync with)
 * into <optgroup>s for the "Transport anbieten" international destination
 * picker — Morocco stays the default domestic case, Europe/Africa cover
 * cross-border freight routes. */
export const TRANSPORT_COUNTRY_REGIONS: { region: 'MOROCCO' | 'EUROPE' | 'AFRICA'; countries: string[] }[] = [
  { region: 'MOROCCO', countries: ['MOROCCO'] },
  {
    region: 'EUROPE',
    countries: [
      'FRANCE', 'SPAIN', 'GERMANY', 'ITALY', 'PORTUGAL', 'NETHERLANDS', 'BELGIUM',
      'UNITED_KINGDOM', 'SWITZERLAND', 'AUSTRIA', 'SWEDEN', 'POLAND', 'GREECE', 'IRELAND', 'DENMARK',
    ],
  },
  {
    region: 'AFRICA',
    countries: [
      'ALGERIA', 'TUNISIA', 'LIBYA', 'MAURITANIA', 'SENEGAL', 'MALI', 'EGYPT', 'NIGERIA',
      'COTE_DIVOIRE', 'GHANA', 'CAMEROON', 'SOUTH_AFRICA', 'KENYA', 'ETHIOPIA', 'TANZANIA',
    ],
  },
];

/** Major/mid-size cities per non-Morocco destination country, offered via
 * app-text-autocomplete (free typing still works for anything not listed) —
 * a genuinely exhaustive list (France alone has 34,000+ communes) isn't
 * maintainable, so this aims for the same depth as MOROCCO_CITIES: every
 * well-known city plus a broad set of regional/mid-size ones, not just the
 * handful of biggest metros. Morocco itself keeps using the full
 * MOROCCO_CITIES picker instead of this map. */
export const TRANSPORT_CITIES_BY_COUNTRY: Record<string, string[]> = {
  FRANCE: [
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille',
    'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne',
    'Clermont-Ferrand', 'Le Mans', 'Aix-en-Provence', 'Brest', 'Tours', 'Limoges', 'Amiens', 'Annecy', 'Perpignan', 'Besançon',
    'Metz', 'Orléans', 'Rouen', 'Mulhouse', 'Caen', 'Nancy', 'Argenteuil', 'Saint-Denis', 'Roubaix', 'Tourcoing',
    'Avignon', 'Créteil', 'Poitiers', 'Versailles', 'Pau', 'La Rochelle', 'Calais', 'Cannes', 'Antibes', 'Béziers',
  ],
  SPAIN: [
    'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Malaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao',
    'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Vitoria-Gasteiz', 'A Coruña', 'Granada', 'Elche', 'Oviedo',
    'Badalona', 'Cartagena', 'Terrassa', 'Jerez de la Frontera', 'Sabadell', 'Móstoles', 'Alcalá de Henares', 'Pamplona', 'Fuenlabrada', 'Almería',
    'San Sebastián', 'Leganés', 'Santander', 'Burgos', 'Castellón de la Plana', 'Getafe', 'Albacete', 'Alcorcón', 'Logroño', 'Badajoz',
    'Salamanca', 'Huelva', 'Marbella', 'Tarragona', 'León', 'Cádiz', 'Lleida', 'Dos Hermanas', 'Mataró', 'Santa Cruz de Tenerife',
  ],
  GERMANY: [
    'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen',
    'Bremen', 'Dresden', 'Hannover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster',
    'Mannheim', 'Karlsruhe', 'Augsburg', 'Wiesbaden', 'Mönchengladbach', 'Gelsenkirchen', 'Braunschweig', 'Chemnitz', 'Kiel', 'Aachen',
    'Halle', 'Magdeburg', 'Freiburg', 'Krefeld', 'Lübeck', 'Oberhausen', 'Erfurt', 'Mainz', 'Rostock', 'Kassel',
    'Hagen', 'Saarbrücken', 'Hamm', 'Potsdam', 'Ludwigshafen', 'Oldenburg', 'Leverkusen', 'Osnabrück', 'Solingen', 'Heidelberg',
  ],
  ITALY: [
    'Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania',
    'Venice', 'Verona', 'Messina', 'Padua', 'Trieste', 'Taranto', 'Brescia', 'Parma', 'Prato', 'Modena',
    'Reggio Calabria', 'Reggio Emilia', 'Perugia', 'Ravenna', 'Livorno', 'Cagliari', 'Foggia', 'Rimini', 'Salerno', 'Ferrara',
    'Sassari', 'Latina', 'Monza', 'Syracuse', 'Pescara', 'Bergamo', 'Trento', 'Forlì', 'Vicenza', 'Terni',
    'Bolzano', 'Novara', 'Piacenza', 'Ancona', 'Andria', 'Arezzo', 'Udine', 'Cesena', 'Lecce', 'La Spezia',
  ],
  PORTUGAL: [
    'Lisbon', 'Porto', 'Vila Nova de Gaia', 'Amadora', 'Braga', 'Funchal', 'Coimbra', 'Setúbal', 'Almada', 'Agualva-Cacém',
    'Queluz', 'Barreiro', 'Aveiro', 'Faro', 'Évora', 'Viseu', 'Guimarães', 'Leiria', 'Portimão', 'Odivelas',
    'Barcelos', 'Póvoa de Varzim', 'Rio Maior', 'Viana do Castelo', 'Vila Real', 'Covilhã', 'Tomar', 'Torres Vedras', 'Peniche', 'Elvas',
    'Beja', 'Chaves', 'Estoril', 'Cascais', 'Sintra', 'Loures', 'Matosinhos',
  ],
  NETHERLANDS: [
    'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen',
    'Enschede', 'Haarlem', 'Arnhem', 'Zaanstad', 'Amersfoort', 'Apeldoorn', 'Hoofddorp', 'Maastricht', 'Leiden', 'Dordrecht',
    'Zoetermeer', 'Zwolle', 'Deventer', 'Delft', 'Alkmaar', 'Heerlen', 'Venlo', 'Leeuwarden', 'Hilversum', 'Amstelveen',
    'Purmerend', 'Roosendaal', 'Oss', 'Schiedam', 'Spijkenisse', 'Vlaardingen', 'Almelo', 'Gouda', 'Hengelo', 'Emmen',
  ],
  BELGIUM: [
    'Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Leuven', 'Mons', 'Aalst',
    'Mechelen', 'La Louvière', 'Kortrijk', 'Hasselt', 'Sint-Niklaas', 'Ostend', 'Tournai', 'Genk', 'Seraing', 'Roeselare',
    'Verviers', 'Mouscron', 'Beveren', 'Dendermonde', 'Beringen', 'Turnhout', 'Dilbeek', 'Heist-op-den-Berg', 'Lokeren', 'Vilvoorde',
  ],
  UNITED_KINGDOM: [
    'London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff',
    'Leicester', 'Belfast', 'Nottingham', 'Newcastle upon Tyne', 'Southampton', 'Portsmouth', 'Bradford', 'Coventry', 'Kingston upon Hull', 'Stoke-on-Trent',
    'Wolverhampton', 'Plymouth', 'Derby', 'Swansea', 'Aberdeen', 'Reading', 'Milton Keynes', 'Northampton', 'Norwich', 'Luton',
    'York', 'Oxford', 'Cambridge', 'Preston', 'Sunderland', 'Middlesbrough', 'Blackpool', 'Bolton', 'Ipswich', 'Watford',
    'Slough', 'Exeter', 'Gloucester', 'Dundee', 'Blackburn', 'Southend-on-Sea', 'Peterborough', 'Bath', 'Brighton', 'Warrington',
  ],
  SWITZERLAND: [
    'Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern', 'Winterthur', 'Lucerne', 'St. Gallen', 'Lugano', 'Biel/Bienne',
    'Thun', 'Köniz', 'La Chaux-de-Fonds', 'Fribourg', 'Schaffhausen', 'Chur', 'Vernier', 'Neuchâtel', 'Uster', 'Sion',
    'Emmen', 'Zug', 'Yverdon-les-Bains', 'Kriens', 'Rapperswil-Jona', 'Dübendorf', 'Montreux', 'Dietikon', 'Frauenfeld', 'Wetzikon',
  ],
  AUSTRIA: [
    'Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'Sankt Pölten', 'Dornbirn',
    'Wiener Neustadt', 'Steyr', 'Feldkirch', 'Bregenz', 'Leonding', 'Klosterneuburg', 'Baden', 'Wolfsberg', 'Leoben', 'Krems an der Donau',
    'Traun', 'Amstetten', 'Lustenau', 'Kapfenberg', 'Hallein',
  ],
  SWEDEN: [
    'Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping',
    'Lund', 'Umeå', 'Gävle', 'Borås', 'Södertälje', 'Eskilstuna', 'Halmstad', 'Växjö', 'Karlstad', 'Sundsvall',
    'Trollhättan', 'Östersund', 'Borlänge', 'Falun', 'Kalmar',
  ],
  POLAND: [
    'Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Białystok',
    'Katowice', 'Gdynia', 'Częstochowa', 'Radom', 'Sosnowiec', 'Toruń', 'Kielce', 'Gliwice', 'Zabrze', 'Bytom',
    'Olsztyn', 'Bielsko-Biała', 'Rzeszów', 'Ruda Śląska', 'Rybnik', 'Tychy', 'Opole', 'Gorzów Wielkopolski', 'Płock', 'Wałbrzych',
    'Włocławek', 'Elbląg', 'Zielona Góra', 'Koszalin',
  ],
  GREECE: [
    'Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa', 'Volos', 'Rhodes', 'Ioannina', 'Chania', 'Chalcis',
    'Agrinio', 'Katerini', 'Trikala', 'Serres', 'Lamia', 'Alexandroupoli', 'Xanthi', 'Kavala', 'Kalamata', 'Kozani',
    'Veroia', 'Drama', 'Komotini', 'Rethymno', 'Karditsa',
  ],
  IRELAND: [
    'Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford', 'Drogheda', 'Dundalk', 'Swords', 'Bray', 'Navan',
    'Kilkenny', 'Ennis', 'Carlow', 'Tralee', 'Naas', 'Sligo', 'Athlone', 'Wexford', 'Letterkenny', 'Celbridge',
  ],
  DENMARK: [
    'Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers', 'Kolding', 'Horsens', 'Vejle', 'Roskilde',
    'Herning', 'Silkeborg', 'Næstved', 'Fredericia', 'Viborg', 'Køge', 'Holstebro', 'Taastrup', 'Slagelse', 'Hillerød',
  ],
  ALGERIA: [
    'Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 'Sétif', 'Sidi Bel Abbès', 'Biskra',
    'Tébessa', 'Tlemcen', 'Béjaïa', 'Skikda', 'Tiaret', 'Ouargla', 'Bordj Bou Arréridj', 'Béchar', 'Mostaganem', 'Chlef',
    'Médéa', 'El Oued', 'Relizane', 'Tizi Ouzou', "M'Sila", 'Mascara', 'Ghardaïa', 'Souk Ahras', 'Jijel', 'Saïda',
  ],
  TUNISIA: [
    'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous',
    'Kasserine', 'Médenine', 'Nabeul', 'Tataouine', 'Béja', 'Jendouba', 'Mahdia', 'Sidi Bouzid', 'Tozeur', 'Zaghouan',
    'Siliana', 'Kef', 'Manouba',
  ],
  LIBYA: ['Tripoli', 'Benghazi', 'Misrata', 'Zawiya', 'Bayda', 'Zliten', 'Ajdabiya', 'Tobruk', 'Sabha', 'Sirte', 'Derna', 'Khoms'],
  MAURITANIA: ['Nouakchott', 'Nouadhibou', 'Kiffa', 'Kaédi', 'Rosso', 'Zouérat', 'Atar', 'Néma', 'Sélibaby', 'Aleg', 'Akjoujt'],
  SENEGAL: [
    'Dakar', 'Touba', 'Thiès', 'Kaolack', "M'bour", 'Ziguinchor', 'Diourbel', 'Saint-Louis', 'Louga', 'Tambacounda',
    'Kolda', 'Rufisque', 'Mbacké', 'Richard Toll', 'Kaffrine', 'Fatick', 'Kédougou',
  ],
  MALI: ['Bamako', 'Sikasso', 'Mopti', 'Koutiala', 'Ségou', 'Kayes', 'Gao', 'Kati', 'San', 'Timbuktu', 'Kolondiéba', 'Bougouni', 'Koulikoro'],
  EGYPT: [
    'Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said', 'Suez', 'Luxor', 'Mansoura', 'El Mahalla El Kubra', 'Tanta',
    'Asyut', 'Ismailia', 'Faiyum', 'Zagazig', 'Aswan', 'Damietta', 'Damanhur', 'Minya', 'Beni Suef', 'Qena',
    'Sohag', 'Hurghada', '6th of October City', 'Shibin El Kom', 'Banha',
  ],
  NIGERIA: [
    'Lagos', 'Kano', 'Ibadan', 'Abuja', 'Port Harcourt', 'Benin City', 'Maiduguri', 'Zaria', 'Aba', 'Jos',
    'Ilorin', 'Oyo', 'Enugu', 'Abeokuta', 'Kaduna', 'Onitsha', 'Warri', 'Sokoto', 'Calabar', 'Katsina',
    'Akure', 'Bauchi', 'Owerri', 'Uyo', 'Ado-Ekiti',
  ],
  COTE_DIVOIRE: [
    'Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'Korhogo', 'San-Pédro', 'Man', 'Divo', 'Gagnoa', 'Anyama',
    'Abengourou', 'Agboville', 'Grand-Bassam', 'Dabou', 'Bondoukou', 'Séguéla',
  ],
  GHANA: [
    'Accra', 'Kumasi', 'Tamale', 'Sekondi-Takoradi', 'Sunyani', 'Cape Coast', 'Obuasi', 'Teshie', 'Tema', 'Koforidua',
    'Ho', 'Wa', 'Bolgatanga', 'Techiman', 'Nkawkaw',
  ],
  CAMEROON: [
    'Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Maroua', 'Bafoussam', 'Ngaoundéré', 'Bertoua', 'Loum', 'Kumba',
    'Nkongsamba', 'Buea', 'Edéa', 'Kribi', 'Ebolowa',
  ],
  SOUTH_AFRICA: [
    'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'Nelspruit', 'Kimberley', 'Polokwane', 'Pietermaritzburg',
    'Rustenburg', 'George', 'Welkom', 'East London', 'Vereeniging', 'Klerksdorp', 'Potchefstroom', 'Vryburg', 'Upington', 'Worcester',
  ],
  KENYA: [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega',
    'Nyeri', 'Machakos', 'Meru', 'Kericho', 'Embu',
  ],
  ETHIOPIA: [
    'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Adama', 'Hawassa', 'Bahir Dar', 'Jimma', 'Jijiga', 'Dessie',
    'Shashamane', 'Bishoftu', 'Sodo', 'Arba Minch', 'Hosaena',
  ],
  TANZANIA: [
    'Dar es Salaam', 'Dodoma', 'Mwanza', 'Arusha', 'Mbeya', 'Morogoro', 'Tanga', 'Kahama', 'Tabora', 'Zanzibar City',
    'Kigoma', 'Sumbawanga', 'Kasulu', 'Songea', 'Musoma',
  ],
};

/** Subcategories that opt out of "Zustand" (Neu/Gebraucht) even though their
 * category is otherwise in CONDITION_CATEGORIES — for services offered
 * within an otherwise physical-goods category. E.g. Sport & Freizeit also
 * hosts "Trainingsangebote" (coaching), which isn't a "new or used" item. */
export const NO_CONDITION_SUBCATEGORIES: string[] = ['TRAINING_OFFERS'];

export const HIGHLIGHT_ATTR_CODES: Partial<Record<Category, string[]>> = {
  VEHICLES: ['MILEAGE', 'FUEL_TYPE'],
  ELECTRONICS: ['STORAGE_CAPACITY', 'RAM'],
  REAL_ESTATE: ['LIVING_AREA_SQM', 'ROOMS'],
  FASHION: ['SIZE', 'SIZE_EU'],
  HOME_GARDEN: ['FURNITURE_TYPE'],
  TICKETS: ['EVENT_DATE', 'TICKET_COUNT'],
};

export const MOROCCO_CITIES = [
  // Grand Casablanca-Settat
  'Casablanca', 'Mohammedia', 'El Jadida', 'Settat', 'Berrechid',
  'Benslimane', 'Médiouna', 'Nouaceur', 'Bouskoura', 'Dar Bouazza',
  'Oulad Teima', 'Azemmour', 'Haouzia', 'Sidi Bennour', 'Khémis Zemamra',
  'Oulad Frej', 'Bir Jdid', 'Lqliaa', 'Sidi Smail', 'Oulad Amrane',
  'Had Soualem', 'Echemmaia', 'Sidi Rahhal', 'Bouznika', 'Benhmed',
  'Oulad Abbou',

  // Rabat-Salé-Kénitra
  'Rabat', 'Salé', 'Kénitra', 'Khémisset', 'Sidi Kacem', 'Sidi Slimane',
  'Sidi Yahia du Gharb', 'Lalla Mimouna', 'Mechra Bel Ksiri', 'Jorf El Melha',
  'Ouazzane', 'Had Kourt', 'Aïn Johra', 'Tiflet', 'Rommani', 'Maaziz',
  'Souk el Arbaa', 'Moulay Bousselham', 'Sidi Allal Tazi', 'Arbaoua',

  // Fès-Meknès
  'Fès', 'Meknès', 'Taza', 'Ifrane', 'Azrou', 'Moulay Yacoub', 'El Hajeb',
  'Aïn Taoujdate', 'Missour', 'Boulemane', 'Guercif', 'Sefrou',
  'Imouzzer Kandar', 'Almis Marmoucha', 'Aïn Leuh', 'Boulmane du Dadès',
  'Tahla', 'Ain Bni Mathar', 'Itzer', 'Rich',

  // Marrakech-Safi
  'Marrakech', 'Safi', 'Essaouira', 'Kelaa des Sraghna', 'Chichaoua',
  'Youssoufia', 'Rehamna', 'Ben Guerir', 'Tamansourt', 'Ait Ourir', 'Amizmiz',
  'Tahannaout', 'Tahnaout', 'Asni', 'Tighedouine', 'Ouarzazate',
  'Kelaa M\'Gouna', 'Skoura', 'Agdz', 'Zagora', 'M\'Hamid', 'Tinzouline',
  'Tamegroute', 'Taroudant', 'Aoulouz', 'Biougra', 'Aït Baha', 'Massa',
  'Imintanoute', 'Imi n\'Tlit',

  // Souss-Massa
  'Agadir', 'Inezgane', 'Aït Melloul', 'Tiznit', 'Chtouka Aït Baha',
  'Bensergao', 'Drarga', 'Tafraout', 'Sidi Ifni', 'Guelmim', 'Tan-Tan',
  'Sidi Bibi', 'Sebt Aït Ahmed', 'Oulad Dahou', 'Aït Iaazza', 'Aït Amira',
  'Dcheira El Jihadia',

  // Tanger-Tétouan-Al Hoceïma
  'Tanger', 'Tétouan', 'Al Hoceïma', 'Chefchaouen', 'Larache', 'Asilah',
  'Fnideq', 'Martil', 'Mdiq', 'Oued Laou', 'Bab Berred', 'Brikcha', 'Jebha',
  'Targuist', 'Imzouren', 'Bni Bouayach', 'Rif', 'Ksar El Kébir',
  'Souk El Arbaa du Rharb', 'Zouada', 'Ain Defali',

  // Oriental
  'Oujda', 'Nador', 'Berkane', 'Taourirt', 'Jerada', 'Figuig', 'Bouarfa',
  'Aïn Bni Mathar', 'Ras El Ma', 'Debdou', 'Aïn Sfa', 'Zaïo', 'Selouane',
  'Ben Taïeb', 'Saidia', 'Aklim', 'Boudnib', 'Guenfouda', 'Ahfir',
  'Garéat Ben Ouali', 'Touissit',

  // Béni Mellal-Khénifra
  'Béni Mellal', 'Khouribga', 'Fquih Ben Salah', 'Azilal', 'Kasba Tadla',
  'Oued Zem', 'Boujad', 'El Ksiba', 'Demnate', 'Aït Attab', 'Bzou', 'Rahhal',
  'Souk Sebt Oulad Nemma', 'El Brouj', 'Oulad Ayad', 'Afourer', 'Bni Ayat',
  'Timoulilt',

  // Drâa-Tafilalet
  'Errachidia', 'Tinghir', 'Midelt', 'Er-Rich', 'Goulmima', 'Erfoud',
  'Rissani', 'Merzouga', 'Aoufous', 'Arfoud', 'Jorf', 'Ksar Souk', 'Alnif',
  'Ghris', 'Tinjdad', 'Tinejdad', 'Iknioun',

  // Laâyoune-Sakia El Hamra
  'Laâyoune', 'Boujdour', 'Smara', 'Tarfaya', 'Foum El Oued', 'Dakhla',

  // Guelmim-Oued Noun
  'Assa', 'Zag', 'Tata', 'Akka', 'Foum Zguid', 'Tissint',

  // Eddakhla-Oued Dahab
  'Aousserd', 'Bir Gandouz',

  // Villes supplémentaires et communes
  'Ouled Teima', 'Aïn Harrouda', 'Mansouria', 'Aïn Chock', 'Hay Hassani',
  'Ben Msik', 'Sidi Bernoussi', 'Aïn Sebaâ', 'Sidi Moumen', 'Ain Chock',
  'Oulfa', 'Bel Air', 'Anfa', 'Maarif', 'Gauthier', 'Agdal', 'Hassan',
  'Souissi', 'Hay Riad', 'Yacoub El Mansour', 'Temara', 'Aïn Atiq', 'Skhirat',
  'Harhoura', 'Aouinet Torkoz', 'Taghazout', 'Aglou', 'Mirleft', 'Legzira',
  'Souss', 'Tasila', 'Imi Mqorn', 'Imsouane', 'Tamraght', 'Aourir', 'Belfaa',
  'Ait Baamrane', 'Warzazat', 'Tazzarine', 'Nkob', 'Mhamid El Ghizlane',
  'Akka Ighane', 'Icht', 'Bou Izakarn', 'Ifrane Anti-Atlas', 'Aït Herbil',
  'Souk El Had', 'Had Hrara', 'Tamzaourt', 'Tikki', 'Imourane', 'Oued Souss',
  'Tikiouine', 'Tassila', 'Dcheira', 'Sebt Gzoula', 'Sebt Jahjouh',
  'Sidi L\'Mokhtar', 'Jemâa Shaïm', 'Abda', 'Ounagha', 'Ida Ougnidif',
  'Chiadma', 'Chemaia', 'Lalla Fatna', 'Sidi Aïssa Ben Slimane',
  'Tlat Hanchane', 'Oulad Berhil', 'Tassaout', 'Aït Ourirr', 'Tnine Chtouka',
  'Tnine Aït Ourir', 'Tnine Sidi Yamani', 'Moulay Abdallah', 'Moulay Brahim',
  'Moulay Idriss Zerhoun', 'Sidi Harazem', 'Sidi Bettache', 'Sidi Bouknadel',
  'Sidi Yahia el Gharb', 'Sidi Allal Bahraoui', 'Sidi Mohamed Ben Abdallah',
  'Sidi Taibi', 'Sidi Yahia Zaer', 'Aïn El Aouda', 'Aïn Cheggag',
  'Aït Oumghar', 'Zaïda', 'Mrirt', 'Khenifra', 'Aït Ishaq', 'El Kbab',
  'Timahdite', 'Ain Aicha', 'Taounate', 'Ghafsai', 'Rhafsai', 'Aïn Mediouna',
  'Galaz', 'Arbala', 'Zoumi', 'Derdara', 'Bab Taza', 'Dar Chaoui',
  'Ain Bahja', 'Tlat Taghramt', 'Ametrasse', 'Fifi', 'Irherm', 'Askaoun',
  'Imi N\'Tlit', 'Aït Oujane', 'Aït Benhaddou',
].sort();

/** Arabic name for every entry in MOROCCO_CITIES, keyed by the exact French/Latin
 * string above. City values are stored and searched as plain free text (there's
 * no city id/code), so this stays a display-only lookup — see cityLabel(). */
export const MOROCCO_CITIES_AR: Record<string, string> = {
  "Casablanca": "الدار البيضاء",
  "Mohammedia": "المحمدية",
  "El Jadida": "الجديدة",
  "Settat": "سطات",
  "Berrechid": "برشيد",
  "Benslimane": "بنسليمان",
  "Médiouna": "مديونة",
  "Nouaceur": "النواصر",
  "Bouskoura": "بوسكورة",
  "Dar Bouazza": "دار بوعزة",
  "Oulad Teima": "أولاد تايمة",
  "Azemmour": "أزمور",
  "Haouzia": "الحوزية",
  "Sidi Bennour": "سيدي بنور",
  "Khémis Zemamra": "خميس الزمامرة",
  "Oulad Frej": "أولاد فرج",
  "Bir Jdid": "بير الجديد",
  "Lqliaa": "القليعة",
  "Sidi Smail": "سيدي اسماعيل",
  "Oulad Amrane": "أولاد عمران",
  "Had Soualem": "حد السوالم",
  "Echemmaia": "الشماعية",
  "Sidi Rahhal": "سيدي رحال",
  "Bouznika": "بوزنيقة",
  "Benhmed": "بنحمد",
  "Oulad Abbou": "أولاد عبو",
  "Rabat": "الرباط",
  "Salé": "سلا",
  "Kénitra": "القنيطرة",
  "Khémisset": "الخميسات",
  "Sidi Kacem": "سيدي قاسم",
  "Sidi Slimane": "سيدي سليمان",
  "Sidi Yahia du Gharb": "سيدي يحيى الغرب",
  "Lalla Mimouna": "لالة ميمونة",
  "Mechra Bel Ksiri": "مشرع بلقصيري",
  "Jorf El Melha": "جرف الملحة",
  "Ouazzane": "وزان",
  "Had Kourt": "حد كورت",
  "Aïn Johra": "عين جوهرة",
  "Tiflet": "تيفلت",
  "Rommani": "الرماني",
  "Maaziz": "معزيز",
  "Souk el Arbaa": "سوق الأربعاء",
  "Moulay Bousselham": "مولاي بوسلهام",
  "Sidi Allal Tazi": "سيدي علال التازي",
  "Arbaoua": "أربعاوة",
  "Fès": "فاس",
  "Meknès": "مكناس",
  "Taza": "تازة",
  "Ifrane": "إفران",
  "Azrou": "أزرو",
  "Moulay Yacoub": "مولاي يعقوب",
  "El Hajeb": "الحاجب",
  "Aïn Taoujdate": "عين تاوجطات",
  "Missour": "ميسور",
  "Boulemane": "بولمان",
  "Guercif": "جرسيف",
  "Sefrou": "صفرو",
  "Imouzzer Kandar": "إموزار كندر",
  "Almis Marmoucha": "ألميس مرموشة",
  "Aïn Leuh": "عين اللوح",
  "Boulmane du Dadès": "بومالن دادس",
  "Tahla": "تهلة",
  "Ain Bni Mathar": "عين بني مطهر",
  "Itzer": "إيتزر",
  "Rich": "الريش",
  "Marrakech": "مراكش",
  "Safi": "آسفي",
  "Essaouira": "الصويرة",
  "Kelaa des Sraghna": "قلعة السراغنة",
  "Chichaoua": "شيشاوة",
  "Youssoufia": "اليوسفية",
  "Rehamna": "الرحامنة",
  "Ben Guerir": "بنجرير",
  "Tamansourt": "تامنصورت",
  "Ait Ourir": "أيت أورير",
  "Amizmiz": "أمزميز",
  "Tahannaout": "تحناوت",
  "Tahnaout": "تحناوت",
  "Asni": "أسني",
  "Tighedouine": "تغدوين",
  "Ouarzazate": "ورزازات",
  "Kelaa M'Gouna": "قلعة مكونة",
  "Skoura": "سكورة",
  "Agdz": "أكدز",
  "Zagora": "زاكورة",
  "M'Hamid": "امحاميد",
  "Tinzouline": "تنزولين",
  "Tamegroute": "تامكروت",
  "Taroudant": "تارودانت",
  "Aoulouz": "أولوز",
  "Biougra": "بيوكرى",
  "Aït Baha": "أيت باها",
  "Massa": "ماسة",
  "Imintanoute": "إمنتانوت",
  "Imi n'Tlit": "إيمي نتليت",
  "Agadir": "أكادير",
  "Inezgane": "إنزكان",
  "Aït Melloul": "أيت ملول",
  "Tiznit": "تزنيت",
  "Chtouka Aït Baha": "الشتوكة أيت باها",
  "Bensergao": "بنسركاو",
  "Drarga": "دراركة",
  "Tafraout": "تافراوت",
  "Sidi Ifni": "سيدي إفني",
  "Guelmim": "كلميم",
  "Tan-Tan": "طانطان",
  "Sidi Bibi": "سيدي بيبي",
  "Sebt Aït Ahmed": "سبت أيت أحمد",
  "Oulad Dahou": "أولاد داهو",
  "Aït Iaazza": "أيت إيعزة",
  "Aït Amira": "أيت عميرة",
  "Dcheira El Jihadia": "الدشيرة الجهادية",
  "Tanger": "طنجة",
  "Tétouan": "تطوان",
  "Al Hoceïma": "الحسيمة",
  "Chefchaouen": "شفشاون",
  "Larache": "العرائش",
  "Asilah": "أصيلة",
  "Fnideq": "الفنيدق",
  "Martil": "مرتيل",
  "Mdiq": "المضيق",
  "Oued Laou": "واد لاو",
  "Bab Berred": "باب برد",
  "Brikcha": "بريكشة",
  "Jebha": "جبها",
  "Targuist": "تارجيست",
  "Imzouren": "إمزورن",
  "Bni Bouayach": "بني بوعياش",
  "Rif": "الريف",
  "Ksar El Kébir": "القصر الكبير",
  "Souk El Arbaa du Rharb": "سوق الأربعاء الغرب",
  "Zouada": "الزوادة",
  "Ain Defali": "عين الدفالي",
  "Oujda": "وجدة",
  "Nador": "الناظور",
  "Berkane": "بركان",
  "Taourirt": "تاوريرت",
  "Jerada": "جرادة",
  "Figuig": "فكيك",
  "Bouarfa": "بوعرفة",
  "Aïn Bni Mathar": "عين بني مطهر",
  "Ras El Ma": "رأس الماء",
  "Debdou": "دبدو",
  "Aïn Sfa": "عين الصفا",
  "Zaïo": "زايو",
  "Selouane": "سلوان",
  "Ben Taïeb": "بن الطيب",
  "Saidia": "السعيدية",
  "Aklim": "أكليم",
  "Boudnib": "بودنيب",
  "Guenfouda": "قنفودة",
  "Ahfir": "أحفير",
  "Garéat Ben Ouali": "كارية بن علي",
  "Touissit": "تويسيت",
  "Béni Mellal": "بني ملال",
  "Khouribga": "خريبكة",
  "Fquih Ben Salah": "الفقيه بن صالح",
  "Azilal": "أزيلال",
  "Kasba Tadla": "قصبة تادلة",
  "Oued Zem": "وادي زم",
  "Boujad": "بوجاد",
  "El Ksiba": "القصيبة",
  "Demnate": "دمنات",
  "Aït Attab": "أيت عتاب",
  "Bzou": "بزو",
  "Rahhal": "الرحالة",
  "Souk Sebt Oulad Nemma": "سوق السبت أولاد النمة",
  "El Brouj": "البروج",
  "Oulad Ayad": "أولاد عياد",
  "Afourer": "أفورار",
  "Bni Ayat": "بني عياط",
  "Timoulilt": "تيموليلت",
  "Errachidia": "الرشيدية",
  "Tinghir": "تنغير",
  "Midelt": "ميدلت",
  "Er-Rich": "الريش",
  "Goulmima": "كلميمة",
  "Erfoud": "أرفود",
  "Rissani": "الريصاني",
  "Merzouga": "مرزوكة",
  "Aoufous": "أوفوس",
  "Arfoud": "أرفود",
  "Jorf": "الجرف",
  "Ksar Souk": "قصر السوق",
  "Alnif": "ألنيف",
  "Ghris": "غريس",
  "Tinjdad": "تنجداد",
  "Tinejdad": "تنجداد",
  "Iknioun": "إكنيون",
  "Laâyoune": "العيون",
  "Boujdour": "بوجدور",
  "Smara": "السمارة",
  "Tarfaya": "طرفاية",
  "Foum El Oued": "فم الواد",
  "Dakhla": "الداخلة",
  "Assa": "أسا",
  "Zag": "الزاك",
  "Tata": "طاطا",
  "Akka": "أكا",
  "Foum Zguid": "فم زكيد",
  "Tissint": "تيسينت",
  "Aousserd": "أوسرد",
  "Bir Gandouz": "بئر كندوز",
  "Ouled Teima": "أولاد تايمة",
  "Aïn Harrouda": "عين حرودة",
  "Mansouria": "المنصورية",
  "Aïn Chock": "عين الشق",
  "Hay Hassani": "الحي الحسني",
  "Ben Msik": "بن مسيك",
  "Sidi Bernoussi": "سيدي البرنوصي",
  "Aïn Sebaâ": "عين السبع",
  "Sidi Moumen": "سيدي مومن",
  "Ain Chock": "عين الشق",
  "Oulfa": "أولفة",
  "Bel Air": "بلير",
  "Anfa": "أنفا",
  "Maarif": "المعاريف",
  "Gauthier": "غوتييه",
  "Agdal": "أكدال",
  "Hassan": "حسان",
  "Souissi": "السويسي",
  "Hay Riad": "حي الرياض",
  "Yacoub El Mansour": "يعقوب المنصور",
  "Temara": "تمارة",
  "Aïn Atiq": "عين عتيق",
  "Skhirat": "الصخيرات",
  "Harhoura": "هرهورة",
  "Aouinet Torkoz": "عوينة تركوز",
  "Taghazout": "تغازوت",
  "Aglou": "أكلو",
  "Mirleft": "ميرلفت",
  "Legzira": "لكزيرة",
  "Souss": "سوس",
  "Tasila": "تاسيلة",
  "Imi Mqorn": "إيمي مقورن",
  "Imsouane": "إمسوان",
  "Tamraght": "تمغارت",
  "Aourir": "أوريار",
  "Belfaa": "بلفاع",
  "Ait Baamrane": "أيت باعمران",
  "Warzazat": "ورزازات",
  "Tazzarine": "تازارين",
  "Nkob": "نكوب",
  "Mhamid El Ghizlane": "امحاميد الغزلان",
  "Akka Ighane": "أكا إغان",
  "Icht": "إيشت",
  "Bou Izakarn": "بويزكارن",
  "Ifrane Anti-Atlas": "إفران الأطلس الصغير",
  "Aït Herbil": "أيت هربيل",
  "Souk El Had": "سوق الحد",
  "Had Hrara": "حد حرارة",
  "Tamzaourt": "تامزاورت",
  "Tikki": "تيكي",
  "Imourane": "إموران",
  "Oued Souss": "وادي سوس",
  "Tikiouine": "تيكيوين",
  "Tassila": "تاسيلة",
  "Dcheira": "الدشيرة",
  "Sebt Gzoula": "سبت اكزولة",
  "Sebt Jahjouh": "سبت الجحاجحة",
  "Sidi L'Mokhtar": "سيدي المختار",
  "Jemâa Shaïm": "جمعة شايم",
  "Abda": "عبدة",
  "Ounagha": "أوناغة",
  "Ida Ougnidif": "إدا وكنيدف",
  "Chiadma": "الشياظمة",
  "Chemaia": "الشماعية",
  "Lalla Fatna": "لالة فاطنة",
  "Sidi Aïssa Ben Slimane": "سيدي عيسى بن سليمان",
  "Tlat Hanchane": "تلات الهنشان",
  "Oulad Berhil": "أولاد برحيل",
  "Tassaout": "تاسوت",
  "Aït Ourirr": "أيت أورير",
  "Tnine Chtouka": "اثنين الشتوكة",
  "Tnine Aït Ourir": "اثنين أيت أورير",
  "Tnine Sidi Yamani": "اثنين سيدي اليماني",
  "Moulay Abdallah": "مولاي عبد الله",
  "Moulay Brahim": "مولاي إبراهيم",
  "Moulay Idriss Zerhoun": "مولاي إدريس زرهون",
  "Sidi Harazem": "سيدي حرازم",
  "Sidi Bettache": "سيدي بطاش",
  "Sidi Bouknadel": "سيدي بوقنادل",
  "Sidi Yahia el Gharb": "سيدي يحيى الغرب",
  "Sidi Allal Bahraoui": "سيدي علال البحراوي",
  "Sidi Mohamed Ben Abdallah": "سيدي محمد بن عبد الله",
  "Sidi Taibi": "سيدي الطيبي",
  "Sidi Yahia Zaer": "سيدي يحيى زعير",
  "Aïn El Aouda": "عين العودة",
  "Aïn Cheggag": "عين الشقف",
  "Aït Oumghar": "أيت أومغار",
  "Zaïda": "زايدة",
  "Mrirt": "مريرت",
  "Khenifra": "خنيفرة",
  "Aït Ishaq": "أيت إسحاق",
  "El Kbab": "القباب",
  "Timahdite": "تيمحضيت",
  "Ain Aicha": "عين عائشة",
  "Taounate": "تاونات",
  "Ghafsai": "غفساي",
  "Rhafsai": "غفساي",
  "Aïn Mediouna": "عين مديونة",
  "Galaz": "كلاز",
  "Arbala": "أربالة",
  "Zoumi": "الزومي",
  "Derdara": "الدردارة",
  "Bab Taza": "باب تازة",
  "Dar Chaoui": "دار الشاوي",
  "Ain Bahja": "عين البهجة",
  "Tlat Taghramt": "تلات تغرامت",
  "Ametrasse": "أمتراس",
  "Fifi": "فيفي",
  "Irherm": "إغرم",
  "Askaoun": "أسكاون",
  "Imi N'Tlit": "إيمي نتليت",
  "Aït Oujane": "أيت وجان",
  "Aït Benhaddou": "أيت بن حدو",
};

/** City display label: Arabic name when the app is in Arabic (falls back to the
 * original string for any value not in the dictionary — e.g. free text a user
 * typed that isn't a known city), otherwise the stored French/Latin name as-is.
 * Cities are stored and filtered as plain free text, so this only ever affects
 * what's rendered, never what's saved or sent to the backend. */
export function cityLabel(city: string, lang: string): string {
  if (!city) return city;
  return lang === 'ar' ? (MOROCCO_CITIES_AR[city] ?? city) : city;
}

/** Maps an app language code to the Intl locale used for number/date formatting. */
export function localeForLang(lang: string): string {
  return lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : lang;
}

// Any valid ISO 4217 code formats correctly via Intl.NumberFormat regardless
// of currency — no more hand-rolled MAD/EUR-only branching now that listings
// can be denominated in any of ~195 countries' currencies (see country.model.ts).
export function formatPrice(price: number, currency = 'MAD', lang = 'fr'): string {
  return new Intl.NumberFormat(localeForLang(lang), {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}

/** Splits a formatted price into its numeric amount and currency label, so the
 * currency can be rendered smaller/lighter than the amount in the UI. */
export function formatPriceParts(price: number, currency = 'MAD', lang = 'fr'): { amount: string; currency: string } {
  const parts = new Intl.NumberFormat(localeForLang(lang), {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).formatToParts(price);
  const amount = parts.filter(p => p.type !== 'currency').map(p => p.value).join('').trim();
  const currencyLabel = parts.find(p => p.type === 'currency')?.value || currency;
  return { amount, currency: currencyLabel };
}

/** True for the first `hours` (default 24) after creation — drives the "NEU"/"Nouveau"
 * badge on listing cards and the detail page, mirroring mobile.de's freshness badge. */
export function isNewListing(date: Date, hours = 24): boolean {
  const ms = Date.now() - new Date(date).getTime();
  return ms >= 0 && ms < hours * 3600 * 1000;
}

/** Precise localized date+time, e.g. "6 sept. 2026, 14:32" — mirrors mobile.de's
 * "Inserat online seit ..." timestamp. Shown alongside the relative timeAgo() label
 * on the listing detail page, where there's room for it (timeAgo() alone stays the
 * compact default everywhere else — chat, notifications, listing cards, etc.). */
export function exactDateTime(date: Date, lang = 'fr'): string {
  const locale = localeForLang(lang);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(date));
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
