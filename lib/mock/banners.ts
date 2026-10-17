import { AdminBanner } from '../types/admin';

export const INITIAL_BANNERS: AdminBanner[] = [
  {
    id: 'ban-1',
    title: 'THE ULTIMATE MATCHDAY COLLECTION 24/25',
    subtitle: 'Explore Authentic Master Quality Kits with Custom Thermo Printing',
    imageUrl: '/hero/colin-meg-R8ayF9Qwu5Y-unsplash.webp',
    buttonText: 'SHOP THE DROPS',
    buttonLink: '/shop',
    status: 'Active',
    order: 0,
  },
  {
    id: 'ban-2',
    title: 'VINTAGE RETRO LEGENDS 1990-2010',
    subtitle: 'Relive Iconic Moments with Original 5-Star Crests',
    imageUrl: '/hero/bibesh-manandhar-e-OfH1yh_hs-unsplash.webp',
    buttonText: 'EXPLORE RETRO',
    buttonLink: '/shop',
    status: 'Active',
    order: 1,
  },
  {
    id: 'ban-3',
    title: 'CUSTOM JERSEY STUDIO',
    subtitle: 'Design Your Own Name & Number Kit Live in 3D',
    imageUrl: '/hero/simon-reza-Yfv7JszxYyw-unsplash.webp',
    buttonText: 'BUILD YOUR KIT',
    buttonLink: '/shop',
    status: 'Active',
    order: 2,
  },
];
