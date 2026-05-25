/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Database, CheckCircle2, AlertCircle, HelpCircle, Sliders } from 'lucide-react';
import { isFirebaseConfigured, firebaseConfig } from '../firebase';

export default function BrandingHeader() {
  const [showConfigDetails, setShowConfigDetails] = useState(false);

  return (
    <header className="bg-gradient-to-r from-emerald-800 via-emerald-950 to-slate-900 text-white shadow-lg border-b border-emerald-700/30">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Logo & Slogan Column */}
          <div className="flex items-start gap-4" id="brand-logo-container">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-inner flex items-center justify-center text-emerald-300">
              <BookOpen className="w-10 h-10 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-300">
                  বাংলাবাজার বইঘর
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full">
                  পাবলিশার্স ও হোলসেল
                </span>
              </div>
              <p className="mt-2 text-base md:text-lg font-medium text-emerald-200 tracking-wide inline-block border-b-2 border-emerald-500/30 pb-1 italic font-sans">
                "দামে সাশ্রয়, মানে জয়"
              </p>
            </div>
          </div>

          {/* Database Connection Status Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div 
              onClick={() => setShowConfigDetails(!showConfigDetails)}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 shadow-md ${
                isFirebaseConfigured 
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200 hover:bg-emerald-900/50' 
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-200 hover:bg-amber-900/50'
              }`}
              id="db-status-bar"
            >
              <Database className={`w-5 h-5 ${isFirebaseConfigured ? 'text-emerald-400' : 'text-amber-400'}`} />
              <div className="text-left select-none">
                <div className="text-xs font-mono tracking-wider uppercase opacity-80">ডাটাবেজ সংযোগ অবস্থা</div>
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  {isFirebaseConfigured ? (
                    <>
                      Firestore সক্রিয় আছে
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                    </>
                  ) : (
                    <>
                      লোকাল স্টোরেজ (মক সক্রিয়)
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 inline" />
                    </>
                  )}
                </div>
              </div>
              <Sliders className="w-4 h-4 ml-2 opacity-75" />
            </div>
          </div>
        </div>

        {/* Configuration Panel Guidance */}
        {showConfigDetails && (
          <div className="mt-6 p-5 bg-slate-900/80 border border-emerald-500/20 rounded-xl backdrop-blur-md animate-fadeIn text-slate-200 text-sm">
            <h3 className="text-emerald-300 font-semibold mb-3 flex items-center gap-2 text-base">
              <Database className="w-5 h-5" /> ফায়ারবেজ (Firebase) সংযোগ নির্দেশিকা
            </h3>
            <p className="mb-4 leading-relaxed text-slate-300">
              অ্যাপ্লিকেশনটি রিয়েল-টাইমে ফায়ারবেস ক্লাউড ফায়ারস্টোর (Firestore)-এর সাথে সিঙ্ক করার জন্য তৈরি করা হয়েছে। আপনি সহজেই নিচের ফাইলটিতে আপনার নিজের ফায়ারবেস কনফিগারেশন যোগ করে এটিকে লাইভ ডাটাবেজ দিতে পারেন:
            </p>
            
            <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto mb-4 border border-slate-800">
              <span className="text-slate-500">// Project File Path: </span>src/firebase.ts<br/><br/>
              export const firebaseConfig = &#123;<br/>
              &nbsp;&nbsp;apiKey: <span className="text-amber-300">"YOUR_API_KEY"</span>,<br/>
              &nbsp;&nbsp;authDomain: <span className="text-amber-300">"YOUR_AUTH_DOMAIN"</span>,<br/>
              &nbsp;&nbsp;projectId: <span className="text-amber-300">"YOUR_PROJECT_ID"</span>,<br/>
              &nbsp;&nbsp;...<br/>
              &#125;;
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-800">
              <div className="flex-1 flex gap-2 items-start text-xs text-slate-400 leading-normal">
                <InfoIcon className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                <span>
                  <strong>লোকাল স্টোরেজ নিরাপত্তা:</strong> যদি কনফিগারেশন সেট করা না থাকে, তবে ডাটা হারানোর কোনো ভয় নেই। আপনার সমস্ত ডাটা ব্রাউজারের LocalStorage-এ নিরাপদে সংরক্ষিত হবে এবং সম্পূর্ণ কার্যকারিতা বজায় থাকবে।
                </span>
              </div>
              <button 
                onClick={() => setShowConfigDetails(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
              >
                প্যানেল বন্ধ করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
