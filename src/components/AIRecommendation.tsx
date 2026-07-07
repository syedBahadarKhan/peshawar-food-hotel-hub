/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Sparkles, Utensils, Compass, ArrowRight, Lightbulb, RefreshCw, Smile, Landmark } from 'lucide-react';
import { Place } from '../types.ts';

interface AIRecommendationProps {
  isOpen: boolean;
  onClose: () => void;
  places: Place[];
  onSelectPlaceById: (id: string) => void;
}

export default function AIRecommendation({ isOpen, onClose, places, onSelectPlaceById }: AIRecommendationProps) {
  const [mood, setMood] = useState('');
  const [budget, setBudget] = useState('');
  const [groupType, setGroupType] = useState('');
  const [typePreference, setTypePreference] = useState('all');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [recommendation, setRecommendation] = useState<{
    rationale: string;
    recommendedIds: string[];
    aiTips: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleRecommend = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendation(null);

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood,
          budget,
          groupType,
          typePreference
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch recommendation.');
      }

      setRecommendation(data);
    } catch (err: any) {
      setError(err.message || 'AI engine is currently offline. Please ensure GEMINI_API_KEY is configured in Secrets panel.');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceInfo = (id: string) => {
    return places.find(p => p.id === id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
        id="ai-recommendation-panel"
      >
        {/* Header Panel */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-slate-900 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md">
              <Sparkles size={20} className="animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight font-sans">
                Peshawari Kahwa Assistant
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                AI-powered localized recommendations based on your cravings, mood, and budget
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-black/20 p-1.5 rounded-full cursor-pointer transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Inputs Section */}
          <form onSubmit={handleRecommend} className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 space-y-4">
            <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
              <Compass size={14} /> Customize Your Recommendation
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mood craving field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">What are you in the mood for?</label>
                <input
                  type="text"
                  placeholder="e.g. mutton dumba karahi, crispy pizza, cozy coffee"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Group environment field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Who are you going with?</label>
                <select
                  value={groupType}
                  onChange={(e) => setGroupType(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                >
                  <option value="">Any setting</option>
                  <option value="Family-friendly">Family-friendly</option>
                  <option value="Casual with friends">Casual with friends</option>
                  <option value="Couples">Couples</option>
                  <option value="Formal dinner / Business">Formal dinner / Business</option>
                </select>
              </div>

              {/* Budget tier */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Budget Constraint</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                >
                  <option value="">Any Budget</option>
                  <option value="$">Budget Friendly ($)</option>
                  <option value="$$">Mid-tier ($$)</option>
                  <option value="$$$">Premium Luxury ($$$)</option>
                </select>
              </div>

              {/* Preferences type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">What class of Hub?</label>
                <select
                  value={typePreference}
                  onChange={(e) => setTypePreference(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                >
                  <option value="all">Both Restaurants & Hotels</option>
                  <option value="restaurant">Only Restaurants (Food)</option>
                  <option value="hotel">Only Hotels (Stays)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/10"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Consulting the Sages...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Get Intelligent Recommendations</span>
                </>
              )}
            </button>
          </form>

          {/* Loader */}
          {loading && (
            <div className="text-center py-10 space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-gray-500 font-mono italic">
                Brewing green tea and scanning catalog of Peshawar gems...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-xl text-xs text-rose-700">
              <p className="font-bold">Recommendation Blocked:</p>
              <p className="mt-1 leading-normal">{error}</p>
              <div className="mt-3 bg-white p-2.5 border border-rose-200 rounded-lg flex items-center gap-2 text-[10px] text-gray-500 font-sans">
                <Landmark size={14} className="text-emerald-700" />
                <span>By default, please verify that your **GEMINI_API_KEY** is configured securely inside AI Studio's **Settings &gt; Secrets** page.</span>
              </div>
            </div>
          )}

          {/* Output Results */}
          {recommendation && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Rationale Bubble */}
              <div className="bg-emerald-50 border border-emerald-200/50 p-5 rounded-2xl relative">
                <div className="absolute -top-3 left-6 px-2.5 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-black uppercase">
                  AI Recommendation Rationale
                </div>
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-sans mt-1">
                  "{recommendation.rationale}"
                </p>
              </div>

              {/* Specific Catalog Cards */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                  Recommended Places in Peshawar:
                </h4>
                {recommendation.recommendedIds.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No direct database matches found, but check out the AI tips below!</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {recommendation.recommendedIds.map(id => {
                      const p = getPlaceInfo(id);
                      if (!p) return null;
                      return (
                        <div 
                          key={p.id}
                          onClick={() => {
                            onSelectPlaceById(p.id);
                            onClose();
                          }}
                          className="bg-white hover:bg-emerald-50/20 border border-gray-200 hover:border-emerald-300 p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-gray-900 group-hover:text-emerald-800 transition-colors">
                                {p.name}
                              </h5>
                              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                                {p.category} • {p.location} Neighborhood
                              </p>
                            </div>
                          </div>
                          <button className="p-1.5 bg-emerald-100 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white rounded-lg transition-all shrink-0">
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Local Tips */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                  Localized Dining & Travel Tips:
                </h4>
                <ul className="space-y-2">
                  {recommendation.aiTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
                      <div className="p-1 bg-emerald-100 text-emerald-700 rounded-md shrink-0 mt-0.5">
                        <Lightbulb size={12} />
                      </div>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
