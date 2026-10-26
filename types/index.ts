export type SportCategory = 
  | 'soccer' 
  | 'basketball' 
  | 'baseball' 
  | 'retro' 
  | 'custom' 
  | 'mystery' 
  | 'nba' 
  | 'jackets' 
  | 'cricket' 
  | 'clearance' 
  | 'polo' 
  | 'set' 
  | 'formula-1' 
  | 'player-version' 
  | 'fan-version';

export type VersionType = 'Player Edition (Slim Fit)' | 'Fan Version (Standard Fit)' | 'Retro Vintage' | 'Kids Full Kit';

export interface PatchOption {
  id: string;
  name: string;
  price: number;
  icon?: string;
}

export interface JerseyProduct {
  id: string;
  name: string;
  slug: string;
  team: string;
  league: string;
  sport: SportCategory;
  category?: string;
  subcategory?: string;
  season: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isHot?: boolean;
  isCustomizable?: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  pattern: 'stripes' | 'solid' | 'hoops' | 'sash' | 'gradient' | 'retro-wave';
  sponsorText?: string;
  crestIcon?: string;
  availableSizes: ('S' | 'M' | 'L' | 'XL' | '2XL' | '3XL')[];
  sizeStock?: Record<string, number>;
  defaultName?: string;
  defaultNumber?: string;
  description: string;
  details: string[];
  availablePatches: PatchOption[];
  tags: string[];
  stock?: number;
  status?: string;
  image?: string;
  images?: string[];
}

export interface CartItem {
  id: string;
  product: JerseyProduct;
  size: string;
  version: VersionType;
  customName: string;
  customNumber: string;
  selectedPatches: PatchOption[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  jerseyName: string;
  userAvatar?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'user' | 'admin' | 'employee';
  phone?: string;
}
