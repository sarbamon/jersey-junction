import { StoreSettings } from '../types/admin';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Jersey Junction',
  storeEmail: 'support@jerseyjunction.com',
  storePhone: '+91 98765 43210',
  storeAddress: '108 Sports Hub Plaza, MG Road, Bengaluru, Karnataka 560001, India',
  shippingCharge: 50,
  freeShippingThreshold: 999,
  codEnabled: true,
  razorpayEnabled: true,
  socials: {
    instagram: 'https://instagram.com/jerseyjunction.official',
    facebook: 'https://facebook.com/jerseyjunction',
    youtube: 'https://youtube.com/@jerseyjunction'
  },
  midBannerImage: 'https://res.cloudinary.com/mcsohx4p/image/upload/v1788513650/jerseyspot/gojvmjz31hz2thbpruu4.webp',
  midBannerTag: 'AUTHENTIC COLLECTION',
  midBannerTitle: 'REPRESENT YOUR CLUB.',
  midBannerSubtitle: 'WEAR YOUR COLORS.',
  midBannerOverlayTag: '',
  midBannerOverlayTitle: ''
};
