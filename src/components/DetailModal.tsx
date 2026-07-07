/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { Place, Review, User } from '../types.ts';
import { X, Star, MapPin, Phone, Info, Award, MessageSquare, Plus, CheckCircle, ThumbsUp, LogIn, Compass, ShieldAlert } from 'lucide-react';
import AdSenseArea from './AdSenseArea.tsx';

interface DetailModalProps {
  place: Place | null;
  onClose: () => void;
  user: User | null;
  onOpenAuth: () => void;
  token: string | null;
  onReviewSubmitted: () => void;
}

export default function DetailModal({
  place,
  onClose,
  user,
  onOpenAuth,
  token,
  onReviewSubmitted
}: DetailModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Fetch reviews for the selected place
  const fetchReviews = async () => {
    if (!place) return;
    setLoadingReviews(true);
    try {
      const response = await fetch(`/api/places/${place.id}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (e) {
      console.error('Failed to load reviews', e);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (place) {
      setActiveImageIdx(0);
      fetchReviews();
      setRating(5);
      setComment('');
      setReviewError('');
      setReviewSuccess('');
    }
  }, [place]);

  if (!place) return null;

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    if (!comment.trim()) {
      setReviewError('Please write a detailed review comment.');
      setSubmittingReview(false);
      return;
    }

    try {
      const response = await fetch(`/api/places/${place.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setReviewSuccess('Review shared successfully!');
      setComment('');
      setRating(5);
      fetchReviews();
      onReviewSubmitted(); // recalculate parent's ratings in real-time
    } catch (err: any) {
      setReviewError(err.message || 'Error sharing review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleHelpfulToggle = async (reviewId: string) => {
    if (!token) {
      onOpenAuth();
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Optimistically update the UI reviews list
        const updatedReview = await response.json();
        setReviews(prev => prev.map(r => r.id === reviewId ? updatedReview : r));
      }
    } catch (err) {
      console.error('Error toggling helpful status', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
        id="place-detail-modal"
      >
        {/* Header Panel */}
        <div className="relative bg-gradient-to-r from-emerald-800 to-slate-900 p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 p-2 rounded-full cursor-pointer transition-colors"
          >
            ✕
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
              {place.category}
            </span>
            <span className="text-emerald-200 text-xs font-semibold">•</span>
            <span className="text-emerald-200 text-xs font-semibold flex items-center gap-1">
              <MapPin size={12} /> {place.location} Area
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-sans tracking-tight">
            {place.name}
          </h3>
        </div>

        {/* Modal Body Container (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/30">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT: Image Gallery & Contact details */}
            <div className="space-y-4">
              {/* Main Active image */}
              <div className="h-64 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-xs">
                <img
                  src={place.images[activeImageIdx] || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'}
                  alt={place.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Thumbnails switcher */}
              {place.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {place.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                        activeImageIdx === idx ? 'border-emerald-600 ring-2 ring-emerald-600/25' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Contacts Block */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs space-y-2.5 text-xs">
                <h4 className="font-bold text-gray-900 font-sans border-b pb-2 flex items-center gap-1.5 text-xs text-emerald-900 uppercase tracking-wide">
                  <Info size={14} /> Hub Information
                </h4>
                {place.phone && (
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <Phone size={13} className="text-gray-400" />
                    <span>Phone: {place.phone}</span>
                  </div>
                )}
                {place.address && (
                  <div className="flex items-start gap-2 text-gray-700 font-medium">
                    <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                    <span>Address: {place.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <Compass size={13} className="text-gray-400" />
                  <span>Vibe Environment: <strong className="text-emerald-800">{place.environment}</strong></span>
                </div>
              </div>

              {/* Mock Google Maps visual widget */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-3 shadow-xs">
                <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                  <MapPin size={14} className="text-emerald-700" /> Google Maps Directions
                </h4>
                <div className="h-32 bg-emerald-100 rounded-lg relative overflow-hidden border border-emerald-200">
                  {/* Decorative map graphics */}
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent_50%,#047857_50%),linear-gradient(transparent_50%,#047857_50%)] [background-size:24px_24px]"></div>
                  
                  {/* Custom Map Marker pin */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="p-2 bg-rose-600 text-white rounded-full shadow-lg border-2 border-white animate-bounce">
                      <MapPin size={16} />
                    </div>
                    <span className="bg-white px-2 py-0.5 border border-emerald-200 text-[10px] font-bold rounded shadow-md mt-1 text-gray-800">
                      {place.name}
                    </span>
                  </div>
                  
                  {/* Map Scale indicator */}
                  <div className="absolute bottom-2 left-2 bg-white/80 px-1.5 py-0.5 border rounded text-[9px] font-mono text-gray-500">
                    GPS Coordinates: 34.0151° N, 71.5250° E
                  </div>
                </div>
                <p className="text-[10px] text-emerald-800/90 font-semibold leading-relaxed">
                  Located conveniently in <strong>{place.location}, Peshawar</strong>. This destination resides roughly 1.4km from the main Jamrud Road access, with abundant local rickshaw transport.
                </p>
              </div>

            </div>

            {/* RIGHT: Overview, Menu price list & Best dishes */}
            <div className="space-y-6">
              
              {/* Overview */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                  Overview Summary
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                  {place.description}
                </p>
              </div>

              {/* Specialties / Best Dishes list */}
              {place.bestDishes && place.bestDishes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
                    <Award size={14} className="text-emerald-700" />
                    {place.type === 'restaurant' ? 'Signature Dishes' : 'Highlighted Benefits'}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {place.bestDishes.map(dish => (
                      <div 
                        key={dish}
                        className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-2xs"
                      >
                        <CheckCircle size={14} className="text-emerald-700 shrink-0" />
                        <span>{dish}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Price Catalog / Menu list */}
              {place.menu && place.menu.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                    {place.type === 'restaurant' ? 'Menu & Price Catalog' : 'Room Rates & Buffets'}
                  </h4>
                  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                    <div className="divide-y divide-gray-100">
                      {place.menu.map((menuItem, idx) => {
                        // Split menu item into name and price if possible
                        const parts = menuItem.split(' - ');
                        const itemName = parts[0];
                        const itemPrice = parts[1] || '';

                        return (
                          <div key={idx} className="p-3 flex items-center justify-between text-xs font-medium">
                            <span className="text-gray-800 font-bold">{itemName}</span>
                            {itemPrice && (
                              <span className="text-emerald-700 font-black bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md font-mono">
                                {itemPrice}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* AdSense Placement Area */}
              <AdSenseArea slot="in-feed" />

            </div>

          </div>

          <hr className="border-gray-150" />

          {/* REVIEWS SECTION */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-sm font-black text-gray-900 flex items-center gap-2 font-sans tracking-tight uppercase">
                <MessageSquare size={16} className="text-emerald-700" />
                <span>Guest Reviews & Ratings ({reviews.length})</span>
              </h4>
              
              {/* Average rating badge */}
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                <Star size={14} className="text-amber-500" fill="currentColor" />
                <span className="text-xs font-black text-emerald-900">{place.rating > 0 ? place.rating : 'New'} / 5.0</span>
              </div>
            </div>

            {/* Write a Review module */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="bg-emerald-50/40 border border-emerald-200/50 p-4 sm:p-5 rounded-2xl space-y-4">
                <h5 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                  <Plus size={14} /> Write an Authentic Review
                </h5>

                {reviewError && (
                  <div className="p-3 bg-rose-50 border-l-4 border-rose-500 rounded text-xs text-rose-700 font-medium">
                    {reviewError}
                  </div>
                )}

                {reviewSuccess && (
                  <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded text-xs text-emerald-700 font-medium">
                    {reviewSuccess}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs font-bold text-gray-700">
                  <span>How would you rate this place?</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setRating(stars)}
                        className="text-amber-500 hover:scale-110 cursor-pointer transition-transform"
                      >
                        <Star 
                          size={20} 
                          fill={stars <= rating ? 'currentColor' : 'none'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Detailed Comments</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell other travelers about the taste, price, cleanliness, and Peshawar hospitality..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {submittingReview ? 'Sharing...' : 'Share Review'}
                </button>
              </form>
            ) : (
              <div className="bg-gray-100/70 border border-gray-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-gray-600">
                <div className="flex items-start gap-3">
                  <ShieldAlert size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-gray-900">Want to share your experience?</h5>
                    <p className="text-gray-500 mt-0.5 leading-normal">
                      Only verified logged-in users can rate places, write detailed reviews, and upload comments.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onOpenAuth}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer text-xs"
                >
                  <LogIn size={14} />
                  <span>Join / Login</span>
                </button>
              </div>
            )}

            {/* List of Reviews */}
            {loadingReviews ? (
              <p className="text-xs text-gray-500 italic py-6 text-center">Loading reviews catalog...</p>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-6 text-center">Be the first to share an authentic review for this Peshawar spot!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(rev => (
                  <div 
                    key={rev.id}
                    className="bg-white border border-gray-150 p-4 rounded-xl space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-gray-900 block">{rev.userName}</span>
                        <span className="text-[10px] text-gray-400 font-semibold font-mono">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Score stars */}
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={11} fill="currentColor" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                      "{rev.comment}"
                    </p>

                    {/* Helpful Button indicator */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleHelpfulToggle(rev.id)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border cursor-pointer transition-all flex items-center gap-1 ${
                          user && rev.helpfulUsers && rev.helpfulUsers.includes(user.id)
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                        title="Is this review helpful?"
                      >
                        <ThumbsUp size={10} />
                        <span>Helpful ({rev.helpfulCount})</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
