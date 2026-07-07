/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChangeEvent } from 'react';
import { Filter, RotateCcw, DollarSign, Star, Users, MapPin, Tag } from 'lucide-react';
import { Filters } from '../types.ts';

interface FilterBarProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  availableCategories: string[];
  availableLocations: string[];
}

export default function FilterBar({ filters, setFilters, availableCategories, availableLocations }: FilterBarProps) {
  const handleLocationChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, location: e.target.value });
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, category: e.target.value });
  };

  const handlePriceChange = (price: string) => {
    setFilters({ ...filters, priceRange: filters.priceRange === price ? '' : price });
  };

  const handleEnvironmentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, environment: e.target.value });
  };

  const handleRatingChange = (rating: number) => {
    setFilters({ ...filters, rating: filters.rating === rating ? 0 : rating });
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      type: 'all',
      location: '',
      category: '',
      priceRange: '',
      environment: '',
      rating: 0
    });
  };

  const hasActiveFilters = 
    filters.searchQuery !== '' ||
    filters.type !== 'all' ||
    filters.location !== '' ||
    filters.category !== '' ||
    filters.priceRange !== '' ||
    filters.environment !== '' ||
    filters.rating !== 0;

  return (
    <div 
      className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm"
      id="filter-panel-bar"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Header Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <Filter size={16} className="text-emerald-700" />
            <span>Refine Search</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="lg:hidden text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1 lg:max-w-4xl">
          
          {/* Location Select */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
              <MapPin size={10} className="text-emerald-600" />
              Location
            </label>
            <select
              value={filters.location}
              onChange={handleLocationChange}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Locations</option>
              {availableLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
              <Tag size={10} className="text-emerald-600" />
              Category
            </label>
            <select
              value={filters.category}
              onChange={handleCategoryChange}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Categories</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Environment Select */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
              <Users size={10} className="text-emerald-600" />
              Vibe / Crowd
            </label>
            <select
              value={filters.environment}
              onChange={handleEnvironmentChange}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Environments</option>
              <option value="Family-friendly">Family-friendly</option>
              <option value="Casual">Casual</option>
              <option value="Friends">Friends</option>
              <option value="Couples">Couples</option>
              <option value="Formal">Formal</option>
            </select>
          </div>

          {/* Rating filter (Stars Selection) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
              <Star size={10} className="text-emerald-600" />
              Rating
            </label>
            <div className="flex items-center gap-1 h-[34px]">
              {[4, 4.5, 4.8].map(stars => (
                <button
                   key={stars}
                   onClick={() => handleRatingChange(stars)}
                   className={`flex-1 py-1 px-1.5 border rounded-lg text-[10px] font-bold text-center cursor-pointer transition-all ${
                     filters.rating === stars
                       ? 'bg-emerald-600 border-emerald-600 text-white'
                       : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                   }`}
                   title={`${stars}+ Stars`}
                >
                  {stars}★+
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Price & Reset Panel */}
        <div className="flex items-end sm:items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 border-gray-100 pt-3 lg:pt-0 shrink-0">
          
          {/* Price Range Buttons */}
          <div className="space-y-1 shrink-0">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
              <DollarSign size={10} className="text-emerald-600" />
              Price Range
            </label>
            <div className="flex items-center gap-1">
              {['$', '$$', '$$$'].map(p => (
                <button
                  key={p}
                  onClick={() => handlePriceChange(p)}
                  className={`w-9 h-8 border text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center ${
                    filters.priceRange === p
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  title={p === '$' ? 'Budget' : p === '$$' ? 'Mid-range' : 'Premium'}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Desktop */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-xs font-bold text-gray-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 rounded-lg cursor-pointer transition-all self-end h-[34px]"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
