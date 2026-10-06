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

export const PRODUCTS: JerseyProduct[] = [
  {
    id: 'set-arsenal-se',
    name: 'SET ARSENAL SPECIAL EDITION 24/25',
    slug: 'set-arsenal-se',
    team: 'Arsenal FC',
    league: 'Premier League',
    sport: 'soccer',
    season: '2024/25',
    price: 649,
    originalPrice: 1000,
    rating: 4.9,
    reviewCount: 142,
    isNew: true,
    isBestseller: true,
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.00 PM.jpeg',
    colors: {
      primary: '#db0007',
      secondary: '#ffffff',
      accent: '#061922',
      text: '#ffffff'
    },
    pattern: 'solid',
    sponsorText: 'Fly Emirates',
    crestIcon: 'cannon',
    availableSizes: ['S', 'M', 'L', 'XL', '2XL'],
    defaultName: 'SAKA',
    defaultNumber: '7',
    description: 'Special Edition Arsenal Full Set containing high quality moisture-wicking jersey and matching shorts.',
    details: [
      'Full Set: Jersey + Matching Shorts included',
      'High-grade performance breathable mesh fabric',
      'Embroidered standalone Arsenal Cannon crest',
      'HEAT.RDY performance cooling tech'
    ],
    availablePatches: AVAILABLE_PATCHES,
    tags: ['Arsenal', 'Saka', 'Premier League', 'Set']
  },
  {
    id: 'rm-player-2425',
    name: 'REAL MADRID HOME 24/25 (PLAYER VERSION)',
    slug: 'real-madrid-home-2425-player',
    team: 'Real Madrid',
    league: 'La Liga',
    sport: 'soccer',
    season: '2024/25',
    price: 899,
    originalPrice: 1400,
    rating: 5.0,
    reviewCount: 310,
    isBestseller: true,
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.17 PM.jpeg',
    colors: {
      primary: '#ffffff',
      secondary: '#09152b',
      accent: '#f4c84a',
      text: '#09152b'
    },
    pattern: 'solid',
    sponsorText: 'Emirates FLY BETTER',
    crestIcon: 'crown',
    availableSizes: ['S', 'M', 'L', 'XL', '2XL'],
    defaultName: 'BELLINGHAM',
    defaultNumber: '5',
    description: 'Player Version match-issue specification as worn on pitch at Santiago Bernabéu with houndstooth texture and metallic gold stripes.',
    details: [
      'Player Edition Slim Athletic Fit',
      'Heat-applied 3D rubber crest and sponsor',
      'Laser-cut ventilation micro holes along torso',
      '100% Breathable Recycled Polyester'
    ],
    availablePatches: AVAILABLE_PATCHES,
    tags: ['Real Madrid', 'Bellingham', 'Mbappe', 'Player Version']
  },
  {
    id: 'inter-miami-messi-pink',
    name: 'INTER MIAMI CF 2024 MESSI #10 PINK',
    slug: 'inter-miami-messi-pink',
    team: 'Inter Miami CF',
    league: 'MLS',
    sport: 'soccer',
    season: '2024',
    price: 799,
    originalPrice: 1200,
    rating: 4.9,
    reviewCount: 480,
    isHot: true,
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.39 PM.jpeg',
    colors: {
      primary: '#f7b5cd',
      secondary: '#101820',
      accent: '#f7b5cd',
      text: '#101820'
    },
    pattern: 'solid',
    sponsorText: 'Royal Caribbean',
    crestIcon: 'heron',
    availableSizes: ['S', 'M', 'L', 'XL', '2XL'],
    defaultName: 'MESSI',
    defaultNumber: '10',
    description: 'The world famous pink kit worn by Lionel Messi. Features centered crest and Royal Caribbean crown logo.',
    details: [
      'Official MLS arm patches option',
      'AEROREADY sweat-wicking structure',
      'Custom Messi #10 official font print'
    ],
    availablePatches: AVAILABLE_PATCHES,
    tags: ['Messi', 'Inter Miami', 'MLS', 'Pink', 'GOAT']
  },
  {
    id: 'barca-125th-home',
    name: 'FC BARCELONA 125th ANNIVERSARY HOME',
    slug: 'fc-barcelona-125th-home',
    team: 'FC Barcelona',
    league: 'La Liga',
    sport: 'soccer',
    season: '2024/25',
    price: 799,
    originalPrice: 1250,
    rating: 4.8,
    reviewCount: 260,
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.40 PM.jpeg',
    colors: {
      primary: '#a50044',
      secondary: '#004d98',
      accent: '#f4c84a',
      text: '#ffffff'
    },
    pattern: 'stripes',
    sponsorText: 'Spotify',
    crestIcon: 'shield-half',
    availableSizes: ['S', 'M', 'L', 'XL', '2XL'],
    defaultName: 'YAMAL',
    defaultNumber: '19',
    description: 'Celebrating 125 years of Blaugrana glory with classic half-and-half split design.',
    details: [
      'Gold 125th Anniversary inner collar print',
      'Centered Barca crest and Spotify logo',
      'Dri-FIT ADV moisture regulating fabric'
    ],
    availablePatches: AVAILABLE_PATCHES,
    tags: ['Lamine Yamal', 'Barcelona', 'Blaugrana', 'La Liga']
  },
  {
    id: 'set-dortmund-away',
    name: 'SET DORTMUND AWAY 24/25',
    slug: 'set-dortmund-away-2425',
    team: 'Borussia Dortmund',
    league: 'Bundesliga',
    sport: 'soccer',
    season: '2024/25',
    price: 649,
    originalPrice: 1000,
    rating: 4.8,
    reviewCount: 98,
    isNew: true,
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.41 PM.jpeg',
    colors: {
      primary: '#111827',
      secondary: '#f4c84a',
      accent: '#f4c84a',
      text: '#f4c84a'
    },
    pattern: 'retro-wave',
    sponsorText: '1&1',
    crestIcon: 'bvb',
    availableSizes: ['S', 'M', 'L', 'XL', '2XL'],
    defaultName: 'REUS',
    defaultNumber: '11',
    description: 'Dortmund Away Full Set featuring dark charcoal torso with neon yellow accents and shorts.',
    details: [
      'Full Kit: Shirt + Shorts',
      'Embroidered BVB 09 crest',
      'Puma DryCELL lightweight fabric'
    ],
    availablePatches: AVAILABLE_PATCHES,
    tags: ['Dortmund', 'BVB', 'Bundesliga', 'Set']
  },
  {
    id: 'brazil-2002-retro',
    name: 'BRAZIL 2002 WORLD CUP RETRO (RONALDO #9)',
    slug: 'brazil-2002-retro',
    team: 'Brazil',
    league: 'International',
    sport: 'retro',
    season: '2002',
    price: 999,
    originalPrice: 1500,
    rating: 5.0,
    reviewCount: 420,
    isBestseller: true,
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.41 PM (1).jpeg',
    colors: {
      primary: '#ffdf00',
      secondary: '#009c3b',
      accent: '#002776',
      text: '#009c3b'
    },
    pattern: 'solid',
    sponsorText: '',
    crestIcon: 'star-5',
    availableSizes: ['S', 'M', 'L', 'XL', '2XL'],
    defaultName: 'RONALDO',
    defaultNumber: '9',
    description: 'The iconic 2002 World Cup final kit worn by Ronaldo R9 as Brazil won their 5th star.',
    details: [
      'Vintage double-layer breathable mesh',
      '5-Stars CBF embroidered emblem',
      'Authentic 2002 font printing'
    ],
    availablePatches: AVAILABLE_PATCHES,
    tags: ['Ronaldo R9', 'Brazil', '2002 Retro', 'World Cup']
  },
  {
    id: 'lakers-kobe-24-black',
    name: 'LA LAKERS KOBE BRYANT #24 BLACK MAMBA',
    slug: 'lakers-kobe-24-black',
    team: 'Los Angeles Lakers',
    league: 'NBA',
    sport: 'nba',
    season: 'Retro Legend',
    price: 1099,
    originalPrice: 1600,
    rating: 5.0,
    reviewCount: 520,
    isBestseller: true,
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.42 PM.jpeg',
    colors: {
      primary: '#1c1917',
      secondary: '#f4c84a',
      accent: '#552583',
      text: '#f4c84a'
    },
    pattern: 'solid',
    sponsorText: 'Bibigo',
    crestIcon: 'basketball',
    availableSizes: ['S', 'M', 'L', 'XL', '2XL'],
    defaultName: 'BRYANT',
    defaultNumber: '24',
    description: 'Textured snakeskin print embossed pattern with drop shadow numbers and Kobe signature jock tag.',
    details: [
      'Embossed Mamba snakeskin texture',
      'Stitched twill tackle numbers #24 & #8',
      'Nike Dri-FIT swingman mesh'
    ],
    availablePatches: AVAILABLE_PATCHES,
    tags: ['Kobe Bryant', 'Mamba', 'Lakers', 'NBA']
  },
  {
    id: 'f1-redbull-jacket',
    name: 'RED BULL RACING F1 2024 WINDBREAKER JACKET',
    slug: 'f1-redbull-jacket',
    team: 'Red Bull Racing',
    league: 'Formula 1',
    sport: 'jackets',
    season: '2024',
    price: 1499,
    originalPrice: 2200,
    rating: 4.9,
    reviewCount: 180,
    isHot: true,
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.43 PM.jpeg',
    colors: {
      primary: '#061922',
      secondary: '#cc0000',
      accent: '#f4c84a',
      text: '#ffffff'
    },
    pattern: 'solid',
    sponsorText: 'ORACLE Red Bull',
    crestIcon: 'bull',
    availableSizes: ['S', 'M', 'L', 'XL', '2XL'],
    defaultName: 'VERSTAPPEN',
    defaultNumber: '1',
    description: 'Official Red Bull Racing Teamwear softshell windbreaker jacket with sponsor prints.',
    details: [
      'Waterproof windbreaker shell',
      'Official Oracle Red Bull Racing team graphics',
      'High collar zip with zip pockets'
    ],
    availablePatches: AVAILABLE_PATCHES,
    tags: ['Red Bull', 'Verstappen', 'Formula 1', 'Jacket']
  },
  {
    id: 'cricket-india-t20',
    name: 'INDIA T20 WORLD CUP CHAMPIONS JERSEY 2024',
    slug: 'india-t20-champions-2024',
    team: 'Team India',
    league: 'Cricket',
    sport: 'cricket',
    season: '2024',
    price: 699,
    originalPrice: 1100,
    rating: 5.0,
    reviewCount: 640,
    isBestseller: true,
    image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.44 PM.jpeg',
    colors: {
      primary: '#005a9c',
      secondary: '#ff9933',
      accent: '#ffffff',
      text: '#ffffff'
    },
    pattern: 'solid',
    sponsorText: 'DREAM11',
    crestIcon: 'star',
    availableSizes: ['S', 'M', 'L', 'XL', '2XL'],
    defaultName: 'ROHIT',
    defaultNumber: '45',
    description: 'The victorious T20 World Cup 2024 Champions jersey with tri-color sleeve stripes.',
    details: [
      '2-Star BCCI crest above logo',
      'Tri-color Indian flag shoulder accent',
      'Breathable athletic stretch fabric'
    ],
    availablePatches: AVAILABLE_PATCHES,
    tags: ['Team India', 'Rohit', 'Virat', 'Cricket']
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    userName: 'Aarav Sharma',
    rating: 5,
    date: '1 day ago',
    comment: 'The Real Madrid Player Version from Jersey Junction is insane! The heat-applied crest and slim fit are 100% authentic. Fast delivery in 3 days!',
    verified: true,
    jerseyName: 'REAL MADRID HOME 24/25 (PLAYER VERSION)'
  },
  {
    id: 'r2',
    userName: 'Rohan Mehta',
    rating: 5,
    date: '4 days ago',
    comment: 'Got the Arsenal SE set for my brother. Fabric quality and custom printing font are superb for ₹649.',
    verified: true,
    jerseyName: 'SET ARSENAL SPECIAL EDITION 24/25'
  },
  {
    id: 'r3',
    userName: 'Vikramaditya K.',
    rating: 5,
    date: '1 week ago',
    comment: 'Brazil 2002 Ronaldo #9 retro jersey is nostalgic perfection! Authentic double mesh fabric.',
    verified: true,
    jerseyName: 'BRAZIL 2002 WORLD CUP RETRO'
  }
];
