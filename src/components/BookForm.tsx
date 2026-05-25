/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, HelpCircle, Tag, Check } from 'lucide-react';
import { Book } from '../types';

interface BookFormProps {
  bookToEdit: Book | null;
  onClose: () => void;
  onSave: (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

// Pre-defined list of publishers in Banglabazar
const POPULAR_PUBLISHERS = [
  "অনন্যা প্রকাশনী",
  "মাওলা ব্রাদার্স",
  "প্রথমা প্রকাশন",
  "আগামী প্রকাশনী",
  "কাকলী প্রকাশনী",
  "অবসর প্রকাশনা সংস্থা",
  "সময় প্রকাশন",
  "ইত্যাদি গ্রন্থ প্রকাশ",
  "অনিন্দ্য প্রকাশ",
  "নওরোজ কিতাবিস্তান"
];

// Pre-defined professional brand promotion tags
const PROMO_TAGS = [
  "সর্বকালের বেস্টসেলার",
  "নতুন সংস্করণ",
  "একুশে বইমেলা সেরা অফার",
  "বিশেষ ছাড় (১৫%)",
  "স্টক সীমিত",
  "প্রকাশকের পছন্দ",
  "সেরা উপহার",
  "সদ্য প্রকাশিত"
];

export default function BookForm({ bookToEdit, onClose, onSave }: BookFormProps) {
  // Constants
  const isEditing = !!bookToEdit;

  // Form State
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [customPublisher, setCustomPublisher] = useState('');
  const [isCustomPublisher, setIsCustomPublisher] = useState(false);
  
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [wholesalePrice, setWholesalePrice] = useState<number | ''>('');
  const [retailPrice, setRetailPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [supplierInfo, setSupplierInfo] = useState('');
  
  const [promotionalTag, setPromotionalTag] = useState('');
  const [promoDescription, setPromoDescription] = useState('');

  // Error/Process State
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize fields if editing
  useEffect(() => {
    if (bookToEdit) {
      setName(bookToEdit.name);
      setAuthor(bookToEdit.author);
      
      const foundPublisher = POPULAR_PUBLISHERS.find(p => p === bookToEdit.publisher);
      if (foundPublisher) {
        setPublisher(bookToEdit.publisher);
        setIsCustomPublisher(false);
      } else {
        setPublisher('others');
        setCustomPublisher(bookToEdit.publisher);
        setIsCustomPublisher(true);
      }

      setCostPrice(bookToEdit.costPrice);
      setWholesalePrice(bookToEdit.wholesalePrice);
      setRetailPrice(bookToEdit.retailPrice);
      setStock(bookToEdit.stock);
      setSupplierInfo(bookToEdit.supplierInfo || '');
      setPromotionalTag(bookToEdit.promotionalTag || '');
      setPromoDescription(bookToEdit.promoDescription || '');
    } else {
      // Default initial states
      setName('');
      setAuthor('');
      setPublisher(POPULAR_PUBLISHERS[0]);
      setIsCustomPublisher(false);
      setCostPrice('');
      setWholesalePrice('');
      setRetailPrice('');
      setStock('');
      setSupplierInfo('');
      setPromotionalTag(PROMO_TAGS[0]);
      setPromoDescription('');
    }
  }, [bookToEdit]);

  // Handler for publisher dropdown changes
  const handlePublisherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'others') {
      setPublisher('others');
      setIsCustomPublisher(true);
    } else {
      setPublisher(val);
      setIsCustomPublisher(false);
    }
  };

  /**
   * Generates a stunning professional Bengali promotional pitch for the book!
   * perfectly following: একটা ব্র্যান্ডের বিভিন্ন পণ্যের নাম গুলো তুমি প্রফেশনালি ব্র্যান্ড প্রমোশন যেভাবে করে ঠিক সেভাবে বলবে
   */
  const handleGeneratePromoPitch = () => {
    if (!name || !author) {
      setFormError("আকর্ষণীয় প্রচারণামূলক অফার জেনারেট করার জন্য অনুগ্রহ করে প্রথমে বইয়ের নাম ও লেখকের নাম প্রদান করুন।");
      return;
    }
    setFormError('');

    const targetPublisher = isCustomPublisher ? customPublisher : publisher;
    const tag = promotionalTag || "বিশেষ আকর্ষণ";

    // Dynamic generation templates based on book context
    const templates = [
      `ধন্য বাঙালি সাহিত্য! বিশিষ্ট লেখক ও গবেষক ${author}-এর সৃষ্টিশীল ভাবনাশৈলীতে সমৃদ্ধ এবং ঐতিহ্যবাহী ${targetPublisher}-এর সুচারু তত্ত্বাবধানে প্রকাশিত নতুন সাড়াজাগানো মাস্টারপিস—"${name}"। এই মুহূর্তে ঢাকার প্রকাশনী জগতের প্রাণকেন্দ্র বাংলাবাজারের পাইকারি আড়ৎ ও বুক এজেন্সিতে ব্যাপক জনপ্রিয়তা অর্জন করেছে। ${tag}-এর গৌরব নিয়ে বাজারে আসা চমৎকার বাঁধাই ও ঝকঝকে ছাপা সম্বলিত এই বইটির স্টক বেশ সীমিত। আপনার ব্র্যান্ডের লাইব্রেরি সাজাতে কিংবা শোরুমের চাহিদার সর্বোচ্চ যোগান দিতে আজই পাইকারি মূল্যে অর্ডার করুন ও নিশ্চিত করুন আপনার কপি!`,
      `পড়ুন, জানুন এবং জীবনকে সমৃদ্ধ করুন! সমকালীন পাঠকদের আকুল আগ্রহের কেন্দ্রবিন্দুতে থাকা অনন্য চমৎকার বই "${name}"—যা বোদ্ধা পাঠক মহলে ইতিমধ্যে ব্যাপক তোলপাড় সৃষ্টি করেছে। তরুণ সাহিত্যপ্রেমীদের প্রিয় লেখক ${author}-এর জাদুকরী লেখনীর ছোঁয়া এবং ${targetPublisher}-এর নিখুঁত পরিবেশনায় বইটিকে করা হয়েছে এক রাজকীয় রূপায়ণ। এটি মূলত একটি ${tag} সংস্করণের বই। পাঠক চাহিদার তুঙ্গে থাকায় সীমিত সংখ্যায় স্টক রয়েছে। দামে সাশ্রয়ী পাইকারি সুযোগে আজই আপনার শোরুমের জন্য বুকিং দিন!`,
      `বইপ্রেমীদের মন জয় করতে এবং পাঠকের চিন্তার দুয়ার উম্মুক্ত করতে বাজারে নিয়ে এলাম অনন্য বই "${name}"। কালজয়ী লেখক ${author}-এর তুলনাহীন মেধা ও সুন্দর সৃজনশীল লেখনী নিয়ে প্রকাশিত হয়েছে আমাদের এই প্রিয় প্রকাশনাটি। সরাসরি বাংলাবাজার থেকে চমৎকার পাইকারি দরে সরবরাহের দারুণ সুবিধা নিয়ে বাজারে আমাদের এই সেরা বিজ্ঞাপন। ${tag} সংবলিত এই বিরল মাস্টারপিসটির কপিগুলো সীমিত হওয়াতে এখনই পাইকারি সরবরাহ নিশ্চিত করুন!`
    ];

    // Pick a random template
    const randomIndex = Math.floor(Math.random() * templates.length);
    setPromoDescription(templates[randomIndex]);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const selectedPublisherName = isCustomPublisher ? customPublisher.trim() : publisher;

    // Standard validations
    if (!name.trim()) return setFormError('বইয়ের নাম লিখুন।');
    if (!author.trim()) return setFormError('লেখক বা সম্পাদকের নাম লিখুন।');
    if (!selectedPublisherName) return setFormError('প্রকাশকের নাম নির্বাচন করুন বা লিখুন।');
    if (costPrice === '' || Number(costPrice) < 0) return setFormError('সঠিক ক্রয়মূল্য দিন।');
    if (wholesalePrice === '' || Number(wholesalePrice) < 0) return setFormError('সঠিক পাইকারি মূল্য দিন।');
    if (retailPrice === '' || Number(retailPrice) < 0) return setFormError('সঠিক খুচরা মূল্য দিন।');
    if (stock === '' || Number(stock) < 0) return setFormError('সঠিক স্টক সংখ্যা দিন।');

    setIsSubmitting(true);

    try {
      const bookPayload: Omit<Book, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        author: author.trim(),
        publisher: selectedPublisherName,
        costPrice: Number(costPrice),
        wholesalePrice: Number(wholesalePrice),
        retailPrice: Number(retailPrice),
        stock: Number(stock),
        supplierInfo: supplierInfo.trim(),
        promotionalTag: promotionalTag ? promotionalTag.trim() : undefined,
        promoDescription: promoDescription ? promoDescription.trim() : undefined
      };

      await onSave(bookPayload);
      onClose();
    } catch (error: any) {
      setFormError(`প্রক্রিয়াটি সম্পন্ন করা যায়নি: ${error.message || error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="book-form-modal-overlay">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-scaleIn">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold font-sans">
                {isEditing ? 'বইয়ের বিবরণী সংশোধন করুন' : 'নতুন বই যুক্ত করুন'}
              </h2>
              <p className="text-emerald-100 text-xs mt-1">
                বাংলাবাজার পাবলিশার্স রিয়েল-টাইম স্টক আপডেট সিস্টেম
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Error Message */}
            {formError && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-2 text-rose-700 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">ত্রুটি ধরা পড়েছে:</span> {formError}
                </div>
              </div>
            )}

            {/* Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Book Name */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">বইয়ের নাম <span className="text-rose-500">*</span></label>
                <input 
                  type="text"
                  placeholder="যেমন: মাধবীলতা, হিমু সমগ্র ইত্যাদি..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-sans text-sm text-slate-800 font-medium"
                  required
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">লেখক / সম্পাদক <span className="text-rose-500">*</span></label>
                <input 
                  type="text"
                  placeholder="যেমন: হুমায়ূন আহমেদ"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-sans text-sm text-slate-800"
                  required
                />
              </div>

              {/* Publisher Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">প্রকাশনী <span className="text-rose-500">*</span></label>
                <select
                  value={isCustomPublisher ? 'others' : publisher}
                  onChange={handlePublisherChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white transition-all font-sans text-sm text-slate-800"
                >
                  {POPULAR_PUBLISHERS.map((pub) => (
                    <option key={pub} value={pub}>{pub}</option>
                  ))}
                  <option value="others">অন্যান্য প্রকাশনী (ম্যানুয়াল লিখুন)</option>
                </select>
              </div>

              {/* Custom Publisher Name (Conditional) */}
              {isCustomPublisher && (
                <div className="col-span-1 sm:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100 animate-fadeIn">
                  <label className="block text-xs font-semibold text-emerald-800 mb-1">যেকোনো প্রকাশনীর নাম লিখুন</label>
                  <input 
                    type="text"
                    placeholder="যেমন: অন্বেষা প্রকাশন, শোভা প্রকাশ..."
                    value={customPublisher}
                    onChange={(e) => setCustomPublisher(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-sans text-sm text-slate-800"
                    required
                  />
                </div>
              )}

              {/* Prices Title Bar */}
              <div className="col-span-1 sm:col-span-2 border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-2">মূল্য ও স্টক তালিকা (টাকা ও পিস)</span>
              </div>

              {/* Cost Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">ক্রয়মূল্য (৳ BDT) <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold font-mono">৳</span>
                  <input 
                    type="number"
                    min="0"
                    placeholder="যেমন: ১৫০০"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono text-sm text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Wholesale Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">পাইকারি মূল্য (৳ BDT) <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold font-mono">৳</span>
                  <input 
                    type="number"
                    min="0"
                    placeholder="যেমন: ১৮০০"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono text-sm text-slate-800 font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Retail Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">খুচরা মূল্য (৳ BDT) <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold font-mono">৳</span>
                  <input 
                    type="number"
                    min="0"
                    placeholder="যেমন: ২২০০"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono text-sm text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">স্টক সংখ্যা (কপি) <span className="text-rose-500">*</span></label>
                <input 
                  type="number"
                  min="0"
                  placeholder="যেমন: ৪৫০"
                  value={stock}
                  onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono text-sm text-slate-800 font-semibold"
                  required
                />
              </div>

              {/* Supplier Info */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">সরবরাহকারীর তথ্য</label>
                <input 
                  type="text"
                  placeholder="যেমন: রফিক বুক ডিস্ট্রিবিউশন, ৪৫ বিউটি প্লাজা, বাংলাবাজার"
                  value={supplierInfo}
                  onChange={(e) => setSupplierInfo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-sans text-sm text-slate-800"
                />
              </div>

              {/* Promo elementsTitle Bar */}
              <div className="col-span-1 sm:col-span-2 border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-2">ব্র্যান্ড প্রচার ও প্রমোশন মডিউল (বিজ্ঞাপনী ধাঁচ)</span>
              </div>

              {/* Promotional Tag Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-505 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" /> প্রচারণামূলক ব্যাজ (Tag)
                </label>
                <select
                  value={promotionalTag}
                  onChange={(e) => setPromotionalTag(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-sans text-sm text-slate-800"
                >
                  <option value="">কোনো ব্যাজ নেই</option>
                  {PROMO_TAGS.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              {/* Pitch Generation Trigger block */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleGeneratePromoPitch}
                  className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer h-10 mb-0.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  প্রফেশনাল পিচ জেনারেটর
                </button>
              </div>

              {/* Promo Description */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  বইটির আকর্ষক ও প্রফেশনাল প্রচারণামূলক বিবরণী
                </label>
                <textarea 
                  rows={3}
                  placeholder="বইটি ক্রেতাদের কাছে মনোহরভাবে তুলে ধরতে এখানে বিবরণী লিখুন বা উপরের জেনারেটর বাটনে ক্লিক করুন..."
                  value={promoDescription}
                  onChange={(e) => setPromoDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-sans text-xs text-slate-700 leading-relaxed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block leading-normal">
                  * এই বিবরণটি বইয়ের বিস্তারিত ভিউ প্যানেলে অত্যন্ত আকর্ষণীয় ও জমকালো প্রচারণামূলক স্টাইলে প্রদর্শিত হবে, যা কাস্টমারকে অর্ডার করতে অনুপ্রাণিত করে।
                </span>
              </div>

            </div>

            {/* Footer Form buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-emerald-700/10 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    সংরক্ষণ হচ্ছে...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {isEditing ? 'সংশোধন সংরক্ষণ করুন' : 'নতুন বই যুক্ত করুন'}
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
