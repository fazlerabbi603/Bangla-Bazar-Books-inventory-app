/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  FileText, 
  Clipboard, 
  Upload, 
  Check, 
  AlertCircle, 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  Table, 
  Info,
  Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Book } from '../types';

interface ImportModalProps {
  onClose: () => void;
  onImportComplete: (importedBooksCount: number) => void;
  onAddBookDirect: (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
}

type ImportTab = 'excel' | 'paste' | 'word';

export default function ImportModal({ onClose, onImportComplete, onAddBookDirect }: ImportModalProps) {
  // Tabs management
  const [activeTab, setActiveTab] = useState<ImportTab>('excel');
  
  // File upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // Raw parsed data
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<any[][]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Paste state
  const [pastedText, setPastedText] = useState('');

  // Column Mapping state
  const [columnMapping, setColumnMapping] = useState<{
    name: number;
    author: number;
    publisher: number;
    costPrice: number;
    wholesalePrice: number;
    retailPrice: number;
    stock: number;
    supplierInfo: number;
  }>({
    name: -1,
    author: -1,
    publisher: -1,
    costPrice: -1,
    wholesalePrice: -1,
    retailPrice: -1,
    stock: -1,
    supplierInfo: -1
  });

  // Controls
  const [isImporting, setIsImporting] = useState(false);
  const [autoGeneratePromo, setAutoGeneratePromo] = useState(true);
  const [promoTagDefault, setPromoTagDefault] = useState('নতুন সংস্করণ');

  // Helper: Reset parsing state
  const resetParsing = () => {
    setParsedHeaders([]);
    setParsedRows([]);
    setErrorMessage(null);
    setFileName('');
  };

  // Helper: Try to auto-map columns based on common Bangla and English names
  const autoMapColumns = (headers: string[]) => {
    const mapping = {
      name: -1,
      author: -1,
      publisher: -1,
      costPrice: -1,
      wholesalePrice: -1,
      retailPrice: -1,
      stock: -1,
      supplierInfo: -1
    };

    headers.forEach((header, idx) => {
      const h = header.toLowerCase().trim();
      
      // Book name mapping
      if (h.includes('বই') || h.includes('নাম') || h.includes('book') || h.includes('title')) {
        if (mapping.name === -1) mapping.name = idx;
      }
      // Author mapping
      else if (h.includes('লেখক') || h.includes('সম্পাদক') || h.includes('author') || h.includes('writer') || h.includes('editor')) {
        if (mapping.author === -1) mapping.author = idx;
      }
      // Publisher mapping
      else if (h.includes('প্রকাশক') || h.includes('প্রকাশনী') || h.includes('publisher') || h.includes('press')) {
        if (mapping.publisher === -1) mapping.publisher = idx;
      }
      // Cost price mapping
      else if (h.includes('ক্রয়') || h.includes('উৎপাদন') || h.includes('cost') || h.includes('buy')) {
        if (mapping.costPrice === -1) mapping.costPrice = idx;
      }
      // Wholesale price mapping
      else if (h.includes('পাইকারি') || h.includes('wholesale') || h.includes('trade')) {
        if (mapping.wholesalePrice === -1) mapping.wholesalePrice = idx;
      }
      // Retail price mapping
      else if (h.includes('খুচরা') || h.includes('গায়ের') || h.includes('retail') || h.includes('mrp') || h.includes('price')) {
        if (mapping.retailPrice === -1) mapping.retailPrice = idx;
      }
      // Stock mapping
      else if (h.includes('স্টক') || h.includes('সংখ্যা') || h.includes('মওজুদ') || h.includes('stock') || h.includes('qty') || h.includes('quantity')) {
        if (mapping.stock === -1) mapping.stock = idx;
      }
      // Supplier mapping
      else if (h.includes('সরবরাহ') || h.includes('ঠিকানা') || h.includes('supplier') || h.includes('source')) {
        if (mapping.supplierInfo === -1) mapping.supplierInfo = idx;
      }
    });

    setColumnMapping(mapping);
  };

  // 1. Core Loader: Handle Excel File Upload using xlsx
  const processExcelFile = (file: File) => {
    setFileName(file.name);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Use the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to 2D Array
        const jsonRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonRows.length === 0) {
          setErrorMessage('নির্বাচিত এক্সেল ফাইলে কোনো ডাটা পাওয়া যায়নি!');
          return;
        }

        // Extract headers (first non-empty row)
        let headerRowIndex = 0;
        while (headerRowIndex < jsonRows.length && (!jsonRows[headerRowIndex] || jsonRows[headerRowIndex].length === 0)) {
          headerRowIndex++;
        }

        if (headerRowIndex >= jsonRows.length) {
          setErrorMessage('ফাইলে কোনো বৈধ কলাম বা রো খুঁজে পাওয়া যায়নি!');
          return;
        }

        const headers = jsonRows[headerRowIndex].map(h => h !== undefined && h !== null ? String(h) : '');
        const rows = jsonRows.slice(headerRowIndex + 1).filter(r => r && r.length > 0);

        setParsedHeaders(headers);
        setParsedRows(rows);
        autoMapColumns(headers);
      } catch (err: any) {
        console.error("Excel Read Error: ", err);
        setErrorMessage(`এক্সেল ফাইলটি পড়তে সমস্যা হয়েছে: ${err.message || err}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Word file simulator & guide
  const processWordTextList = (text: string) => {
    setErrorMessage(null);
    if (!text.trim()) {
      setErrorMessage('অনুগ্রহ করে বইয়ের তালিকাটি কপি বা টাইপ করুন!');
      return;
    }

    // Split into individual lines
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Auto detect separators like: Comma (,), Semicolon (;), Hyphen (-), Tab (\t)
    const rows: string[][] = [];
    let discoveredHeaders = ['ইনপুট টেক্সট বিবরণী'];

    lines.forEach(line => {
      // Find separator
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes('|')) {
        parts = line.split('|');
      } else if (line.includes(' - ')) {
        parts = line.split(' - ');
      } else if (line.includes(',')) {
        parts = line.split(',');
      } else {
        parts = [line];
      }
      rows.push(parts.map(p => p.trim()));
    });

    // Create virtual columns
    const maxColumns = Math.max(...rows.map(r => r.length));
    const headers: string[] = [];
    for (let i = 1; i <= maxColumns; i++) {
      headers.push(`কলাম ${i}`);
    }

    setParsedHeaders(headers);
    setParsedRows(rows);
    autoMapColumns(headers);
  };

  // Google Sheets copy-paste TSV parser
  const handlePasteProcess = () => {
    if (!pastedText.trim()) {
      setErrorMessage('আগে তথ্য পেস্ট করুন!');
      return;
    }

    setFileName("Google Sheets / Excel কপি-পেস্ট ডাটা");
    processWordTextList(pastedText);
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
        processExcelFile(file);
      } else {
        file.text().then(text => processWordTextList(text));
      }
    }
  };

  // File manual select click
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  // Pitch dynamic assistant (from main prompt requirements)
  const generateBengaliPromoPitch = (name: string, author: string, publisher: string, tag: string) => {
    return `দ্বিদ্ধাহীন মননশীলতা! বাংলাবাজারের পাঠকনন্দিত বই "${name}"। লেখক ও গবেষক ${author}-এর সৃষ্টিশীল লেখনী এবং ${publisher}-এর মানসম্মত মুদ্রণে প্রকাশিত এই আকর্ষণীয় কালেকশনটি আপনার লাইব্রেরিতে নিয়ে আসবে চমৎকার জ্ঞানের আবহ। ${tag} হিসেবে সমাদৃত এই অমূল্য মাস্টারপিসটি সরাসরি দামে সাশ্রয়ী ও প্রকাশনী রেটে স্টক মওজুদ রয়েছে। দ্রুত ও নিরাপদে হোলসেল বুকিং দিতে এখনই যোগাযোগ করুন!`;
  };

  // Trigger main importer save router
  const handleImportExecute = async () => {
    // Basic verification mapping is set at least for Name and Authors
    if (columnMapping.name === -1) {
      setErrorMessage('ম্যাপিং ত্রুটি: অবশ্যই একটি কলামকে "বইয়ের নাম" হিসেবে ম্যাপ নির্ধারণ করতে হবে!');
      return;
    }

    setIsImporting(true);
    setErrorMessage(null);

    let importCount = 0;
    try {
      for (const row of parsedRows) {
        // Retrieve values from mapped index
        const nameVal = row[columnMapping.name]?.toString() || '';
        
        // Skip empty book name lines
        if (!nameVal.trim()) continue;

        const authorVal = columnMapping.author !== -1 ? (row[columnMapping.author]?.toString() || '') : 'অজ্ঞাত লেখক';
        const publisherVal = columnMapping.publisher !== -1 ? (row[columnMapping.publisher]?.toString() || '') : 'বাংলাবাজার প্রকাশনী';
        
        const costVal = columnMapping.costPrice !== -1 ? Number(row[columnMapping.costPrice]) : 150;
        const wholesaleVal = columnMapping.wholesalePrice !== -1 ? Number(row[columnMapping.wholesalePrice]) : 200;
        const retailVal = columnMapping.retailPrice !== -1 ? Number(row[columnMapping.retailPrice]) : 300;
        const stockVal = columnMapping.stock !== -1 ? Number(row[columnMapping.stock]) : 50;
        const supplierVal = columnMapping.supplierInfo !== -1 ? (row[columnMapping.supplierInfo]?.toString() || '') : 'সরাসরি সরবরাহ';

        const finalCost = isNaN(costVal) || costVal < 0 ? 150 : costVal;
        const finalWholesale = isNaN(wholesaleVal) || wholesaleVal < 0 ? 200 : wholesaleVal;
        const finalRetail = isNaN(retailVal) || retailVal < 0 ? 300 : retailVal;
        const finalStock = isNaN(stockVal) || stockVal < 0 ? 50 : stockVal;

        // Custom brand pitch generation mapping
        const tag = autoGeneratePromo ? promoTagDefault : '';
        const pitch = autoGeneratePromo ? generateBengaliPromoPitch(nameVal, authorVal, publisherVal, tag) : '';

        // Inject book payload to database synchronously
        await onAddBookDirect({
          name: nameVal.trim(),
          author: authorVal.trim(),
          publisher: publisherVal.trim(),
          costPrice: finalCost,
          wholesalePrice: finalWholesale,
          retailPrice: finalRetail,
          stock: finalStock,
          supplierInfo: supplierVal.trim(),
          promotionalTag: tag || undefined,
          promoDescription: pitch || undefined
        });

        importCount++;
      }

      onImportComplete(importCount);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`কিছু ডাটা ইমপোর্ট করতে ত্রুটি হয়েছে: ${err.message || err}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="import-spreadsheet-modal-overlay">
      {/* Backdrop template */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-scaleIn">
          
          {/* Main Top Header Navigation */}
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-6 justify-between items-center sm:flex">
            <div>
              <h2 className="text-xl font-bold font-sans flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-emerald-300" /> ডিজিটাল বই তালিকা ইমপোর্ট সিস্টেম
              </h2>
              <p className="text-emerald-100 text-xs mt-1">
                গুগল শিট, মাইক্রোসফট এক্সেল বা ওয়ার্ড লিস্ট খুব সহজেই এক ক্লিকে স্টক সিস্টেমে যুক্ত করুন
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white cursor-pointer max-sm:absolute max-sm:top-4 max-sm:right-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-2 flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => { setActiveTab('excel'); resetParsing(); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'excel' 
                  ? 'bg-emerald-800 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> এক্সেল ও সিএসভি ফাইল (.xlsx, .csv)
            </button>
            <button
              onClick={() => { setActiveTab('paste'); resetParsing(); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'paste' 
                  ? 'bg-emerald-800 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <Clipboard className="w-4 h-4" /> গুগল শিট / কপি-পেস্ট (Google Sheets)
            </button>
            <button
              onClick={() => { setActiveTab('word'); resetParsing(); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'word' 
                  ? 'bg-emerald-800 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <FileText className="w-4 h-4" /> ওয়ার্ড ও টেক্সট ফাইল (.docx, .txt)
            </button>
          </div>

          {/* Modal Container Body */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            
            {/* Show error notification message if any */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">ইমপোর্ট সিস্টেমে ত্রুটি:</span> {errorMessage}
                </div>
              </div>
            )}

            {/* TAB CONTENT 1: EXCEL & CSV DRAG AND DROP */}
            {activeTab === 'excel' && parsedRows.length === 0 && (
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-emerald-600 bg-emerald-50/20' 
                    : 'border-slate-200 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-350'
                }`}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
                <div className="max-w-md mx-auto space-y-4">
                  <div className="p-4 bg-emerald-50 text-emerald-700 rounded-full w-fit mx-auto shadow-inner">
                    <Upload className="w-8 h-8 animate-bounce text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 font-sans">আপনার এক্সেল বা সিএসভি ফাইলটি এখানে ড্র্যাগ করে ছাড়ুন</h3>
                    <p className="text-slate-400 text-xs mt-1 leading-normal">
                      অথবা আপনার কম্পিউটার বা ডিভাইস থেকে ব্রাউজ করতে এখানে ক্লিক করুন (খুব সহজে .xlsx, .xls এবং .csv ফাইল রিড করতে পারে)
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono bg-white inline-block px-3 py-1 rounded-full border border-slate-200">
                    সমর্থিত সর্বোচ্চ: ২০ এমবি
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: GOOGLE SHEETS COPY PASTE GRID */}
            {activeTab === 'paste' && parsedRows.length === 0 && (
              <div className="space-y-4">
                <div className="bg-amber-50/55 border border-amber-200/50 p-4 rounded-2xl flex gap-3 text-xs text-slate-700 leading-relaxed">
                  <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong className="text-amber-950 font-sans block mb-1">গুগল শিট থেকে কপি করার নিয়ম:</strong>
                    আপনার গুগল স্প্রেডশিট অথবা এক্সেল ফাইলটি খুলুন। পুরো বইয়ের তালিকার রো এবং কলামগুলো মাউস দিয়ে সিলেক্ট করে কিবোর্ডের <strong className="font-mono bg-white border px-1 rounded">Ctrl + C</strong> চাপুন। তারপর নিচের টেক্সট বক্সে মাউস ক্লিক করে <strong className="font-mono bg-white border px-1 rounded">Ctrl + V</strong> চাপুন। আমাদের স্মার্ট টিএসভি ডিকোডার কলাম বিভাজন করে ডেটা সেট করবে!
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="বইয়ের নাম  লেখক  প্রকাশনী  ক্রয়মূল্য  পাইকারি ইত্যাদি কলামসহ ডাটা এখানে পেস্ট করুন..."
                    className="w-full p-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono text-xs text-slate-700"
                  />
                  {pastedText && (
                    <button
                      onClick={() => setPastedText('')}
                      className="absolute right-3 bottom-4 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-2 py-1"
                    >
                      লেখা মুছুন
                    </button>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handlePasteProcess}
                    disabled={!pastedText.trim()}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    পেস্ট করা ডাটা লোড করুন <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: WORD OR PLAIN TEXT FILES LINE BY LINE */}
            {activeTab === 'word' && parsedRows.length === 0 && (
              <div className="space-y-4">
                <div className="bg-emerald-50/50 border border-emerald-250 p-4 rounded-2xl flex gap-3 text-xs text-emerald-800 leading-relaxed">
                  <Info className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <strong className="font-bold block mb-1">যেকোনো টেক্সট বা ওয়ার্ড তালিকা ইমপোর্ট করার নিয়ম:</strong>
                    আপনার ওয়ার্ড ডকুমেন্ট (.docx) অথবা নোটপ্যাড (.txt) ফাইলে থাকা তালিকা থেকে পুরো অংশ সিলেক্ট করে কপি করুন এবং নিচে পেস্ট করুন। বইটি কমা (,), খাড়া দাগ (|) অথবা ড্যাশ (-) দিয়ে আলাদা লাইনে থাকতে পারে। যেমন:<br />
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-250 block mt-1.5 opacity-90">
                      হিমু সমগ্র - হুমায়ূন আহমেদ - অনন্যা প্রকাশনী - ৩২০ টাকা - ৫০ কপি
                    </span>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="আপনার র ফাইল বা ওয়ার্ড তালিকা এখানে পেস্ট করুন..."
                  className="w-full p-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono text-xs text-slate-700"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handlePasteProcess}
                    disabled={!pastedText.trim()}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    লিস্ট এনালাইজার সক্রিয় করুন <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SECOND VIEW: DATA MATCHING & LIVE PREVIEW DATA COLUMN */}
            {parsedRows.length > 0 && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* File Success stats */}
                <div className="bg-slate-950 text-white p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-500">লোডেড সোর্স:</span> <strong className="text-emerald-300 font-mono text-[13px]">{fileName}</strong>
                  </div>
                  <div className="flex gap-4 text-xs font-mono text-emerald-400">
                    <span>মোট রো: <strong>{parsedRows.length}</strong></span>
                    <span>মোট কলাম: <strong>{parsedHeaders.length}</strong></span>
                  </div>
                  <button 
                    onClick={resetParsing}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 hover:text-rose-400 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer font-bold font-sans"
                  >
                    ফাইল পরিবর্তন করুন
                  </button>
                </div>

                {/* Grid Mapping Configurator Panel */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-5 space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-700" /> ১. কলাম ম্যাপিং সেটিংস (খুবই গুরুত্বপূর্ণ!)
                  </h3>
                  <p className="text-xs text-slate-500 leading-normal leading-relaxed">
                    আপনার ফাইলের কলামগুলোর সাথে আমাদের সিস্টেম ডাটাবেজ কলামের মিল করতে ড্রপডাউনগুলো পরিবর্তন করুন। আমরা অটোম্যাপ করার চেষ্টা করেছি, তবুও পরীক্ষা করে নিন:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Map Book Title */}
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">বইয়ের নাম <span className="text-rose-500">*</span></label>
                      <select
                        value={columnMapping.name}
                        onChange={(e) => setColumnMapping({ ...columnMapping, name: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 outline-none text-xs bg-white text-slate-800 font-semibold focus:border-emerald-600"
                      >
                        <option value={-1}>পছন্দ করুন</option>
                        {parsedHeaders.map((h, i) => (
                          <option key={i} value={i}>{h || `কলাম ${i+1}`}</option>
                        ))}
                      </select>
                    </div>

                    {/* Map Author */}
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">লেখক / সম্পাদক</label>
                      <select
                        value={columnMapping.author}
                        onChange={(e) => setColumnMapping({ ...columnMapping, author: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 outline-none text-xs bg-white text-slate-800 focus:border-emerald-600"
                      >
                        <option value={-1}>নির্বাচন করুন (অজ্ঞাত লেখক)</option>
                        {parsedHeaders.map((h, i) => (
                          <option key={i} value={i}>{h || `কলাম ${i+1}`}</option>
                        ))}
                      </select>
                    </div>

                    {/* Map Publisher */}
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">প্রকাশক</label>
                      <select
                        value={columnMapping.publisher}
                        onChange={(e) => setColumnMapping({ ...columnMapping, publisher: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 outline-none text-xs bg-white text-slate-800 focus:border-emerald-600"
                      >
                        <option value={-1}>নির্বাচন করুন (বাংলাবাজার প্রকাশনী)</option>
                        {parsedHeaders.map((h, i) => (
                          <option key={i} value={i}>{h || `কলাম ${i+1}`}</option>
                        ))}
                      </select>
                    </div>

                    {/* Map Cost Price */}
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">ক্রয়মূল্য (৳ BDT)</label>
                      <select
                        value={columnMapping.costPrice}
                        onChange={(e) => setColumnMapping({ ...columnMapping, costPrice: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 outline-none text-xs bg-white text-slate-800 focus:border-emerald-600"
                      >
                        <option value={-1}>ডিফল্ট (৳ ১৫০)</option>
                        {parsedHeaders.map((h, i) => (
                          <option key={i} value={i}>{h || `কলাম ${i+1}`}</option>
                        ))}
                      </select>
                    </div>

                    {/* Map Wholesale Price */}
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">পাইকারি মূল্য (৳ BDT)</label>
                      <select
                        value={columnMapping.wholesalePrice}
                        onChange={(e) => setColumnMapping({ ...columnMapping, wholesalePrice: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 outline-none text-xs bg-white text-slate-800 focus:border-emerald-600"
                      >
                        <option value={-1}>ডিফল্ট (৳ ২০০)</option>
                        {parsedHeaders.map((h, i) => (
                          <option key={i} value={i}>{h || `কলাম ${i+1}`}</option>
                        ))}
                      </select>
                    </div>

                    {/* Map Retail Price */}
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">খুচরা মূল্য (৳ MRP)</label>
                      <select
                        value={columnMapping.retailPrice}
                        onChange={(e) => setColumnMapping({ ...columnMapping, retailPrice: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 outline-none text-xs bg-white text-slate-800 focus:border-emerald-600"
                      >
                        <option value={-1}>ডিফল্ট (৳ ৩০০)</option>
                        {parsedHeaders.map((h, i) => (
                          <option key={i} value={i}>{h || `কলাম ${i+1}`}</option>
                        ))}
                      </select>
                    </div>

                    {/* Map Stock */}
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">স্টক সংখ্যা (কপি)</label>
                      <select
                        value={columnMapping.stock}
                        onChange={(e) => setColumnMapping({ ...columnMapping, stock: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 outline-none text-xs bg-white text-slate-800 focus:border-emerald-600"
                      >
                        <option value={-1}>ডিফল্ট (৫০ পিস)</option>
                        {parsedHeaders.map((h, i) => (
                          <option key={i} value={i}>{h || `কলাম ${i+1}`}</option>
                        ))}
                      </select>
                    </div>

                    {/* Map Supplier Info */}
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">সরবরাহকারী ঠিকানা</label>
                      <select
                        value={columnMapping.supplierInfo}
                        onChange={(e) => setColumnMapping({ ...columnMapping, supplierInfo: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 outline-none text-xs bg-white text-slate-800 focus:border-emerald-600"
                      >
                        <option value={-1}>ডিফল্ট (ফাঁকা রাখুন)</option>
                        {parsedHeaders.map((h, i) => (
                          <option key={i} value={i}>{h || `কলাম ${i+1}`}</option>
                        ))}
                      </select>
                    </div>

                  </div>
                </div>

                {/* Automation Promo Booster option during import */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex gap-3 items-start">
                    <Sparkles className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">ম্যাজিক ব্র্যান্ড প্রমোশন প্যাক সক্রিয় করুন?</h4>
                      <p className="text-[11px] text-emerald-800 mt-1 leading-normal leading-relaxed">
                        ইমপোর্ট হওয়া প্রতিটি বইয়ের জন্য আমাদের বাংলাবাজার পিচ জেনারেটর অটোমেটিক্যালি একটি দারুণ সাহিত্যিক বিজ্ঞাপনী স্লোগান ও বিবরণী ম্যাপ করে ডেটাবেজে সাবমিট করবে।
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:items-center gap-4 max-sm:flex-col shrink-0">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-600">ডিফল্ট ব্যাজ:</label>
                      <select 
                        value={promoTagDefault}
                        disabled={!autoGeneratePromo}
                        onChange={(e) => setPromoTagDefault(e.target.value)}
                        className="px-2 py-1 border border-slate-200 rounded text-xs bg-white disabled:bg-slate-100"
                      >
                        <option value="নতুন সংস্করণ">নতুন সংস্করণ</option>
                        <option value="সর্বকালের বেস্টসেলার">সর্বকালের বেস্টসেলার</option>
                        <option value="স্টক সীমিত">স্টক সীমিত</option>
                        <option value="বিশেষ ছাড় (১৫%)">বিশেষ ছাড় (১৫%)</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={() => setAutoGeneratePromo(!autoGeneratePromo)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                        autoGeneratePromo 
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-md' 
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {autoGeneratePromo ? '✓ ব্র্যান্ডিং সক্রিয় আছে' : 'ব্র্যান্ডিং বন্ধ'}
                    </button>
                  </div>
                </div>

                {/* Parsed spreadsheet preview table */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <Table className="w-4 h-4 text-slate-400" /> ২. লাইভ প্রিভিউ স্প্রেডশিট (প্রথম ৫টি রো প্রদর্শিত)
                  </span>
                  
                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-w-full">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                            {parsedHeaders.map((h, i) => (
                              <th key={i} className="p-2.5 font-mono">{h || `কলাম ${i+1}`}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                          {parsedRows.slice(0, 5).map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50">
                              {parsedHeaders.map((_, cIdx) => (
                                <td key={cIdx} className="p-2.5 max-w-[200px] truncate">{row[cIdx] !== undefined ? String(row[cIdx]) : '—'}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {parsedRows.length > 5 && (
                    <span className="text-[10px] text-slate-400 italic block text-right">
                      * এবং আরও {parsedRows.length - 5} টি আইটেম ইমপোর্টের জন্য প্রস্তুত...
                    </span>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Modal Footer actions */}
          <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-between items-center">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 leading-normal">
              <Info className="w-3.5 h-3.5" />
              ম্যাপ করা হয়নি এমন কলামগুলোর জন্য সিস্টেমে থাকা ডিফল্ট মান ব্যবহৃত হবে।
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                বাতিল করুন
              </button>
              
              {parsedRows.length > 0 && (
                <button
                  type="button"
                  onClick={handleImportExecute}
                  disabled={isImporting || columnMapping.name === -1}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-350 disabled:text-slate-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {isImporting ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      ডাটাবেজে যুক্ত হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {parsedRows.length} টি বই স্টক তালিকায় যোগ করুন
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
