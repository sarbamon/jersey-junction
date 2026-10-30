import { StoreSettings } from '../types/admin';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Jersey Junction',
  storeEmail: 'support@jerseyjunction.com',
  storePhone: '+91 98765 43210',
  storeAddress: '108 Sports Hub Plaza, MG Road, Bengaluru, Karnataka 560001, India',
  shippingCharge: 50,
  expressShippingCharge: 250,
  standardShippingCharge: 0,
  freeShippingThreshold: 999,
  codEnabled: true,
  razorpayEnabled: true,
  customJerseyPrice: 150,
  icarryPickupLocations: [
    { id: 'sufi', name: 'SUFI', addressId: '103215', pincode: '400052', isDefault: true },
    { id: 'aahil', name: 'AAHIL', addressId: '103216', pincode: '400102' },
    { id: 'pla', name: 'PLA', addressId: '103217', pincode: '400050' },
    { id: 'vnn', name: 'VNN', addressId: '103218', pincode: '400706' },
    { id: 'abhi', name: 'ABHI', addressId: '34272', pincode: '782460' },
    { id: 'bla', name: 'BLA', addressId: '103219', pincode: '400003' },
  ],
  icarryPickupName: 'SUFI',
  icarryPickupAddressId: '103215',
  icarryPickupPincode: '400052',
  socials: {
    instagram: 'https://instagram.com/jerseyjunction.official',
    facebook: 'https://facebook.com/jerseyjunction',
    youtube: 'https://youtube.com/@jerseyjunction'
  },
  midBannerImage: '',
  midBannerTag: 'AUTHENTIC COLLECTION',
  midBannerTitle: 'REPRESENT YOUR CLUB.',
  midBannerSubtitle: 'WEAR YOUR COLORS.',
  midBannerOverlayTag: '',
  midBannerOverlayTitle: '',
  sizeChartImage: ''
};
