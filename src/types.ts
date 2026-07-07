/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

export type PlaceType = 'restaurant' | 'hotel';

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  location: string; // e.g. "Hayatabad", "University Town", "Saddar", "Khyber Bazaar"
  category: string; // e.g. "BBQ", "Fast Food", "Desi", "Traditional", "Luxury Stay", "Budget Stay"
  priceRange: '$' | '$$' | '$$$'; // Low, Medium, High
  images: string[];
  description: string;
  menu: string[]; // List of dishes or items
  bestDishes: string[]; // Highlighted specialties
  environment: 'Family-friendly' | 'Friends' | 'Couples' | 'Casual' | 'Formal';
  rating: number; // calculated average
  reviewCount: number;
  phone?: string;
  address?: string;
  isFeatured?: boolean;
}

export interface Review {
  id: string;
  placeId: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  helpfulCount: number;
  helpfulUsers: string[]; // array of userIds
}

export interface Filters {
  searchQuery: string;
  type: PlaceType | 'all';
  location: string;
  category: string;
  priceRange: string;
  environment: string;
  rating: number;
}
