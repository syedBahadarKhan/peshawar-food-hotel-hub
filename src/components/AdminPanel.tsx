/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Place, PlaceType } from '../types.ts';
import { Plus, Edit3, Trash2, X, AlertCircle, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  places: Place[];
  onPlaceAdded: (place: Place) => void;
  onPlaceUpdated: (place: Place) => void;
  onPlaceDeleted: (id: string) => void;
  token: string | null;
}

export default function AdminPanel({
  isOpen,
  onClose,
  places,
  onPlaceAdded,
  onPlaceUpdated,
  onPlaceDeleted,
  token
}: AdminPanelProps) {
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [type, setType] = useState<PlaceType>('restaurant');
  const [location, setLocation] = useState('Hayatabad');
  const [category, setCategory] = useState('BBQ');
  const [priceRange, setPriceRange] = useState<'$' | '$$' | '$$$'>('$$');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState('');
  const [menu, setMenu] = useState('');
  const [bestDishes, setBestDishes] = useState('');
  const [environment, setEnvironment] = useState<'Family-friendly' | 'Friends' | 'Couples' | 'Casual' | 'Formal'>('Casual');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setType('restaurant');
    setLocation('Hayatabad');
    setCategory('BBQ');
    setPriceRange('$$');
    setDescription('');
    setImages('');
    setMenu('');
    setBestDishes('');
    setEnvironment('Casual');
    setPhone('');
    setAddress('');
    setIsFeatured(false);
    setError('');
    setSuccess('');
    setEditingPlace(null);
  };

  const handleEditInit = (place: Place) => {
    setEditingPlace(place);
    setIsAdding(true);

    setName(place.name);
    setType(place.type);
    setLocation(place.location);
    setCategory(place.category);
    setPriceRange(place.priceRange);
    setDescription(place.description);
    setImages(place.images.join('\n'));
    setMenu(place.menu.join('\n'));
    setBestDishes(place.bestDishes.join('\n'));
    setEnvironment(place.environment);
    setPhone(place.phone || '');
    setAddress(place.address || '');
    setIsFeatured(!!place.isFeatured);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!name || !description || !category) {
      setError('Required fields name, category and description must be provided.');
      setLoading(false);
      return;
    }

    const payload = {
      name,
      type,
      location,
      category,
      priceRange,
      description,
      images: images.split('\n').map(img => img.trim()).filter(Boolean),
      menu: menu.split('\n').map(m => m.trim()).filter(Boolean),
      bestDishes: bestDishes.split('\n').map(d => d.trim()).filter(Boolean),
      environment,
      phone,
      address,
      isFeatured
    };

    const url = editingPlace ? `/api/places/${editingPlace.id}` : '/api/places';
    const method = editingPlace ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      if (editingPlace) {
        onPlaceUpdated(data);
        setSuccess('Listing updated successfully!');
      } else {
        onPlaceAdded(data);
        setSuccess('New Peshawar spot registered successfully!');
      }

      setTimeout(() => {
        setIsAdding(false);
        resetForm();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, placeName: string) => {
    if (!confirm(`Are you absolutely sure you want to delete "${placeName}" from the Peshawar hub database?`)) return;

    try {
      const response = await fetch(`/api/places/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Deletion failed');
      }

      onPlaceDeleted(id);
      setSuccess('Place deleted successfully.');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err: any) {
      setError(err.message || 'Deletion failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
        id="admin-panel-container"
      >
        {/* Header Panel */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-xl border border-slate-700">
              <ShieldCheck size={20} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight font-sans">
                Hub Database Manager
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Peshawar Food & Hotel Hub administrative dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-slate-800 p-1.5 rounded-full cursor-pointer transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content Panel */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
          
          {/* Main Workspace Toggle Form or Listings */}
          {isAdding ? (
            <form onSubmit={handleSubmit} className="flex-1 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="text-sm font-bold text-slate-800">
                  {editingPlace ? `Edit Spot: ${editingPlace.name}` : 'Register New Peshawar Spot'}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    resetForm();
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer underline"
                >
                  Cancel & Back
                </button>
              </div>

              {/* Success / Error Banners */}
              {success && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 text-xs rounded font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{success}</span>
                </div>
              )}
              {error && (
                <div className="p-3 bg-rose-50 text-rose-800 border-l-4 border-rose-500 text-xs rounded font-bold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Input Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Spot Name */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Spot Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Khyber Charsi Tikka"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Hub Type */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Class Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PlaceType)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  >
                    <option value="restaurant">Restaurant (Food)</option>
                    <option value="hotel">Hotel (Lodging)</option>
                  </select>
                </div>

                {/* Neighborhood Location */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Location Area *</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  >
                    <option value="Hayatabad">Hayatabad</option>
                    <option value="University Town">University Town</option>
                    <option value="Saddar">Saddar</option>
                    <option value="Khyber Bazaar">Khyber Bazaar</option>
                    <option value="G.T. Road">G.T. Road</option>
                  </select>
                </div>

                {/* Category tags */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Category Tag * (e.g. BBQ, Luxury Stay)</label>
                  <input
                    type="text"
                    required
                    placeholder="BBQ, Fast Food, Desi, Luxury Stay, Traditional"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>

                {/* Price Range */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Price Tier *</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value as '$' | '$$' | '$$$')}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  >
                    <option value="$">Budget ($)</option>
                    <option value="$$">Mid-tier ($$)</option>
                    <option value="$$$">Premium ($$$)</option>
                  </select>
                </div>

                {/* Environment crowd */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Vibe Environment</label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  >
                    <option value="Casual">Casual</option>
                    <option value="Family-friendly">Family-friendly</option>
                    <option value="Friends">Friends</option>
                    <option value="Couples">Couples</option>
                    <option value="Formal">Formal</option>
                  </select>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Contact Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +92 91 5271112"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>

                {/* Street Address */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Phase 5 Crossing, Ring Road"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>

                {/* Image links */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-gray-700">Image URLs (One absolute link per line)</label>
                  <textarea
                    rows={2}
                    placeholder="https://images.unsplash.com/photo-..."
                    value={images}
                    onChange={(e) => setImages(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Menu items list */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Full Price Catalog / Menu list (One item per line)</label>
                  <textarea
                    rows={3}
                    placeholder="Double Chapli Kabab - Rs. 180&#10;Kabuli Pulao - Rs. 450"
                    value={menu}
                    onChange={(e) => setMenu(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>

                {/* specialties list */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Best Dishes / Top Offers list (One per line)</label>
                  <textarea
                    rows={3}
                    placeholder="Beef Chapli Kabab&#10;Kabuli Pulao"
                    value={bestDishes}
                    onChange={(e) => setBestDishes(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>

                {/* Detailed description */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-gray-700 font-sans">Detailed Overview *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter detailed review summaries, historical features..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs leading-relaxed"
                  />
                </div>

                {/* Featured Checkbox */}
                <div className="md:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="isFeatured" className="font-bold text-gray-700 cursor-pointer">
                    Promote to Featured section on Peshawar Food & Hotel Hub
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-lg text-xs cursor-pointer transition-all"
                >
                  {loading ? 'Processing...' : editingPlace ? 'Apply Changes' : 'Register Spot'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    resetForm();
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
                >
                  Back
                </button>
              </div>
            </form>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Active Listings Catalogue
                </h4>
                <button
                  onClick={() => setIsAdding(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all hover:shadow-lg hover:shadow-emerald-600/10"
                >
                  <Plus size={14} />
                  <span>Register Spot</span>
                </button>
              </div>

              {places.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-6 text-center">No listings found in the Peshawar catalog database.</p>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                  {places.map(p => (
                    <div 
                      key={p.id}
                      className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded overflow-hidden bg-white shrink-0">
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900">{p.name}</h5>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {p.category} • {p.location} • <span className="font-mono text-[9px] uppercase font-bold text-emerald-700">{p.type}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleEditInit(p)}
                          className="p-1.5 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg border border-slate-200 cursor-pointer transition-all"
                          title="Edit details"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 rounded-lg border border-slate-200 cursor-pointer transition-all"
                          title="Delete Listing"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Stats Panel */}
          <div className="w-full lg:w-64 bg-slate-50 border border-slate-200 rounded-2xl p-4 shrink-0 h-fit space-y-4 text-xs text-slate-700">
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
              Peshawar Hub Status
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                <span>Total Food Hubs</span>
                <span>{places.filter(p => p.type === 'restaurant').length}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                <span>Total Stays</span>
                <span>{places.filter(p => p.type === 'hotel').length}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pb-1">
                <span>Featured Spots</span>
                <span>{places.filter(p => p.isFeatured).length}</span>
              </div>
            </div>

            <div className="bg-slate-200/50 p-2.5 rounded-lg text-[11px] leading-relaxed">
              <span className="font-bold text-slate-900 block mb-0.5">Note on Moderation</span>
              Changing catalog entries directly updates the `/data.json` file on disk. Changes persist automatically and will update instantly on all active client feeds!
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
