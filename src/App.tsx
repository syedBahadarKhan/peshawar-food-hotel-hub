/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Place, Filters, User } from './types.ts';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import FilterBar from './components/FilterBar.tsx';
import ItemCard from './components/ItemCard.tsx';
import DetailModal from './components/DetailModal.tsx';
import ComparisonTool from './components/ComparisonTool.tsx';
import AIRecommendation from './components/AIRecommendation.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import AuthModal from './components/AuthModal.tsx';
import AdSenseArea from './components/AdSenseArea.tsx';
import { Sparkles, HelpCircle, Utensils, Award, BookOpen, MapPin, Star } from 'lucide-react';

export default function App() {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Core Data Lists
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filtering State
  const [filters, setFilters] = useState<Filters>({
    searchQuery: '',
    type: 'all',
    location: '',
    category: '',
    priceRange: '',
    environment: '',
    rating: 0,
  });

  // Unique Lists extracted from seed data dynamically for dropdown filters
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  // Interactive UI / Comparative Basket State
  const [compareList, setCompareList] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Overlay / Modal Triggers
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Sync user profile from active session token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('peshawar_hub_token');
    if (savedToken) {
      setToken(savedToken);
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
        .then(res => {
          if (!res.ok) {
            // invalid or expired token
            localStorage.removeItem('peshawar_hub_token');
            setToken(null);
            return null;
          }
          return res.json();
        })
        .then(data => {
          if (data && data.user) {
            setUser(data.user);
          }
        })
        .catch(err => console.error('Token sync failed', err));
    }
  }, []);

  // Fetch places based on active search queries and filters
  const fetchPlaces = async () => {
    setLoading(true);
    setError('');

    // Construct URL query parameters
    const params = new URLSearchParams();
    if (filters.searchQuery) params.append('query', filters.searchQuery);
    if (filters.type !== 'all') params.append('type', filters.type);
    if (filters.location) params.append('location', filters.location);
    if (filters.category) params.append('category', filters.category);
    if (filters.priceRange) params.append('priceRange', filters.priceRange);
    if (filters.environment) params.append('environment', filters.environment);
    if (filters.rating > 0) params.append('rating', String(filters.rating));

    try {
      const response = await fetch(`/api/places?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve Peshawar catalog listings.');
      }
      const data = await response.json();
      setPlaces(data);

      // Populate unique categories and locations for filter selection dropdowns on initial mount
      if (availableCategories.length === 0 || availableLocations.length === 0) {
        const cats = new Set<string>();
        const locs = new Set<string>();
        data.forEach((p: Place) => {
          cats.add(p.category);
          locs.add(p.location);
        });
        setAvailableCategories(Array.from(cats));
        setAvailableLocations(Array.from(locs));
      }
    } catch (err: any) {
      setError(err.message || 'Network connection failed.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch places whenever filters are modified
  useEffect(() => {
    fetchPlaces();
  }, [filters]);

  const handleAuthSuccess = (authUser: User, sessionToken: string) => {
    setUser(authUser);
    setToken(sessionToken);
    localStorage.setItem('peshawar_hub_token', sessionToken);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('peshawar_hub_token');
    setIsAdminOpen(false);
  };

  const handleToggleCompare = (place: Place) => {
    setCompareList(prev => {
      const exists = prev.some(p => p.id === place.id);
      if (exists) {
        return prev.filter(p => p.id !== place.id);
      } else {
        if (prev.length >= 3) {
          alert('You can compare a maximum of 3 places side-by-side.');
          return prev;
        }
        return [...prev, place];
      }
    });
  };

  const handleRemoveFromCompare = (place: Place) => {
    setCompareList(prev => prev.filter(p => p.id !== place.id));
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  const handleSelectPlaceById = (id: string) => {
    const target = places.find(p => p.id === id);
    if (target) {
      setSelectedPlace(target);
    } else {
      // In case the item is filtered out, fetch it by direct API call
      fetch(`/api/places/${id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setSelectedPlace(data);
        })
        .catch(err => console.error('Failed to resolve recommended place ID', err));
    }
  };

  // Callback to sync parent listing stars in real-time when a review is submitted in the modal
  const handleReviewSubmitted = () => {
    fetchPlaces();
    if (selectedPlace) {
      // refresh active selectedPlace details in real-time
      fetch(`/api/places/${selectedPlace.id}`)
        .then(res => res.json())
        .then(data => setSelectedPlace(data))
        .catch(e => console.error('Failed to sync details rating', e));
    }
  };

  // Admin panel database synchronization callbacks
  const handlePlaceAdded = (newPlace: Place) => {
    setPlaces(prev => [newPlace, ...prev]);
    fetchPlaces();
  };

  const handlePlaceUpdated = (updatedPlace: Place) => {
    setPlaces(prev => prev.map(p => p.id === updatedPlace.id ? updatedPlace : p));
    fetchPlaces();
  };

  const handlePlaceDeleted = (id: string) => {
    setPlaces(prev => prev.filter(p => p.id !== id));
    setCompareList(prev => prev.filter(p => p.id !== id));
    if (selectedPlace?.id === id) {
      setSelectedPlace(null);
    }
    fetchPlaces();
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans antialiased text-gray-800 flex flex-col">
      {/* Dynamic Header */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        compareList={compareList}
        onOpenCompare={() => setIsCompareOpen(true)}
        showAdmin={isAdminOpen}
        onToggleAdmin={() => setIsAdminOpen(!isAdminOpen)}
        activeTab={filters.type}
        setActiveTab={(type) => setFilters(prev => ({ ...prev, type }))}
      />

      {/* Hero section */}
      <Hero
        filters={filters}
        setFilters={setFilters}
        onOpenAIRecommend={() => setIsAIOpen(true)}
      />

      {/* Main Grid Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col gap-8">
        
        {/* Responsive Granular Filter bar */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          availableCategories={availableCategories}
          availableLocations={availableLocations}
        />

        {/* Content Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT COLUMN: Dynamic Catalog Grid */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Header counters */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider">
                {filters.type === 'all' ? 'All Peshawar Spots' : filters.type === 'restaurant' ? 'Restaurants' : 'Hotels & Stay hubs'} ({places.length})
              </h3>
              
              {/* Optional featured status indicator */}
              <span className="text-xs text-gray-400 font-mono">
                Peshawar Time: {new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} PST
              </span>
            </div>

            {/* Error handling */}
            {error && (
              <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-xl text-xs text-rose-700">
                {error}
              </div>
            )}

            {/* Loader */}
            {loading ? (
              <div className="text-center py-20 space-y-3">
                <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-gray-500 font-mono italic">Fetching matching listings...</p>
              </div>
            ) : places.length === 0 ? (
              <div className="text-center py-20 bg-white border border-dashed rounded-2xl p-6">
                <p className="text-sm text-gray-500 font-bold">No Peshawar spots match your filters.</p>
                <button
                  onClick={() => setFilters({
                    searchQuery: '',
                    type: 'all',
                    location: '',
                    category: '',
                    priceRange: '',
                    environment: '',
                    rating: 0
                  })}
                  className="mt-4 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {places.map((place, index) => (
                  <div key={place.id} className="h-full">
                    <ItemCard
                      place={place}
                      onViewDetails={setSelectedPlace}
                      onToggleCompare={handleToggleCompare}
                      isComparing={compareList.some(p => p.id === place.id)}
                    />
                    
                    {/* Insert AdSense between listings (for monetization placement test after 3 items) */}
                    {index === 2 && (
                      <div className="col-span-1 md:col-span-2 my-6">
                        <AdSenseArea slot="banner" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Sidebar containing AdSense and Local Cultural Info */}
          <div className="space-y-6">
            
            {/* Sidebar AdSense Placement */}
            <AdSenseArea slot="sidebar" />

            {/* AI Callout Widget */}
            <div className="bg-gradient-to-br from-amber-700 to-amber-950 text-white rounded-2xl p-5 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] w-full h-full pointer-events-none"></div>
              <Sparkles className="text-amber-300 absolute -bottom-4 -right-4 w-24 h-24 opacity-15 rotate-12" />
              
              <h4 className="text-sm font-black uppercase tracking-tight text-amber-300 flex items-center gap-1.5 font-sans leading-none">
                <Sparkles size={16} /> Suggestions AI
              </h4>
              <p className="text-xs text-amber-100/90 leading-relaxed mt-2">
                Feeling adventurous? Let our smart assistant suggest the best culinary highlights, chapli kabab joints, or hotel stays in Peshawar matching your current craving.
              </p>
              <button
                onClick={() => setIsAIOpen(true)}
                className="w-full mt-4 bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold py-2 rounded-xl text-center cursor-pointer transition-all hover:shadow-lg"
              >
                Let AI Recommend
              </button>
            </div>

            {/* "Did you know?" Educational Peshawar Cultural Info Widget */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
                <BookOpen size={14} className="text-amber-700" />
                Peshawari Gastronomy 101
              </h4>

              <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
                <div className="space-y-1">
                  <h5 className="font-bold text-gray-900 flex items-center gap-1">
                    <Utensils size={12} className="text-amber-700" />
                    Legend of Chapli Kabab
                  </h5>
                  <p>
                    Authentic Chapli Kababs are made from pure minced beef or mutton, flavored with crushed pomegranate seeds (Anardana), fresh mint, coriander, and pan-fried exclusively in local fat.
                  </p>
                </div>

                <div className="space-y-1">
                  <h5 className="font-bold text-gray-900 flex items-center gap-1">
                    <Award size={12} className="text-amber-700" />
                    Peshawari Green Tea (Kahwa)
                  </h5>
                  <p>
                    Never leave a meal without green tea! Traditionally served with cardamoms, lemon juice, and occasionally saffron, local Peshawari Kahwa aids digestion and marks our warm hospitality.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Dynamic Overlays / Modal Mounting */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <ComparisonTool
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        compareList={compareList}
        onRemoveFromCompare={handleRemoveFromCompare}
        onClearCompare={handleClearCompare}
        onViewDetails={(place) => setSelectedPlace(place)}
      />

      <AIRecommendation
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        places={places}
        onSelectPlaceById={handleSelectPlaceById}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        places={places}
        onPlaceAdded={handlePlaceAdded}
        onPlaceUpdated={handlePlaceUpdated}
        onPlaceDeleted={handlePlaceDeleted}
        token={token}
      />

      <DetailModal
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        token={token}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Footer Branding section */}
      <footer className="bg-stone-900 text-stone-400 py-10 mt-16 border-t border-stone-800 text-xs shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-700/20 text-amber-500 rounded-lg">
              <Utensils size={16} />
            </div>
            <div>
              <span className="font-black text-white block">Peshawar Food & Hotel Hub</span>
              <span className="text-[10px] text-stone-500">Traditional Hospitality Reimagined</span>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="hover:text-white transition-colors cursor-pointer">Hayatabad</span>
            <span className="hover:text-white transition-colors cursor-pointer">University Town</span>
            <span className="hover:text-white transition-colors cursor-pointer">Saddar</span>
          </div>

          <div className="text-center md:text-right text-[10px] text-stone-500">
            © 2026 Peshawar Hub. Built for elite discovery and localized side-by-side comparison.
          </div>
        </div>
      </footer>
    </div>
  );
}
