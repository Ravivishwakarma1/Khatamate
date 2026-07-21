'use client';

import { create } from 'zustand';
import { Shop } from '@/lib/db/schema';
import { getAllLocalShops, saveLocalShop } from '@/lib/db/idb';

const DEFAULT_SHOP: Shop = {
  id: 'shop_main',
  owner_id: 'owner_local',
  name: 'Main Grocery Store',
  address: 'Market Yard, Main Road',
  phone: '+91 98765 43210',
  currency: 'INR',
  plan: 'BUSINESS',
  settings: {
    language: 'en',
    dark_mode: true,
    pin_enabled: false,
  },
  created_at: new Date().toISOString(),
};

interface ShopState {
  activeShop: Shop;
  shops: Shop[];
  isLoaded: boolean;
  loadShops: () => Promise<void>;
  setActiveShop: (shop: Shop) => void;
  addShop: (newShopData: { name: string; address?: string; phone?: string; gst_number?: string }) => Promise<Shop>;
}

export const useShopStore = create<ShopState>((set, get) => ({
  activeShop: DEFAULT_SHOP,
  shops: [DEFAULT_SHOP],
  isLoaded: false,

  loadShops: async () => {
    try {
      const localShops = await getAllLocalShops();
      let allShops = localShops;

      if (!allShops || allShops.length === 0) {
        allShops = [DEFAULT_SHOP];
        await saveLocalShop(DEFAULT_SHOP);
      }

      // Check saved active shop ID from localStorage
      let selectedShop = allShops[0];
      const savedShopId = typeof window !== 'undefined' ? localStorage.getItem('khataflow_active_shop_id') : null;
      if (savedShopId) {
        const found = allShops.find((s) => s.id === savedShopId);
        if (found) selectedShop = found;
      }

      set({ shops: allShops, activeShop: selectedShop, isLoaded: true });
      if (typeof window !== 'undefined') {
        localStorage.setItem('khataflow_shop', JSON.stringify(selectedShop));
        localStorage.setItem('khataflow_active_shop_id', selectedShop.id);
      }
    } catch (e) {
      console.error('Failed to load shops:', e);
      set({ isLoaded: true });
    }
  },

  setActiveShop: (shop: Shop) => {
    set({ activeShop: shop });
    if (typeof window !== 'undefined') {
      localStorage.setItem('khataflow_shop', JSON.stringify(shop));
      localStorage.setItem('khataflow_active_shop_id', shop.id);
      window.dispatchEvent(new CustomEvent('khataflow_shop_changed', { detail: shop }));
    }
  },

  addShop: async ({ name, address, phone, gst_number }) => {
    const newShop: Shop = {
      id: `shop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      owner_id: 'owner_local',
      name,
      address,
      phone,
      gst_number,
      currency: 'INR',
      plan: 'FREE',
      settings: {
        language: 'en',
        dark_mode: true,
        pin_enabled: false,
      },
      created_at: new Date().toISOString(),
    };

    await saveLocalShop(newShop);
    const updatedShops = [...get().shops, newShop];
    set({ shops: updatedShops });
    get().setActiveShop(newShop);
    return newShop;
  },
}));
