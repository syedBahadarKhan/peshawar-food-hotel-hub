/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Place } from '../types.ts';
import { Coffee, User as UserIcon, LogOut, Heart, ArrowLeftRight, Settings, UtensilsCrossed } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  compareList: Place[];
  onOpenCompare: () => void;
  showAdmin: boolean;
  onToggleAdmin: () => void;
  activeTab: 'all' | 'restaurant' | 'hotel';
  setActiveTab: (tab: 'all' | 'restaurant' | 'hotel') => void;
}

export default function Navbar({
  user,
  onLogout,
  onOpenAuth,
  compareList,
  onOpenCompare,
  showAdmin,
  onToggleAdmin,
  activeTab,
  setActiveTab
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/20">
              <UtensilsCrossed size={22} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-sans leading-none flex items-center gap-1.5">
                Peshawar <span className="text-emerald-700 font-medium text-xs sm:text-sm bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Hub</span>
              </h1>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block mt-0.5">
                Food & Hotel Guide
              </span>
            </div>
          </div>

          {/* Quick Category Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-200/50'
              }`}
            >
              All Hubs
            </button>
            <button
              onClick={() => setActiveTab('restaurant')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === 'restaurant'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-200/50'
              }`}
            >
              Restaurants
            </button>
            <button
              onClick={() => setActiveTab('hotel')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === 'hotel'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-200/50'
              }`}
            >
              Hotels & Lodging
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Compare Tool Toggle */}
            <button
              onClick={onOpenCompare}
              className={`relative px-3 py-2 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all text-xs font-bold ${
                compareList.length > 0
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              title="Compare selected places"
            >
              <ArrowLeftRight size={14} className={compareList.length > 0 ? 'animate-pulse text-emerald-700' : ''} />
              <span className="hidden sm:inline">Compare</span>
              {compareList.length > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Auth section */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Admin Button */}
                {user.isAdmin && (
                  <button
                    onClick={onToggleAdmin}
                    className={`p-2 rounded-xl border cursor-pointer transition-all ${
                      showAdmin 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Toggle Admin Panel"
                  >
                    <Settings size={15} />
                  </button>
                )}

                {/* Profile Greeting */}
                <div className="hidden lg:flex flex-col items-end text-right">
                  <span className="text-xs font-bold text-gray-800 leading-none">
                    {user.name}
                  </span>
                  {user.isAdmin && (
                    <span className="text-[9px] font-mono font-bold text-emerald-700 mt-0.5">
                      ADMIN PRIVILEGES
                    </span>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl border border-gray-200 text-gray-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-100 cursor-pointer transition-all flex items-center gap-1.5"
                  title="Logout"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline text-xs font-bold">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 hover:shadow-lg hover:shadow-emerald-600/10"
              >
                <UserIcon size={14} />
                <span>Join / Login</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}
