/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Book, TrendingUp, AlertTriangle, BadgeDollarSign, ShieldAlert, Award } from 'lucide-react';
import { Book as BookType } from '../types';

interface DashboardStatsProps {
  books: BookType[];
}

export default function DashboardStats({ books }: DashboardStatsProps) {
  // Calculations
  const totalBooks = books.length;
  
  const totalStockQuantity = books.reduce((acc, book) => acc + (book.stock || 0), 0);
  
  const totalStockValue = books.reduce((acc, book) => acc + ((book.stock || 0) * (book.costPrice || 0)), 0);
  
  const totalWholesaleValue = books.reduce((acc, book) => acc + ((book.stock || 0) * (book.wholesalePrice || 0)), 0);

  const totalRetailValue = books.reduce((acc, book) => acc + ((book.stock || 0) * (book.retailPrice || 0)), 0);

  const profitPotentialWholesale = totalWholesaleValue - totalStockValue;

  const lowStockThreshold = 10;
  const lowStockBooks = books.filter(book => book.stock > 0 && book.stock <= lowStockThreshold);
  const outOfStockBooks = books.filter(book => book.stock === 0);

  // Formatting currency helper
  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace("BDT", "৳");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" id="dashboard-statistics-grid">
      {/* Total Books Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between" id="stat-card-total-books">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">মোট শিরোনাম প্রকাশ</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight font-mono">{totalBooks}</h3>
            <span className="text-xs font-medium text-slate-500">টি বই</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-sans">
            মোট স্টক সংখ্যা: <strong className="font-mono text-emerald-600">{totalStockQuantity}</strong> কপি
          </p>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <Book className="w-6 h-6" />
        </div>
      </div>

      {/* Total Stock Cost Value Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between" id="stat-card-stock-value">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">মোট ইনভেস্টমেন্ট (ক্রয়মূল্য)</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight font-mono">
            {formatBDT(totalStockValue)}
          </h3>
          <p className="text-xs text-slate-500 mt-2">
            গড় বইয়ের উৎপাদন: <strong className="font-mono">{formatBDT(totalBooks > 0 ? (totalStockValue / totalStockQuantity || 0) : 0)}</strong> / পিস
          </p>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <BadgeDollarSign className="w-6 h-6" />
        </div>
      </div>

      {/* Wholesale Value & Profit Potential Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between" id="stat-card-wholesale-profit">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">পাইকারি মূল্যমান (Wholesale)</p>
          <h3 className="text-2xl font-black text-emerald-700 tracking-tight font-mono">
            {formatBDT(totalWholesaleValue)}
          </h3>
          <div className="text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
            <TrendingUp className="w-3.5 h-3.5" />
            সম্ভাব্য লাভ: {formatBDT(profitPotentialWholesale)}
          </div>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <Award className="w-6 h-6" />
        </div>
      </div>

      {/* Low & Out of Stock Alerts Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between" id="stat-card-alerts">
        <div className="space-y-1 w-full">
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">রি-অর্ডার ও স্টক সতর্কতা</p>
          <div className="flex items-center gap-4 pt-1">
            <div className="flex-1">
              <span className="text-xs text-slate-500 block mb-0.5">কম স্টক ({lowStockThreshold}-এর নিচে)</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-xl font-bold font-mono ${lowStockBooks.length > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                  {lowStockBooks.length}
                </span>
                <span className="text-xs text-slate-400">টি</span>
                {lowStockBooks.length > 0 && <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />}
              </div>
            </div>
            <div className="border-l border-slate-200 pl-4 flex-1">
              <span className="text-xs text-slate-500 block mb-0.5">স্টক শেষ (০ কপি)</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-xl font-bold font-mono ${outOfStockBooks.length > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {outOfStockBooks.length}
                </span>
                <span className="text-xs text-slate-400">টি</span>
                {outOfStockBooks.length > 0 && <ShieldAlert className="w-4 h-4 text-rose-500" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
