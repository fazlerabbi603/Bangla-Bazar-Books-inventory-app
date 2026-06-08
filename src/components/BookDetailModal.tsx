/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Tag, Calendar, User, Building2, Package, Coins, BadgeInfo, CheckCircle2, AlertTriangle, FileSpreadsheet, Share2 } from 'lucide-react';
import { Book } from '../types';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
}

export default function BookDetailModal({ book, onClose }: BookDetailModalProps) {
  // Format dates
  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Pricing calculations
  const totalCostValue = book.stock * book.costPrice;
  const totalWholesaleValue = book.stock * book.wholesalePrice;
  const marginPerPiece = book.wholesalePrice - book.costPrice;
  const marginPercentage = ((marginPerPiece / book.costPrice) * 100).toFixed(1);

  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace("BDT", "৳");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="book-detail-modal-overlay">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-scaleIn">
          
          {/* Main Layout Container: Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5">
            
            {/* Book Visual Promo Column (Left) */}
            <div className="md:col-span-2 bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 text-white p-8 flex flex-col justify-between relative overflow-hidden">
              
              {/* Decorative backgrounds */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-300/10 rounded-full blur-2xl -ml-16 -mb-16" />

              {/* Tag overlay */}
              {book.promotionalTag && (
                <div className="self-start px-3 py-1 bg-yellow-400 text-slate-950 text-xs font-black rounded-full shadow-md tracking-wider flex items-center gap-1.5 animate-pulse uppercase">
                  <Tag className="w-3 h-3 text-slate-900" />
                  {book.promotionalTag}
                </div>
              )}

              {/* Virtual Premium Book Spine Representation */}
              <div className="my-8 flex-1 flex flex-col justify-center">
                {book.coverImage ? (
                  <div className="relative group max-w-[180px] mx-auto w-full aspect-[3/4]">
                    <img 
                      src={book.coverImage} 
                      alt={book.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-xl shadow-2xl border border-slate-750/30 group-hover:scale-105 transition-transform duration-350"
                    />
                    <div className="absolute inset-y-0 left-0 w-2.5 bg-black/35 rounded-l-xl backdrop-blur-[0.5px] shadow-inner" />
                  </div>
                ) : (
                  <div className="relative bg-emerald-800 rounded-lg p-5 border-l-8 border-yellow-400 border-t border-r border-b border-emerald-700/50 shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-300 max-w-[180px] mx-auto w-full aspect-[3/4] flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-300 block mb-1">Banglabazar</span>
                      <h3 className="font-extrabold text-white text-base leading-tight font-sans text-center mt-3 border-b border-emerald-700/40 pb-2">
                        {book.name}
                      </h3>
                      <p className="text-[10px] text-emerald-200 text-center italic mt-2">
                        {book.author}
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-emerald-300 uppercase mt-auto">
                      <span>{book.publisher.replace(" প্রকাশনী", "").replace(" প্রকাশন", "")}</span>
                      <span className="font-mono">৳{book.retailPrice}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Publisher Footer branding */}
              <div className="text-center md:text-left pt-4 border-t border-emerald-800">
                <p className="text-xs text-emerald-300 uppercase tracking-widest">পরিবেশক আড়ৎ</p>
                <p className="text-sm font-bold text-white mt-1">{book.publisher}</p>
              </div>
            </div>

            {/* Spec / Info Panel (Right) */}
            <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-between space-y-6 bg-slate-50/50">
              
              {/* Info Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 leading-tight tracking-tight">
                    {book.name}
                  </h2>
                  <p className="text-sm font-semibold text-emerald-700 mt-1 flex items-center gap-1.5">
                    <User className="w-4 h-4" /> {book.author}
                  </p>
                  {book.tahqeeq && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-sans font-semibold">
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">تحقيق وتخريج</span> {book.tahqeeq}
                    </p>
                  )}
                </div>
                <button 
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Promotional Brand Description Content */}
              {book.promoDescription && (
                <div className="bg-emerald-50/50 border-l-4 border-emerald-600 p-4 rounded-r-2xl shadow-sm">
                  <p className="text-xs text-emerald-800 leading-relaxed font-sans italic">
                    "{book.promoDescription}"
                  </p>
                </div>
              )}

              {/* Specifications List */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                
                {/* Publisher */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-slate-500 block mb-0.5 font-medium flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-400" /> প্রকাশক</span>
                  <span className="text-slate-800 font-bold">{book.publisher}</span>
                </div>

                {/* Stock Quantity */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-slate-500 block mb-0.5 font-medium flex items-center gap-1"><Package className="w-3.5 h-3.5 text-slate-400" /> স্টক সংখ্যা</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 font-extrabold text-sm font-mono">{book.stock} কপি</span>
                    {book.stock <= 10 ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-200 rounded-md flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> রি-অর্ডার
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> পর্যাপ্ত মওজুদ
                      </span>
                    )}
                  </div>
                </div>

                {/* Cost Price */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-slate-500 block mb-0.5 font-medium flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-slate-400" /> ক্রয়মূল্য (উৎপাদন)</span>
                  <span className="text-slate-800 font-bold font-mono text-sm">{formatBDT(book.costPrice)}</span>
                </div>

                {/* Wholesale Price */}
                <div className="bg-slate-900 text-emerald-300 p-3 rounded-xl border border-slate-700 shadow-sm">
                  <span className="text-emerald-400 block mb-0.5 font-medium flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-emerald-400" /> পাইকারি মূল্য</span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-black font-mono text-base text-white">{formatBDT(book.wholesalePrice)}</span>
                    <span className="text-[10px] text-emerald-400">লাভ: {marginPercentage}%</span>
                  </div>
                </div>

                {/* Retail Price */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs col-span-2">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-500 block mb-0.5 font-medium">খুচরা বিক্রয় মূল্য (গায়ের রেট)</span>
                      <span className="text-slate-700 font-extrabold font-mono text-base">{formatBDT(book.retailPrice)}</span>
                    </div>
                    <div className="text-right border-l border-slate-100 pl-4 py-1">
                      <span className="text-[10px] text-slate-400 block">পাইকারি বনাম খুচরা গ্যাপ</span>
                      <span className="text-xs font-bold font-mono text-emerald-600">৳{book.retailPrice - book.wholesalePrice} ছাড়</span>
                    </div>
                  </div>
                </div>

                {/* Supplier Information Info */}
                <div className="col-span-2 bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-slate-400 block mb-1 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1"><BadgeInfo className="w-3.5 h-3.5 text-slate-400" /> সরবরাহকারীর ঠিকানা ও যোগাযোগ</span>
                  <p className="text-slate-750 font-medium text-xs leading-relaxed">
                    {book.supplierInfo || "তথ্য দেওয়া নেই"}
                  </p>
                </div>
              </div>

              {/* Wholesale Slip Summary Widget */}
              <div className="bg-slate-100 border border-slate-200/60 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">চলতি স্টক বাণিজ্য হিসাব</span>
                
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">মোট বিনিয়োগ খরচ</span>
                    <span className="text-sm font-bold font-mono text-slate-700">{formatBDT(totalCostValue)}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] text-slate-400 block font-medium">পাইকারি পরিশোধ মূল্য</span>
                    <span className="text-sm font-black font-mono text-emerald-700">{formatBDT(totalWholesaleValue)}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                  <div className="flex gap-2 items-center">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>আপডেট: {formatDate(book.updatedAt)}</span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    আইডি: {book.id.substring(0, 10)}
                  </div>
                </div>
              </div>

              {/* Footer sharing info */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button 
                  onClick={() => {
                    const txt = `বই: ${book.name}\nলেখক: ${book.author}\nপ্রকাশক: ${book.publisher}\nপাইকারি দর: ৳${book.wholesalePrice}\nখুচরা দর: ৳${book.retailPrice}\nস্টক: ${book.stock} পিস\nরিয়েল-টাইমে বাংলাবাজার বইঘর থেকে শেয়ারকৃত।`;
                    navigator.clipboard.writeText(txt);
                    alert("পাইকারি মূল্যের বিবরণী স্লিপ ক্লিপবোর্ডে কপি করা হয়েছে!");
                  }}
                  className="px-4 py-2 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold transition-all shadow-inner flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" /> পাইকারি স্লিপ কপি করুন
                </button>
                <button 
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
