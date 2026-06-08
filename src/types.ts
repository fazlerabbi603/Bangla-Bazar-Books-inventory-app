/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Book {
  id: string;
  name: string;
  author: string;
  publisher: string;
  costPrice: number;        // ক্রয়মূল্য
  wholesalePrice: number;    // পাইকারি মূল্য
  retailPrice: number;       // খুচরা মূল্য
  stock: number;             // স্টক সংখ্যা
  supplierInfo: string;      // সরবরাহকারীর তথ্য
  promotionalTag?: string;    // ব্র্যান্ড প্রমোশন ট্যাগ (যেমন: "বেস্ট সেলার", "বিশেষ অফার", "নতুন সংস্করণ")
  promoDescription?: string; // বইটির আকর্ষণীয় ও প্রফেশনাল প্রচারণামূলক বিবরণী
  coverImage?: string;       // গ্যালারি বা ক্লাউড থেকে বইয়ের কভার ইমেজের রিপ্রেজেন্টেশন (যেমন: Base64 ডাটা URL বা ক্লাউড URL)
  tahqeeq?: string;          // তাহকীক ও তাখরীজ (تحقيق وتخريج - Verification and annotations review)
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  totalBooks: number;
  totalStockValue: number; // calculated as stock * costPrice OR stock * wholesalePrice
  totalWholesaleValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}
