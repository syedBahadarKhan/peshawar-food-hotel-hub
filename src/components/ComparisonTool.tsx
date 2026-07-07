/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Place } from '../types.ts';
import { X, ArrowLeftRight, Check, MapPin, DollarSign, Users, Award, ShieldAlert } from 'lucide-react';

interface ComparisonToolProps {
  isOpen: boolean;
  onClose: () => void;
  compareList: Place[];
  onRemoveFromCompare: (place: Place) => void;
  onClearCompare: () => void;
  onViewDetails: (place: Place) => void;
}

export default function ComparisonTool({
  isOpen,
  onClose,
  compareList,
  onRemoveFromCompare,
  onClearCompare,
  onViewDetails
}: ComparisonToolProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
        id="compare-tool-container"
      >
        {/* Header Panel */}
        <div className="bg-gradient-to-r from-emerald-800 to-slate-900 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <ArrowLeftRight size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight font-sans">
                Side-by-Side Comparison Hub
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                Compare {compareList.length} selected places to pick the perfect destination
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {compareList.length > 0 && (
              <button
                onClick={onClearCompare}
                className="text-xs text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white bg-black/20 rounded-full cursor-pointer transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {compareList.length === 0 ? (
            <div className="text-center py-16 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                <ArrowLeftRight size={32} />
              </div>
              <h4 className="text-base font-bold text-gray-900">Your Comparison Basket is Empty</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Browse Peshawar\'s food joints or lodging houses, click **"Compare"** on 2 or 3 items, and they will populate here side-by-side automatically!
              </p>
              <button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all"
              >
                Back to Listings
              </button>
            </div>
          ) : compareList.length === 1 ? (
            <div className="text-center py-16 space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                <ShieldAlert size={24} />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Add Another Place to Compare</h4>
              <p className="text-xs text-gray-500">
                You have selected **"{compareList[0].name}"**. You need to select at least 2 places to compare them side-by-side.
              </p>
              <button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all"
              >
                Select Another Place
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {compareList.map(place => (
                <div 
                  key={place.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative group"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveFromCompare(place)}
                    className="absolute top-3 right-3 z-10 p-1.5 bg-black/60 hover:bg-rose-700 text-white rounded-full cursor-pointer transition-all"
                    title="Remove from comparison"
                  >
                    <X size={12} />
                  </button>

                  <div className="space-y-4">
                    {/* Visual Card Image */}
                    <div className="h-36 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={place.images[0]}
                        alt={place.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Identification */}
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {place.category}
                      </span>
                      <h4 className="text-base font-black text-gray-900 mt-2 font-sans tracking-tight leading-snug">
                        {place.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono uppercase">{place.type}</p>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Metrics Comparison Grid */}
                    <div className="space-y-2.5 text-xs text-gray-700 font-medium">
                      
                      {/* Price comparisons */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-[11px] uppercase tracking-wider font-bold flex items-center gap-1">
                          <DollarSign size={12} /> Price Level
                        </span>
                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded font-mono">
                          {place.priceRange === '$' ? 'Budget ($)' : place.priceRange === '$$' ? 'Mid-tier ($$)' : 'Premium ($$$)'}
                        </span>
                      </div>

                      {/* Ratings comparisons */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-[11px] uppercase tracking-wider font-bold flex items-center gap-1">
                          ★ Customer Score
                        </span>
                        <span className="font-bold text-emerald-700">
                          {place.rating > 0 ? `${place.rating} / 5.0` : 'No reviews'} ({place.reviewCount} reviews)
                        </span>
                      </div>

                      {/* Location comparisons */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-[11px] uppercase tracking-wider font-bold flex items-center gap-1">
                          <MapPin size={12} /> Neighborhood
                        </span>
                        <span className="font-bold text-gray-900">
                          {place.location}
                        </span>
                      </div>

                      {/* Vibe comparisons */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-[11px] uppercase tracking-wider font-bold flex items-center gap-1">
                          <Users size={12} /> Crowd / Environment
                        </span>
                        <span className="font-bold text-gray-900 bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-md">
                          {place.environment}
                        </span>
                      </div>

                      {/* Key highlights / Specialties */}
                      <div className="space-y-1">
                        <span className="text-gray-400 text-[11px] uppercase tracking-wider font-bold flex items-center gap-1">
                          <Award size={12} /> Must-Try / Key Highlight
                        </span>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {place.bestDishes.map(dish => (
                            <span 
                              key={dish}
                              className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded"
                            >
                              {dish}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Short Description */}
                      <div className="space-y-1">
                        <span className="text-gray-400 text-[11px] uppercase tracking-wider font-bold">
                          Quick Summary
                        </span>
                        <p className="text-xs text-gray-500 leading-normal line-clamp-3 italic">
                          "{place.description}"
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Explore Details Trigger */}
                  <button
                    onClick={() => {
                      onViewDetails(place);
                      onClose();
                    }}
                    className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:shadow-emerald-600/10"
                  >
                    Explore This Hub
                  </button>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
