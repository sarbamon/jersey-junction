import { JerseyProduct, Currency, Review } from '../types';

export const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', rate: 1.0 },
  { code: 'USD', symbol: '$', rate: 0.012 },
  { code: 'EUR', symbol: '€', rate: 0.011 },
  { code: 'GBP', symbol: '£', rate: 0.0095 },
  { code: 'AED', symbol: 'AED ', rate: 0.044 },
];

export const CATEGORIES = [
  {
    id: 'player-version',
    name: 'Player Version',
    image: 'https://res.cloudinary.com/mcsohx4p/image/upload/v1792689803/jerseyjunction_uploads/yznaq5f6ciiy3unby7e8.jpg',
    tag: 'Athletic Slim Fit'
  },
  {
    id: 'fan-version',
    name: 'Fan Version',
    image: 'https://res.cloudinary.com/mcsohx4p/image/upload/v1792689804/jerseyjunction_uploads/tu9yhwz7tuelbg3rmp5d.jpg',
    tag: 'Standard Fit'
  },
  {
    id: 'set',
    name: 'Full Sets (Kit + Shorts)',
    image: 'https://res.cloudinary.com/mcsohx4p/image/upload/v1792689801/jerseyjunction_uploads/q6fb9r25vwafcwkfhdca.jpg',
    tag: 'Complete Uniform'
  },
  {
    id: 'retro',
    name: 'Retro Classics',
    image: 'https://res.cloudinary.com/mcsohx4p/image/upload/v1792689806/jerseyjunction_uploads/gu3eqryxbjnu6bcgrupp.jpg',
    tag: 'Vintage Legends'
  },
  {
    id: 'clearance',
    name: 'Clearance Sale',
    image: 'https://res.cloudinary.com/mcsohx4p/image/upload/v1792689805/jerseyjunction_uploads/buxrxemtqhn3vihftstp.jpg',
    tag: 'Up to 50% Off'
  },
  {
    id: 'formula-1',
    name: 'Formula 1 Racing',
    image: 'https://res.cloudinary.com/mcsohx4p/image/upload/v1792689810/jerseyjunction_uploads/qibqowhddhw0abmdlree.jpg',
    tag: 'F1 Teamwear'
  },
  {
    id: 'cricket',
    name: 'Cricket Kits',
    image: 'https://res.cloudinary.com/mcsohx4p/image/upload/v1792689811/jerseyjunction_uploads/vzr49rvgdqupcrqctsaz.jpg',
    tag: 'National & IPL'
  },
  {
    id: 'nba',
    name: 'NBA Basketball',
    image: 'https://res.cloudinary.com/mcsohx4p/image/upload/v1792689809/jerseyjunction_uploads/bjybfb47ifcbj9k0fwnw.jpg',
    tag: 'Swingman Jerseys'
  },
  {
    id: 'jackets',
    name: 'Windbreakers & Jackets',
    image: 'https://res.cloudinary.com/mcsohx4p/image/upload/v1792689810/jerseyjunction_uploads/qibqowhddhw0abmdlree.jpg',
    tag: 'Outerwear'
  },
  {
    id: 'polo',
    name: 'Team Polos',
    image: 'https://res.cloudinary.com/mcsohx4p/image/upload/v1792689812/jerseyjunction_uploads/qzw1qjiyxvdqrrtji7n2.jpg',
    tag: 'Casual Sport'
  }
];

export const AVAILABLE_PATCHES = [
  { id: 'ucl-15', name: 'UEFA Champions League 15 Trophy Patch', price: 50 },
  { id: 'ucl-starball', name: 'UCL Starball & Foundation Patch', price: 50 },
  { id: 'epl-gold', name: 'Premier League Champions Gold Badge', price: 50 },
  { id: 'wc-gold', name: 'FIFA World Champions 2022 Badge', price: 60 },
  { id: 'la-liga', name: 'Official La Liga Sleeve Badge', price: 40 },
  { id: 'custom-print', name: 'Official Name & Number Thermo Print', price: 100 }
];

export const PRODUCTS: JerseyProduct[] = [];

export const REVIEWS: Review[] = [];
