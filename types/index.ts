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
  season: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isHot?: boolean;
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
  defaultName?: string;
  defaultNumber?: string;
  description: string;
  details: string[];
  availablePatches: PatchOption[];
  tags: string[];
  image?: string;
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
