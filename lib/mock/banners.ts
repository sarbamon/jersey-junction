import { AdminBanner } from '../types/admin';

export const INITIAL_BANNERS: AdminBanner[] = [
  {
    id: 'ban-1',
    title: 'THE ULTIMATE MATCHDAY COLLECTION 24/25',
    subtitle: 'Explore Authentic Master Quality Kits with Custom Thermo Printing',
    imageUrl: 'https://res.cloudinary.com/mcsohx4p/image/upload/v1792689794/jerseyjunction_uploads/tx9zw5vb3hmshcf8n4n5.webp',
    buttonText: 'SHOP THE DROPS',
    buttonLink: '/shop',
    status: 'Active',
    order: 0,
  },
  {
    id: 'ban-2',
    title: 'VINTAGE RETRO LEGENDS 1990-2010',
    subtitle: 'Relive Iconic Moments with Original 5-Star Crests',
    imageUrl: 'https://res.cloudinary.com/mcsohx4p/image/upload/v1792689793/jerseyjunction_uploads/pab7otujl2b5comodnrq.webp',
    buttonText: 'EXPLORE RETRO',
    buttonLink: '/shop',
    status: 'Active',
    order: 1,
  },
  {
    id: 'ban-3',
    title: 'CUSTOM JERSEY STUDIO',
    subtitle: 'Design Your Own Name & Number Kit Live in 3D',
    imageUrl: 'https://res.cloudinary.com/mcsohx4p/image/upload/v1792689798/jerseyjunction_uploads/zzwmhua2u8pf9j0rek7a.webp',
    buttonText: 'BUILD YOUR KIT',
    buttonLink: '/shop',
    status: 'Active',
    order: 2,
  },
];
