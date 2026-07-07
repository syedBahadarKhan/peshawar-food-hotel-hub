/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Landmark, TrendingUp } from 'lucide-react';

interface AdSenseAreaProps {
  slot: 'sidebar' | 'banner' | 'in-feed';
  className?: string;
}

export default function AdSenseArea({ slot, className = '' }: AdSenseAreaProps) {
  const [showAd, setShowAd] = useState(true);

  if (!showAd) return null;

  const styleMap = {
    sidebar: {
      height: 'h-64',
      label: 'Recommended Local Deals',
      desc: 'Sponsored by Peshawar Tourism & Crafts Association',
      icon: Landmark
    },
    banner: {
      height: 'h-24',
      label: 'Featured Stay Booking Offers',
      desc: 'Save up to 25% on luxury stays in Peshawar this summer',
      icon: TrendingUp
    },
    'in-feed': {
      height: 'h-32',
      label: 'Traditional Peshawar Kahwa & Spices',
      desc: 'Get authentic Peshawari green tea leaves delivered to your doorstep.',
      icon: TrendingUp
    }
  };

  const config = styleMap[slot];
  const Icon = config.icon;

  return (
    <div 
      className={`relative overflow-hidden bg-amber-50/70 border border-dashed border-amber-300 rounded-xl p-4 flex flex-col justify-between ${config.height} ${className}`}
      id={`adsense-slot-${slot}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600/80 bg-amber-100 px-1.5 py-0.5 rounded">
          Sponsored Ad
        </span>
        <button 
          onClick={() => setShowAd(false)}
          className="text-amber-500 hover:text-amber-800 text-xs font-semibold hover:underline cursor-pointer"
        >
          Dismiss
        </button>
      </div>

      <div className="flex items-center gap-3 my-2">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
          <Icon size={20} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-amber-900 leading-tight">
            {config.label}
          </h4>
          <p className="text-xs text-amber-700/90 mt-0.5">
            {config.desc}
          </p>
        </div>
      </div>

      <div className="text-[9px] text-amber-500/80 text-right font-mono">
        AdSense Slot ID: ca-pub-peshawar-{slot}-44
      </div>
    </div>
  );
}
