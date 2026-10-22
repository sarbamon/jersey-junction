export type ProductStatus = 'Active' | 'Draft' | 'Out of Stock';

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  sizeStock?: Record<string, number>;
  sku: string;
  brand: string;
  sizes: ('XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL')[];
  colors: string[];
  image: string;
  images?: string[];
  isFeatured: boolean;
  isBestseller: boolean;
  isCustomizable?: boolean;
  status: ProductStatus;
  createdDate: string;
  totalSold: number;
  revenueGenerated: number;
}

export type OrderStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Processing' 
  | 'Packed' 
  | 'Shipped' 
  | 'Out for Delivery' 
  | 'Delivered' 
  | 'Cancelled' 
  | 'Returned';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'COD' | 'Refunded';

export interface OrderItem {
  productId: string;
  name: string;
  size: string;
  version: string;
  customName?: string;
  customNumber?: string;
  quantity: number;
  unitPrice: number;
  image?: string;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface TimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface AdminOrder {
  id: string; // e.g. '#JJ1001'
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'Razorpay' | 'COD' | 'Credit Card' | 'UPI';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  date: string;
  timeline: TimelineEvent[];
  icarryShipmentId?: string;
  trackingNumber?: string;
  courierName?: string;
  labelUrl?: string;
  shippingStatus?: string;
  bookedAt?: string;
  packageWeight?: number;
  packageDimensions?: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  ordersCount: number;
  totalSpent: number;
  joinedDate: string;
  status: 'Active' | 'VIP' | 'Blocked' | 'Banned';
  isBanned?: boolean;
  banReason?: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  tag: string;
  productsCount: number;
  status: 'Active' | 'Disabled';
  image?: string;
  order?: number;
}

export interface AdminCoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  status: 'Active' | 'Expired' | 'Disabled';
}

export interface AdminReview {
  id: string;
  customerName: string;
  email: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface AdminBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  status: 'Active' | 'Disabled';
  order?: number;
  badge?: string;
}

export interface ICarryPickupLocation {
  id: string;
  name: string;
  addressId: string;
  pincode?: string;
  isDefault?: boolean;
}

export interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  shippingCharge: number;
  expressShippingCharge?: number;
  standardShippingCharge?: number;
  freeShippingThreshold: number;
  codEnabled: boolean;
  razorpayEnabled: boolean;
  icarryPickupLocations?: ICarryPickupLocation[];
  icarryPickupName?: string;
  icarryPickupAddressId?: string;
  icarryPickupPincode?: string;
  socials: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
  midBannerImage?: string;
  midBannerTag?: string;
  midBannerTitle?: string;
  midBannerSubtitle?: string;
  midBannerOverlayTag?: string;
  midBannerOverlayTitle?: string;
  sizeChartImage?: string;
}
