/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChangeEvent } from 'react';
import { Search, MapPin, Sparkles, Utensils, Hotel as HotelIcon } from 'lucide-react';
import { Filters } from '../types.ts';

interface HeroProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  onOpenAIRecommend: () => void;
}

export default function Hero({ filters, setFilters, onOpenAIRecommend }: HeroProps) {
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchQuery: e.target.value });
  };

  const setCategory = (cat: string) => {
    setFilters({ ...filters, category: filters.category === cat ? '' : cat });
  };

  const setLocation = (loc: string) => {
    setFilters({ ...filters, location: filters.location === loc ? '' : loc });
  };

  const setType = (type: 'all' | 'restaurant' | 'hotel') => {
    setFilters({ ...filters, type });
  };

  return (
    <section className="relative bg-slate-900 text-white overflow-hidden py-12 sm:py-16 md:py-20 px-4">
      {/* Decorative Traditional Mesh Background / Emerald glowing blobs */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500/20 blur-[100px] rounded-full"></div>
      </div>
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        
        {/* Localization Greeting */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
          <Sparkles size={12} />
          <span>Peshawar\'s Premier Hospitality Directory</span>
        </div>

        {/* Hero Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans tracking-tight text-white leading-[1.1] mb-4">
          Discover Authentic <span className="text-emerald-400">Peshawari Flavors</span> & Premium Stays
        </h2>
        
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          From legendary sizzlers at Jalil Chapli Kabab & Charsi Tikka to exquisite 5-star lodging at Serena. Find, review, and compare the hospitality gems of Peshawar.
        </p>

        {/* Core Search Container */}
        <div className="bg-white p-2 rounded-2xl shadow-xl border border-white/10 flex flex-col md:flex-row items-stretch gap-2 max-w-3xl mx-auto text-slate-900">
          
          {/* Main search bar */}
          <div className="flex-1 flex items-center gap-2 px-3 border-b md:border-b-0 md:border-r border-slate-100 py-2">
            <Search className="text-slate-400 shrink-0" size={18} />
            <input
              type="text"
              placeholder="Search dishes, names, categories (e.g. Chapli Kabab, Serena, BBQ)..."
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-400 font-sans"
            />
          </div>

          {/* Quick Hub Type Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setType('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                filters.type === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setType('restaurant')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                filters.type === 'restaurant' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Food
            </button>
            <button
              onClick={() => setType('hotel')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                filters.type === 'hotel' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Stays
            </button>
          </div>

          {/* Action Trigger for AI */}
          <button
            onClick={onOpenAIRecommend}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/10 hover:scale-[1.02] shrink-0"
          >
            <Sparkles size={16} className="text-white" />
            <span>Suggest Food AI</span>
          </button>
        </div>

        {/* Quick Shortcut Suggestions */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-xs">
          <span className="text-slate-400 font-mono uppercase tracking-wider text-[10px]">Popular Locations:</span>
          {['Hayatabad', 'University Town', 'Saddar'].map(loc => (
            <button
              key={loc}
              onClick={() => setLocation(loc)}
              className={`px-3 py-1 rounded-full border cursor-pointer transition-all ${
                filters.location === loc
                  ? 'bg-emerald-400 border-emerald-400 text-emerald-950 font-bold'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span className="flex items-center gap-1">
                <MapPin size={10} />
                {loc}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Food Specialties Shortcuts */}
        <div className="mt-3 flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-xs">
          <span className="text-slate-400 font-mono uppercase tracking-wider text-[10px]">Categories:</span>
          {['BBQ', 'Desi', 'Fast Food', 'Luxury Stay', 'Budget Stay'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full border cursor-pointer transition-all ${
                filters.category === cat
                  ? 'bg-emerald-400 border-emerald-400 text-emerald-950 font-bold'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
