/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Place } from '../types.ts';
import { Star, MapPin, ArrowLeftRight, Utensils, Bed, Phone, Sparkles } from 'lucide-react';

interface ItemCardProps {
  place: Place;
  onViewDetails: (place: Place) => void;
  onToggleCompare: (place: Place) => void;
  isComparing: boolean;
}

export default function ItemCard({ place, onViewDetails, onToggleCompare, isComparing }: ItemCardProps) {
  return (
    <div 
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col group h-full"
      id={`place-card-${place.id}`}
    >
      {/* Thumbnail Container */}
      <div className="relative h-48 overflow-hidden bg-gray-100 shrink-0">
        <img
          src={place.images[0] || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs ${
            place.type === 'restaurant' ? 'bg-emerald-600' : 'bg-slate-800'
          }`}>
            {place.type === 'restaurant' ? (
              <span className="flex items-center gap-1"><Utensils size={10} /> Food</span>
            ) : (
              <span className="flex items-center gap-1"><Bed size={10} /> Lodging</span>
            )}
          </span>

          {place.isFeatured && (
            <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles size={9} />
              Featured
            </span>
          )}
        </div>

        {/* Price range indicator */}
        <div className="absolute bottom-3 right-3 bg-black/75 text-white px-2.5 py-0.5 rounded-md text-[11px] font-black font-mono">
          {place.priceRange === '$' ? 'BUDGET' : place.priceRange === '$$' ? 'MID-TIER' : 'PREMIUM'}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Rating and Reviews */}
          <div className="flex items-center gap-1 text-xs">
            <div className="flex items-center text-amber-500 font-bold">
              <Star size={13} fill="currentColor" />
              <span className="ml-0.5">{place.rating > 0 ? place.rating : 'New'}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500 font-semibold">
              {place.reviewCount} {place.reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {/* Place Title */}
          <h3 className="text-base font-black text-gray-900 group-hover:text-emerald-800 transition-colors tracking-tight font-sans">
            {place.name}
          </h3>

          {/* Location / neighborhood info */}
          <div className="flex items-center gap-1 text-xs text-gray-600 font-semibold">
            <MapPin size={12} className="text-gray-400" />
            <span>{place.location} Neighborhood</span>
          </div>

          {/* Core Description (truncated) */}
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {place.description}
          </p>

          {/* Specialties Display */}
          {place.bestDishes && place.bestDishes.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block w-full mb-0.5">
                {place.type === 'restaurant' ? 'Must Order' : 'Key Offers'}
              </span>
              {place.bestDishes.map(dish => (
                <span 
                  key={dish}
                  className="bg-emerald-50 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100"
                >
                  {dish}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Bottom Actions panel */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 shrink-0">
          
          {/* Compare Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(place);
            }}
            className={`flex items-center justify-center gap-1 px-3 py-1.5 border rounded-xl text-xs font-bold cursor-pointer transition-all ${
              isComparing 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-500/20' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            title="Toggle item in side-by-side comparison"
          >
            <ArrowLeftRight size={13} />
            <span>{isComparing ? 'Comparing' : 'Compare'}</span>
          </button>

          {/* View Details Action */}
          <button
            onClick={() => onViewDetails(place)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-xl text-center cursor-pointer transition-all hover:shadow-lg hover:shadow-emerald-600/10"
          >
            Explore Hub
          </button>

        </div>
      </div>
    </div>
  );
}
