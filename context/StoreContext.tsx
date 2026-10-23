'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { JerseyProduct, CartItem, Currency, VersionType, PatchOption, UserProfile } from '../types';
import { CURRENCIES, PRODUCTS } from '../data/jerseys';
import { authService } from '../lib/services/authService';
import { couponService } from '../lib/services/couponService';

export type Theme = 'dark' | 'light';

interface StoreContextType {
  cartItems: CartItem[];
  wishlist: JerseyProduct[];
  activeCurrency: Currency;
  isCartOpen: boolean;
  theme: Theme;
  currentUser: UserProfile | null;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  loginUser: (user: UserProfile) => void;
  logoutUser: () => void;
  toggleTheme: () => void;
  discountPercentage: number;
  setDiscountPercentage: (discount: number) => void;
  appliedCouponCode: string | null;
  appliedCouponMsg: string;
  removeCoupon: () => void;
  setActiveCurrency: (currency: Currency) => void;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    product: JerseyProduct,
    size: string,
    version: VersionType,
    customName: string,
    customNumber: string,
    patches: PatchOption[]
  ) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  toggleWishlist: (product: JerseyProduct) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCurrency, setActiveCurrency] = useState<Currency>(CURRENCIES[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<JerseyProduct[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [appliedCouponMsg, setAppliedCouponMsg] = useState<string>('');
  const [theme, setTheme] = useState<Theme>('dark');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const isLoadedRef = React.useRef(false);

  // Load theme, user, and data from localStorage
  useEffect(() => {
    try {
      const savedTheme = (localStorage.getItem('jj_theme') as Theme) || 'dark';
      setTheme(savedTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(savedTheme);
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(savedTheme);

      const savedCart = localStorage.getItem('jj_cart');
      const savedWishlist = localStorage.getItem('jj_wishlist');
      const savedUser = localStorage.getItem('jj_user');
      if (savedCart) setCartItems(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      // Purge any legacy demo coupons from localStorage
      const savedCoupons = localStorage.getItem('jj_admin_coupons');
      if (savedCoupons && (savedCoupons.includes('SPOT10') || savedCoupons.includes('JUNCTION10'))) {
        localStorage.removeItem('jj_admin_coupons');
      }

      isLoadedRef.current = true;

      // Verify token with backend database
      authService.fetchMe().then((me) => {
        if (me && me.role === 'user') {
          setCurrentUser({
            name: me.name,
            email: me.email,
            role: me.role,
            phone: me.phone || ''
          });
        }
      }).catch(() => {});
    } catch (e) {
      console.log('Context init error', e);
      isLoadedRef.current = true;
    }
  }, []);

  const loginUser = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    try {
      localStorage.setItem('jj_user', JSON.stringify(user));
    } catch (e) {}
  };

  const logoutUser = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('jj_user');
      authService.logoutCustomer();
    } catch (e) {}
  };

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(nextTheme);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(nextTheme);
    try {
      localStorage.setItem('jj_theme', nextTheme);
    } catch (e) {}
  };

  // Save cart & wishlist changes
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      localStorage.setItem('jj_cart', JSON.stringify(cartItems));
      localStorage.setItem('jj_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [cartItems, wishlist]);

  const addToCart = (
    product: JerseyProduct,
    size: string,
    version: VersionType,
    customName: string,
    customNumber: string,
    patches: PatchOption[]
  ) => {
    const patchesPrice = patches.reduce((sum, p) => sum + p.price, 0);
    const versionExtra = version.includes('Player') ? 150 : 0;
    const printExtra = customName ? 100 : 0;

    const unitPrice = product.price + patchesPrice + versionExtra + printExtra;
    const cartItemId = `${product.id}-${size}-${version}-${customName}-${customNumber}-${patches.map((p) => p.id).join('-')}`;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * unitPrice }
            : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          product,
          size,
          version,
          customName,
          customNumber,
          selectedPatches: patches,
          quantity: 1,
          unitPrice,
          totalPrice: unitPrice
        }
      ];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice }
              : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    removeCoupon();
  };

  const toggleWishlist = (product: JerseyProduct) => {
    setWishlist((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  };

  const removeCoupon = () => {
    setAppliedCouponCode(null);
    setDiscountPercentage(0);
    setAppliedCouponMsg('');
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const rawSubtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
    const result = await couponService.validateCoupon(code, rawSubtotal);

    if (result.valid) {
      setAppliedCouponCode(code.trim().toUpperCase());
      setDiscountPercentage(result.discountPercentage);
      setAppliedCouponMsg(result.message);
      return { success: true, message: result.message };
    } else {
      setAppliedCouponCode(null);
      setDiscountPercentage(0);
      setAppliedCouponMsg(result.message);
      return { success: false, message: result.message };
    }
  };

  return (
    <StoreContext.Provider
      value={{
        cartItems,
        wishlist,
        activeCurrency,
        isCartOpen,
        theme,
        currentUser,
        isAuthOpen,
        setIsAuthOpen,
        loginUser,
        logoutUser,
        toggleTheme,
        discountPercentage,
        setDiscountPercentage,
        appliedCouponCode,
        appliedCouponMsg,
        removeCoupon,
        setActiveCurrency,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        applyCoupon
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
