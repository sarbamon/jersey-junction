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
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.17 PM.jpeg',
    tag: 'Athletic Slim Fit'
  },
  {
    id: 'fan-version',
    name: 'Fan Version',
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.39 PM.jpeg',
    tag: 'Standard Fit'
  },
  {
    id: 'set',
    name: 'Full Sets (Kit + Shorts)',
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.00 PM.jpeg',
    tag: 'Complete Uniform'
  },
  {
    id: 'retro',
    name: 'Retro Classics',
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.41 PM (1).jpeg',
    tag: 'Vintage Legends'
  },
  {
    id: 'clearance',
    name: 'Clearance Sale',
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.40 PM.jpeg',
    tag: 'Up to 50% Off'
  },
  {
    id: 'formula-1',
    name: 'Formula 1 Racing',
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.43 PM.jpeg',
    tag: 'F1 Teamwear'
  },
  {
    id: 'cricket',
    name: 'Cricket Kits',
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.44 PM.jpeg',
    tag: 'National & IPL'
  },
  {
    id: 'nba',
    name: 'NBA Basketball',
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.42 PM.jpeg',
    tag: 'Swingman Jerseys'
  },
  {
    id: 'jackets',
    name: 'Windbreakers & Jackets',
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.43 PM.jpeg',
    tag: 'Outerwear'
  },
  {
    id: 'polo',
    name: 'Team Polos',
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.45 PM (1).jpeg',
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
