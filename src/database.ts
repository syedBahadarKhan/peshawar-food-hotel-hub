/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Place, Review, User } from './types.ts';

// File path for persistence
const DATA_FILE = path.join(process.cwd(), 'data.json');

interface Schema {
  users: UserRecord[];
  places: Place[];
  reviews: Review[];
}

interface UserRecord extends User {
  passwordHash: string;
  passwordSalt: string;
}

// Initial Peshawar seed data
const SEED_PLACES: Place[] = [
  {
    id: '1',
    name: 'Jalil Kabab House',
    type: 'restaurant',
    location: 'Saddar',
    category: 'BBQ',
    priceRange: '$$',
    images: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&auto=format&fit=crop&q=60'
    ],
    description: 'The absolute legendary home of Peshawar\'s original Chapli Kabab. Jalil Kabab House has been serving juicy, spiced, pan-fried minced beef kababs loaded with fresh tomatoes and local spices for decades.',
    menu: [
      'Special Beef Chapli Kabab - Rs. 180 / piece',
      'Mutton Chapli Kabab - Rs. 260 / piece',
      'Kabuli Pulao - Rs. 450 / portion',
      'Tandoori Naan - Rs. 30',
      'Special Peshawari Green Tea (Kahwa) - Rs. 80'
    ],
    bestDishes: ['Beef Chapli Kabab', 'Peshawari Kahwa', 'Kabuli Pulao'],
    environment: 'Casual',
    rating: 4.8,
    reviewCount: 3,
    phone: '+92 91 5271112',
    address: 'Khyber Bazaar, near Cinema Road, Saddar, Peshawar',
    isFeatured: true
  },
  {
    id: '2',
    name: 'Khyber Charsi Tikka',
    type: 'restaurant',
    location: 'University Town',
    category: 'Desi',
    priceRange: '$$$',
    images: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&auto=format&fit=crop&q=60'
    ],
    description: 'Iconic Peshawar culinary experience. Watch your meat being cut and prepared fresh in animal fat, seasoned strictly with salt and green chilies. Famous worldwide for its pure, rustic mutton karahi.',
    menu: [
      'Dumba Karahi (Mutton cooked in fat) - Rs. 2,600 / kg',
      'Charsi Mutton Tikka - Rs. 2,400 / kg',
      'Chicken Karahi - Rs. 1,600 / kg',
      'Patta Tikka (Liver wrapped in fat) - Rs. 800 / plate',
      'Kandahari Naan - Rs. 40'
    ],
    bestDishes: ['Dumba Karahi', 'Charsi Mutton Tikka', 'Patta Tikka'],
    environment: 'Friends',
    rating: 4.7,
    reviewCount: 2,
    phone: '+92 300 5923123',
    address: 'University Road, University Town, Peshawar',
    isFeatured: true
  },
  {
    id: '3',
    name: 'Habibi Restaurant',
    type: 'restaurant',
    location: 'Hayatabad',
    category: 'Traditional',
    priceRange: '$$$',
    images: [
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&auto=format&fit=crop&q=60'
    ],
    description: 'A beautiful family-centric restaurant that popularized the traditional Peshawari Sajji and royal BBQ platters. Designed with elegant Pashtun cultural interiors and private family floor-seating areas (Hujra-style).',
    menu: [
      'Habibi Royal Platter (Kabuli Pulao, BBQ, Seekh Kabab, Tikka) - Rs. 4,800',
      'Sajji Chicken - Rs. 1,400',
      'Chicken Handi - Rs. 1,200 / half kg',
      'Mutton Dum Pukht - Rs. 1,800',
      'Fresh Raita & Salad - Rs. 150'
    ],
    bestDishes: ['Habibi Royal Platter', 'Chicken Sajji', 'Mutton Dum Pukht'],
    environment: 'Family-friendly',
    rating: 4.5,
    reviewCount: 2,
    phone: '+92 91 5828822',
    address: 'Phase 5, Ring Road Crossing, Hayatabad, Peshawar',
    isFeatured: false
  },
  {
    id: '4',
    name: 'Chief Grill',
    type: 'restaurant',
    location: 'University Town',
    category: 'Fast Food',
    priceRange: '$$',
    images: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60'
    ],
    description: 'Peshawar\'s home-grown fast-food king since the 1990s. Famous for heavy cheese pizzas, premium burgers, and an incredibly lively neon-lit atmosphere that stays packed until late night.',
    menu: [
      'Chief Special Burger (Double Patty with Egg) - Rs. 550',
      'Peshawari Crown Crust Pizza - Rs. 1,650 / Large',
      'Crispy Fried Chicken - Rs. 850 / 4 Pieces',
      'Fries Bucket - Rs. 350',
      'Vanilla Shake - Rs. 380'
    ],
    bestDishes: ['Chief Special Burger', 'Crown Crust Pizza', 'Fries Bucket'],
    environment: 'Family-friendly',
    rating: 4.4,
    reviewCount: 2,
    phone: '+92 91 5845511',
    address: 'Jamrud Road, Phase 3, University Town, Peshawar',
    isFeatured: false
  },
  {
    id: '5',
    name: 'Peshawar Serena Hotel',
    type: 'hotel',
    location: 'Saddar',
    category: 'Luxury Stay',
    priceRange: '$$$',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=60'
    ],
    description: 'The crown jewel of Peshawar\'s hospitality. This 5-star hotel features beautiful architecture blending traditional Islamic woodwork and Mughal gardens, combined with elite level security, an exquisite pool, and five-star fine dining.',
    menu: [
      'Executive Suite Nightly - Rs. 35,000 / night',
      'Deluxe Room Nightly - Rs. 24,000 / night',
      'High Tea Buffet (Zamzama Restaurant) - Rs. 1,950 / person',
      'Continental Buffet Dinner - Rs. 3,200 / person',
      'Peshawari Shinwari Karahi (A la Carte) - Rs. 2,900'
    ],
    bestDishes: ['Mughal Hi-Tea Buffet', 'Shinwari Mutton Karahi', 'Jacuzzi & Gym Access'],
    environment: 'Formal',
    rating: 4.9,
    reviewCount: 1,
    phone: '+92 91 5276121',
    address: 'The Mall, G.T. Road, Peshawar Cantonment, Peshawar',
    isFeatured: true
  },
  {
    id: '6',
    name: 'Shelton\'s Rezidor',
    type: 'hotel',
    location: 'University Town',
    category: 'Luxury Stay',
    priceRange: '$$$',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&auto=format&fit=crop&q=60'
    ],
    description: 'A boutique modern hotel situated in the high-end University Town. Renowned for its superb service, high-speed corporate Wi-Fi, elegant board rooms, and its rooftop barbecue cafe.',
    menu: [
      'Standard Room Nightly - Rs. 12,000 / night',
      'Executive Room Nightly - Rs. 16,000 / night',
      'Business Buffet Lunch - Rs. 1,600 / person',
      'Club Sandwich - Rs. 650',
      'Mocktails & Juices - Rs. 350'
    ],
    bestDishes: ['Executive Lounge Stay', 'Rooftop BBQ Dinner', 'Business Lunch'],
    environment: 'Family-friendly',
    rating: 4.3,
    reviewCount: 1,
    phone: '+92 91 5701234',
    address: '32-C, Park Avenue, University Town, Peshawar',
    isFeatured: false
  },
  {
    id: '7',
    name: 'Emaraat Hotel',
    type: 'hotel',
    location: 'Saddar',
    category: 'Budget Stay',
    priceRange: '$$',
    images: [
      'https://images.unsplash.com/photo-1495365200479-c4ed1d35e1aa?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=60'
    ],
    description: 'Located in the hyper-active center of Saddar Bazar, Emaraat Hotel offers clean, secure, and modern accommodation with direct access to local dry fruit markets, clothes shops, and Peshawari food hubs.',
    menu: [
      'Double Standard Room - Rs. 6,500 / night',
      'Family Bed Suite - Rs. 9,000 / night',
      'Complimentary Local Breakfast - Rs. 0',
      'Laundry Service - Rs. 150 / cloth'
    ],
    bestDishes: ['Desi Halwa Puri Breakfast', 'Standard Family Room'],
    environment: 'Casual',
    rating: 4.1,
    reviewCount: 1,
    phone: '+92 91 5284567',
    address: 'Saddar Road, Cantonment Area, Peshawar',
    isFeatured: false
  }
];

const SEED_REVIEWS: Review[] = [
  {
    id: 'r1',
    placeId: '1',
    userId: 'u1',
    userName: 'Zarghon Khan',
    rating: 5,
    comment: 'The absolute best Chapli Kabab in the entire universe. Spiced perfectly, fried crispy on the edges, and incredibly soft in the middle. Pair it with Peshawari Kahwa and you are in paradise!',
    createdAt: '2026-06-15T12:00:00Z',
    helpfulCount: 14,
    helpfulUsers: ['u2', 'u3']
  },
  {
    id: 'r2',
    placeId: '1',
    userId: 'u2',
    userName: 'Ayesha Jan',
    rating: 4,
    comment: 'Chapli kababs were brilliant as always. Extremely crowded on weekends, so waiting times can exceed 30 minutes, but it is 100% worth the wait. Proper cultural setting.',
    createdAt: '2026-06-20T18:30:00Z',
    helpfulCount: 5,
    helpfulUsers: ['u1']
  },
  {
    id: 'r3',
    placeId: '2',
    userId: 'u3',
    userName: 'Hamza Shinwari',
    rating: 5,
    comment: 'Pure dumba karahi cooked to perfection using only salt, animal fat, and green chilies. It highlights the natural juicy flavor of the mutton beautifully. True Pashtun flavor!',
    createdAt: '2026-06-25T20:15:00Z',
    helpfulCount: 9,
    helpfulUsers: ['u1']
  },
  {
    id: 'r4',
    placeId: '5',
    userId: 'u1',
    userName: 'Zarghon Khan',
    rating: 5,
    comment: 'An absolute masterpiece of a hotel. The heritage design, gardens, live local sitar music, and top-tier hospitality make it the best place to stay in Khyber Pakhtunkhwa. Buffet is delicious.',
    createdAt: '2026-07-01T09:00:00Z',
    helpfulCount: 8,
    helpfulUsers: ['u2']
  }
];

// Load or initialize DB schema
function readDB(): Schema {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed reading DB file, reinitializing', err);
  }

  // Seed initial DB
  const defaultSchema: Schema = {
    users: [
      {
        id: 'admin_user',
        name: 'Peshawar Hub Admin',
        email: 'admin@peshawarhub.com',
        isAdmin: true,
        ...hashPassword('admin123')
      },
      {
        id: 'u1',
        name: 'Zarghon Khan',
        email: 'zarghon@example.com',
        isAdmin: false,
        ...hashPassword('user123')
      }
    ],
    places: SEED_PLACES,
    reviews: SEED_REVIEWS
  };
  writeDB(defaultSchema);
  return defaultSchema;
}

function writeDB(data: Schema) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing DB file', err);
  }
}

// Password utility
function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { passwordHash: hash, passwordSalt: salt };
}

function verifyPassword(password: string, salt: string, hash: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return verifyHash === hash;
}

// Database Actions Interface
export const Database = {
  // --- USERS ---
  getUsers: () => readDB().users,
  
  findUserByEmail: (email: string) => {
    return readDB().users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserById: (id: string) => {
    const user = readDB().users.find(u => u.id === id);
    if (!user) return null;
    const { passwordHash, passwordSalt, ...safeUser } = user;
    return safeUser;
  },

  createUser: (name: string, email: string, passwordString: string) => {
    const db = readDB();
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered');
    }

    const { passwordHash, passwordSalt } = hashPassword(passwordString);
    const newUser: UserRecord = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      name,
      email: email.toLowerCase(),
      isAdmin: false,
      passwordHash,
      passwordSalt
    };

    db.users.push(newUser);
    writeDB(db);

    const { passwordHash: h, passwordSalt: s, ...safeUser } = newUser;
    return safeUser;
  },

  authenticateUser: (email: string, passwordString: string) => {
    const db = readDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;

    const isValid = verifyPassword(passwordString, user.passwordSalt, user.passwordHash);
    if (!isValid) return null;

    const { passwordHash, passwordSalt, ...safeUser } = user;
    return safeUser;
  },

  // --- PLACES (Restaurants / Hotels) ---
  getPlaces: () => {
    const db = readDB();
    // recalculate ratings from reviews
    return db.places.map(place => {
      const placeReviews = db.reviews.filter(r => r.placeId === place.id);
      if (placeReviews.length > 0) {
        const avg = placeReviews.reduce((acc, r) => acc + r.rating, 0) / placeReviews.length;
        place.rating = parseFloat(avg.toFixed(1));
        place.reviewCount = placeReviews.length;
      } else {
        place.rating = 0;
        place.reviewCount = 0;
      }
      return place;
    });
  },

  getPlaceById: (id: string) => {
    const places = Database.getPlaces();
    return places.find(p => p.id === id) || null;
  },

  createPlace: (placeData: Omit<Place, 'id' | 'rating' | 'reviewCount'>) => {
    const db = readDB();
    const newPlace: Place = {
      ...placeData,
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      rating: 0,
      reviewCount: 0
    };
    db.places.push(newPlace);
    writeDB(db);
    return newPlace;
  },

  updatePlace: (id: string, placeData: Partial<Place>) => {
    const db = readDB();
    const index = db.places.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Place not found');

    db.places[index] = {
      ...db.places[index],
      ...placeData,
      id // preserve ID
    };
    writeDB(db);
    return db.places[index];
  },

  deletePlace: (id: string) => {
    const db = readDB();
    db.places = db.places.filter(p => p.id !== id);
    db.reviews = db.reviews.filter(r => r.placeId !== id); // cascade delete reviews
    writeDB(db);
    return true;
  },

  // --- REVIEWS ---
  getReviewsByPlaceId: (placeId: string) => {
    const db = readDB();
    return db.reviews
      .filter(r => r.placeId === placeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUserReviews: (userId: string) => {
    const db = readDB();
    return db.reviews.filter(r => r.userId === userId);
  },

  createReview: (placeId: string, userId: string, userName: string, rating: number, comment: string) => {
    const db = readDB();
    
    // Check if place exists
    if (!db.places.some(p => p.id === placeId)) {
      throw new Error('Place does not exist');
    }

    const newReview: Review = {
      id: 'r_' + Math.random().toString(36).substr(2, 9),
      placeId,
      userId,
      userName,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
      helpfulUsers: []
    };

    db.reviews.push(newReview);
    writeDB(db);
    return newReview;
  },

  toggleHelpfulReview: (reviewId: string, userId: string) => {
    const db = readDB();
    const review = db.reviews.find(r => r.id === reviewId);
    if (!review) throw new Error('Review not found');

    if (!review.helpfulUsers) {
      review.helpfulUsers = [];
    }

    const userIndex = review.helpfulUsers.indexOf(userId);
    if (userIndex > -1) {
      // Unmark helpful
      review.helpfulUsers.splice(userIndex, 1);
    } else {
      // Mark helpful
      review.helpfulUsers.push(userId);
    }
    review.helpfulCount = review.helpfulUsers.length;

    writeDB(db);
    return review;
  },

  deleteReview: (reviewId: string) => {
    const db = readDB();
    db.reviews = db.reviews.filter(r => r.id !== reviewId);
    writeDB(db);
    return true;
  }
};
