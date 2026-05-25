/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  subscribeToBooks, 
  addBook, 
  updateBook, 
  deleteBook, 
  resetToDefaultStock,
  isFirebaseConfigured
} from './firebase';
import { Book } from './types';
import BrandingHeader from './components/BrandingHeader';
import DashboardStats from './components/DashboardStats';
import BookForm from './components/BookForm';
import BookDetailModal from './components/BookDetailModal';
import ImportModal from './components/ImportModal';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Filter, 
  RotateCcw, 
  FileDown, 
  Sparkles, 
  Tag, 
  AlertTriangle,
  BookOpen,
  Upload
} from 'lucide-react';

export default function App() {
  // Inventory State
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [publisherFilter, setPublisherFilter] = useState('');
  const [promoTagFilter, setPromoTagFilter] = useState('');

  // Modals management
  const [selectedBookForEdit, setSelectedBookForEdit] = useState<Book | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Book | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Load books in real-time
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToBooks((updatedBooks) => {
      setBooks(updatedBooks);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter calculations: All unique publishers in current books
  const uniquePublishers = useMemo(() => {
    const list = books.map(b => b.publisher).filter(Boolean);
    return Array.from(new Set(list));
  }, [books]);

  // Filter calculations: All unique tags in current books
  const uniqueTags = useMemo(() => {
    const list = books.map(b => b.promotionalTag).filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [books]);

  // Filter & Search computation
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = 
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.supplierInfo && book.supplierInfo.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPublisher = !publisherFilter || book.publisher === publisherFilter;
      const matchesTag = !promoTagFilter || book.promotionalTag === promoTagFilter;

      return matchesSearch && matchesPublisher && matchesTag;
    });
  }, [books, searchQuery, publisherFilter, promoTagFilter]);

  // Handle Form Opener (Create mode)
  const handleOpenCreateModal = () => {
    setSelectedBookForEdit(null);
    setIsFormOpen(true);
  };

  // Handle Form Opener (Edit mode)
  const handleOpenEditModal = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering Row click details
    setSelectedBookForEdit(book);
    setIsFormOpen(true);
  };

  // Handle View Detail Modal
  const handleOpenDetailModal = (book: Book, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedBookForDetail(book);
  };

  // Handle Book Saving (Create / Update router)
  const handleSaveBook = async (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedBookForEdit) {
        // Edit mode
        await updateBook(selectedBookForEdit.id, bookData);
      } else {
        // Create mode
        await addBook(bookData);
      }
      setErrorMessage(null);
    } catch (err: any) {
      console.error("Error saving book:", err);
      setErrorMessage(`সংরক্ষণ করতে সমস্যা হয়েছে: ${err.message || err}`);
      throw err; // Forward to form component to stop loading spinner
    }
  };

  // Handle Delete operation with clean alert check
  const handleDeleteBook = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering click events on Parent row
    const confirmDelete = window.confirm(`"${name}" বইটি মওজুদ তালিকা থেকে চিরতরে মুছে ফেলতে আপনি কি নিশ্চিত?`);
    if (confirmDelete) {
      try {
        await deleteBook(id);
        setErrorMessage(null);
      } catch (err: any) {
        console.error("Error deleting book:", err);
        setErrorMessage(`মুছে ফেলা যায়নি: ${err.message || err}`);
      }
    }
  };

  // Reset to sample core books (Demo utility)
  const handleResetStock = () => {
    const confirmReset = window.confirm("আপনি কি স্টক তালিকা রিসেট করে বাংলাবাজারের প্রধান নমুনা বইগুলো পুনরায় লোড করতে চান?");
    if (confirmReset) {
      resetToDefaultStock();
    }
  };

  // CSV Catalog Exporter simulator
  const handleExportCSV = () => {
    if (filteredBooks.length === 0) return alert("রপ্তানি করার মতো কোনো বই নেই!");
    
    // Construct CSV text
    const headers = "বইয়ের নাম,লেখক ও সম্পাদক,প্রকাশক,ক্রয়মূল্য,পাইকারি মূল্য,খুচরা মূল্য,স্টক সংখ্যা,সরবরাহকারী\n";
    const rows = filteredBooks.map(b => 
      `"${b.name}","${b.author}","${b.publisher}",${b.costPrice},${b.wholesalePrice},${b.retailPrice},${b.stock},"${b.supplierInfo || ''}"`
    ).join("\n");
    
    const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Banglabazar_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Formatting currency helper BDT
  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace("BDT", "৳");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-800" id="applet-main-canvas">
      {/* Branding Logo & Header section */}
      <BrandingHeader />

      {/* Main body viewport */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 w-full space-y-6">

        {/* Global Action/Error Notice */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-100 px-4 py-3 rounded-2xl flex items-center justify-between text-rose-700 text-xs animate-shake">
            <p className="font-semibold">{errorMessage}</p>
            <button onClick={() => setErrorMessage(null)} className="px-2 py-1 font-bold bg-white/50 border border-slate-200 rounded-lg">ঠিক আছে</button>
          </div>
        )}

        {/* Quick Dashboard Statistics */}
        {!isLoading && <DashboardStats books={books} />}

        {/* Inventory filters, search and utility options panel */}
        <section className="bg-white rounded-3xl p-4 md:p-6 border border-slate-100 shadow-xs" id="inventory-controls-section">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            
            {/* Filtering parameters (Left side) */}
            <div className="flex flex-wrap items-center gap-3 flex-grow md:max-w-4xl">
              
              {/* Live Search bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
                <input 
                  type="text"
                  placeholder="বইয়ের নাম, লেখক, বা সরবরাহকারী অনুসন্ধান..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 hover:bg-slate-50 transition-all font-sans text-xs text-slate-850"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded-lg"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Publisher Dropdown Filter */}
              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={publisherFilter}
                  onChange={(e) => setPublisherFilter(e.target.value)}
                  className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">সকল প্রকাশনী</option>
                  {uniquePublishers.map(pub => (
                    <option key={pub} value={pub}>{pub}</option>
                  ))}
                </select>
              </div>

              {/* Promo Tag Filter */}
              <select
                value={promoTagFilter}
                onChange={(e) => setPromoTagFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">সকল ব্র্যান্ড ব্যাজ/ট্যাগ</option>
                {uniqueTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>

              {/* Reset to Default Stock Button */}
              <button
                onClick={handleResetStock}
                title="নমুনা ডেমো ডাটা রিকভার করুন"
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 max-md:flex-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-xs font-semibold md:hidden">রিসেট ডেমো</span>
              </button>

            </div>

            {/* Main Action Buttons (Right side) */}
            <div className="flex flex-wrap items-center gap-2 max-md:w-full">
              
              {/* CSV Export Button */}
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer max-md:flex-1 justify-center active:scale-95"
              >
                <FileDown className="w-4 h-4" />
                তালিকা এক্সপোর্ট
              </button>

              {/* Import Button */}
              <button
                onClick={() => setIsImportOpen(true)}
                className="px-4 py-2.5 border border-emerald-250 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer max-md:flex-1 justify-center active:scale-95"
              >
                <Upload className="w-4 h-4 text-emerald-700" />
                তালিকা ইমপোর্ট (Excel/Google Sheet/Word)
              </button>

              {/* Add New Book Trigger button */}
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-emerald-700/10 cursor-pointer max-md:flex-1 justify-center active:scale-95"
              >
                <Plus className="w-4.5 h-4.5 text-emerald-100" />
                নতুন বই যোগ করুন
              </button>

            </div>

          </div>
        </section>

        {/* Inventory main statistics grid & inventory spreadsheet */}
        <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-lg/5 transition-all duration-300" id="inventory-table-container">
          
          {/* Headline bar */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">
                মওজুদ ও সরবরাহ আড়ৎ তালিকা ({filteredBooks.length} টি আইটেম সক্রিয়)
              </h2>
            </div>
            
            {/* Visual filtering badge */}
            {(publisherFilter || promoTagFilter || searchQuery) && (
              <span className="self-start text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                ফিল্টার প্রয়োগ করা আছে
                <button 
                  onClick={() => {
                    setPublisherFilter('');
                    setPromoTagFilter('');
                    setSearchQuery('');
                  }} 
                  className="font-extrabold hover:text-rose-600 ml-1 font-mono"
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          {/* Loader State */}
          {isLoading ? (
            <div className="p-16 text-center space-y-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-700" />
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">রিয়েল-টাইম ডাটা সিঙ্ক হচ্ছে...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            /* Empty State */
            <div className="p-16 text-center max-w-md mx-auto space-y-4">
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-full w-fit mx-auto">
                <BookOpen className="w-8 h-8 opacity-75" />
              </div>
              <h2 className="text-base font-bold text-slate-800">কোনো বই খুঁজে পাওয়া যায়নি</h2>
              <p className="text-xs text-slate-400 leading-relaxed leading-normal">
                আপনার দেওয়া অনুসন্ধান বা ফিল্টারের শর্তের সাথে মিলছে এমন কোনো বই নেই। ডেমো ডাটা রিকভার করতে রিসেট বোতামে চাপুন অথবা নতুন বই যুক্ত করুন।
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setPublisherFilter('');
                  setPromoTagFilter('');
                }}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                ফিল্টার মুছুন
              </button>
            </div>
          ) : (
            /* Main Spreadsheet Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="py-4 px-6">বইয়ের নাম ও বিবরণ</th>
                    <th className="py-4 px-4">লেখক / সম্পাদক</th>
                    <th className="py-4 px-4">প্রকাশক</th>
                    <th className="py-4 px-4 text-right">ক্রয়মূল্য</th>
                    <th className="py-4 px-4 text-right">পাইকারি মূল্য</th>
                    <th className="py-4 px-4 text-right">খুচরা মূল্য</th>
                    <th className="py-4 px-4 text-center">স্টক সংখ্যা</th>
                    <th className="py-4 px-4">সরবরাহকারী</th>
                    <th className="py-4 px-6 text-center">অপারেশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredBooks.map((book) => {
                    const isLowStock = book.stock > 0 && book.stock <= 10;
                    const isOutOfStock = book.stock === 0;

                    return (
                      <tr 
                        key={book.id} 
                        onClick={() => handleOpenDetailModal(book)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      >
                        {/* Book Title & Promo Badge */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1.5 max-w-[200px]">
                            <span className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">
                              {book.name}
                            </span>
                            {/* Promotional badge displayed nicely */}
                            {book.promotionalTag ? (
                              <span className="self-start px-2 py-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/55 rounded-full flex items-center gap-1 uppercase tracking-tight">
                                <Tag className="w-2.5 h-2.5 text-emerald-600" />
                                {book.promotionalTag}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 line-clamp-1 italic">
                                বিবরণী যুক্ত আছে
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Author */}
                        <td className="py-4 px-4 text-slate-700 font-medium">
                          {book.author}
                        </td>

                        {/* Publisher */}
                        <td className="py-4 px-4 text-slate-600">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium text-[11px]">
                            {book.publisher}
                          </span>
                        </td>

                        {/* Cost Price */}
                        <td className="py-4 px-4 text-right text-slate-700 font-mono">
                          {formatBDT(book.costPrice)}
                        </td>

                        {/* Wholesale Price */}
                        <td className="py-4 px-4 text-right text-emerald-700 font-mono font-bold text-sm bg-emerald-50/5 group-hover:bg-emerald-50/20">
                          {formatBDT(book.wholesalePrice)}
                        </td>

                        {/* Retail Price */}
                        <td className="py-4 px-4 text-right text-slate-600 font-mono">
                          {formatBDT(book.retailPrice)}
                        </td>

                        {/* Stock Quantity */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex justify-center flex-col items-center">
                            <span className={`font-mono font-bold text-sm ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600 font-extrabold' : 'text-slate-800'}`}>
                              {book.stock} পিস
                            </span>
                            {isOutOfStock ? (
                              <span className="px-1.5 py-0.5 text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-200 rounded-md mt-1 flex items-center gap-0.5">
                                শেষ
                              </span>
                            ) : isLowStock ? (
                              <span className="px-1.5 py-0.5 text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 rounded-md mt-1 flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" /> কম
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Supplier address info */}
                        <td className="py-4 px-4 text-slate-500 max-w-[150px] truncate" title={book.supplierInfo}>
                          {book.supplierInfo || "—"}
                        </td>

                        {/* Row operation buttons */}
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-1">
                            {/* View Detail Button */}
                            <button
                              onClick={(e) => handleOpenDetailModal(book, e)}
                              title="ব্র্যান্ড প্রমোশন ও পাইকারি স্লিপ"
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {/* Edit Button */}
                            <button
                              onClick={(e) => handleOpenEditModal(book, e)}
                              title="বইয়ের বিবরণ সংশোধন"
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50/70 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={(e) => handleDeleteBook(book.id, book.name, e)}
                              title="মওজুদ থেকে বাদ দিন"
                              className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50/70 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Tailored user help cards */}
        <section className="bg-emerald-950 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="px-2.5 py-1 text-[10px] font-bold bg-white/10 border border-white/20 text-emerald-300 rounded-full inline-block uppercase tracking-wider">
              বাংলাবাজার বুক গিল্ড পরামর্শ
            </span>
            <h3 className="text-xl md:text-2xl font-bold font-sans">
              "ব্র্যান্ডের সঠিক প্রচারেই বাণিজ্যের প্রসার।"
            </h3>
            <p className="text-xs md:text-sm text-emerald-200 leading-relaxed font-sans font-medium">
              আপনার প্রকাশনীর প্রতিটি বইকে পেশাদারী প্রচার টিম যেভাবে উপস্থাপন করে, ঠিক সেভাবে তুলে ধরুন। নতুন বই যোগ বা এডিট করার সময় <strong>"প্রফেশনাল পিচ জেনারেটর"</strong> বোতামে চাপ দিন। সিস্টেমটি চমৎকার বাংলা সাহিত্যিক স্টাইলে আপনার বইয়ের জন্য আলাদা আকর্ষক একটি সামাজিক বিজ্ঞাপন-রেডি টেক্সট জেনারেট করবে, যা আপনি সরাসরি যেকোনো ডিলারের পাইকারি বিবরণী শিট হিসেবে বা সামাজিক যোগাযোগ মাধ্যমে ব্যবহার করতে পারবেন!
            </p>
          </div>
        </section>

      </main>

      {/* Modern footer layout */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 text-center text-xs mt-12">
        <div className="max-w-7xl mx-auto space-y-3">
          <p className="font-semibold text-slate-300">
            বাংলাবাজার বইঘর পাবলিশার্স ইনভেন্টরি ম্যানেজমেন্ট সিস্টেম
          </p>
          <p className="font-sans italic">
            "দামে সাশ্রয়, মানে জয়" • বাংলাবাজার, ঢাকা, বাংলাদেশ
          </p>
          <p className="text-slate-500 font-mono">
            &copy; 2026 Banglabazar Book Inventory. All Rights Reserved. System Version 1.4.0 (Live Core Auth)
          </p>
        </div>
      </footer>

      {/* Book Add/Edit Form Modal */}
      {isFormOpen && (
        <BookForm 
          bookToEdit={selectedBookForEdit}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveBook}
        />
      )}

      {/* Book Details Showcase Modal */}
      {selectedBookForDetail && (
        <BookDetailModal 
          book={selectedBookForDetail}
          onClose={() => setSelectedBookForDetail(null)}
        />
      )}

      {/* Book Excel/CSV/Sheets Import Modal */}
      {isImportOpen && (
        <ImportModal 
          onClose={() => setIsImportOpen(false)}
          onImportComplete={(count) => {
            alert(`সাফল্যের সাথে ${count}টি বই আপনার বাংলাবাজার স্টক তালিকায় যুক্ত করা হয়েছে!`);
          }}
          onAddBookDirect={addBook}
        />
      )}

    </div>
  );
}
