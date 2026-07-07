/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { Database } from './src/database.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// Token manager setup (HMAC-based secure tokens without external packages)
const JWT_SECRET = process.env.JWT_SECRET || 'peshawar-hub-secret-key-9988';

function signToken(userId: string): string {
  const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours validity
  const payload = `${userId}.${expiry}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}.${signature}`).toString('base64');
}

function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [userId, expiry, signature] = decoded.split('.');
    if (!userId || !expiry || !signature) return null;
    if (Date.now() > parseInt(expiry, 10)) return null; // Token expired
    
    const payload = `${userId}.${expiry}`;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
    if (signature === expectedSignature) {
      return userId;
    }
  } catch (e) {
    return null;
  }
  return null;
}

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  const userId = verifyToken(token);
  if (!userId) return res.status(403).json({ error: 'Session expired or invalid token' });

  req.userId = userId;
  next();
};

// Lazy loaded Gemini client to prevent crashes if key is initially absent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured in the Secrets panel.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ==================== REST APIS ====================

// --- Authentication Endpoints ---
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  try {
    const user = Database.createUser(name, email, password);
    const token = signToken(user.id);
    res.status(201).json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = Database.authenticateUser(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken(user.id);
  res.json({ user, token });
});

app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  const user = Database.findUserById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found' });
  }
  res.json({ user });
});

// --- Places (Restaurants / Hotels) Endpoints ---
app.get('/api/places', (req, res) => {
  let places = Database.getPlaces();

  // Search query
  const query = req.query.query ? String(req.query.query).toLowerCase() : '';
  // Filters
  const type = req.query.type ? String(req.query.type) : 'all';
  const location = req.query.location ? String(req.query.location) : '';
  const category = req.query.category ? String(req.query.category) : '';
  const priceRange = req.query.priceRange ? String(req.query.priceRange) : '';
  const environment = req.query.environment ? String(req.query.environment) : '';
  const ratingThreshold = req.query.rating ? parseFloat(String(req.query.rating)) : 0;

  if (query) {
    places = places.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.location.toLowerCase().includes(query) ||
      p.bestDishes.some(dish => dish.toLowerCase().includes(query))
    );
  }

  if (type !== 'all') {
    places = places.filter(p => p.type === type);
  }

  if (location) {
    places = places.filter(p => p.location === location);
  }

  if (category) {
    places = places.filter(p => p.category === category);
  }

  if (priceRange) {
    places = places.filter(p => p.priceRange === priceRange);
  }

  if (environment) {
    places = places.filter(p => p.environment === environment);
  }

  if (ratingThreshold > 0) {
    places = places.filter(p => p.rating >= ratingThreshold);
  }

  res.json(places);
});

app.get('/api/places/:id', (req, res) => {
  const place = Database.getPlaceById(req.params.id);
  if (!place) {
    return res.status(404).json({ error: 'Place not found' });
  }
  res.json(place);
});

// Admin Route: Create new Restaurant/Hotel
app.post('/api/places', authenticateToken, (req: any, res) => {
  const user = Database.findUserById(req.userId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }

  const { name, type, location, category, priceRange, images, description, menu, bestDishes, environment, phone, address, isFeatured } = req.body;
  if (!name || !type || !location || !category || !priceRange || !description) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const newPlace = Database.createPlace({
      name,
      type,
      location,
      category,
      priceRange,
      images: images || ['https://images.unsplash.com/photo-1544025162-d76694265947?w=800'],
      description,
      menu: menu || [],
      bestDishes: bestDishes || [],
      environment: environment || 'Casual',
      phone: phone || '',
      address: address || '',
      isFeatured: !!isFeatured
    });
    res.status(201).json(newPlace);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create place' });
  }
});

// Admin Route: Update Place
app.put('/api/places/:id', authenticateToken, (req: any, res) => {
  const user = Database.findUserById(req.userId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }

  try {
    const updated = Database.updatePlace(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Failed to update place' });
  }
});

// Admin Route: Delete Place
app.delete('/api/places/:id', authenticateToken, (req: any, res) => {
  const user = Database.findUserById(req.userId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }

  try {
    Database.deletePlace(req.params.id);
    res.json({ success: true, message: 'Place deleted successfully' });
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Failed to delete' });
  }
});

// --- Reviews Endpoints ---
app.get('/api/places/:id/reviews', (req, res) => {
  const reviews = Database.getReviewsByPlaceId(req.params.id);
  res.json(reviews);
});

app.post('/api/places/:id/reviews', authenticateToken, (req: any, res) => {
  const { rating, comment } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }

  const user = Database.findUserById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    const review = Database.createReview(req.params.id, user.id, user.name, rating, comment);
    res.status(201).json(review);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to add review' });
  }
});

app.post('/api/reviews/:reviewId/helpful', authenticateToken, (req: any, res) => {
  try {
    const review = Database.toggleHelpfulReview(req.params.reviewId, req.userId);
    res.json(review);
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Failed to mark helpful' });
  }
});

app.delete('/api/reviews/:reviewId', authenticateToken, (req: any, res) => {
  const user = Database.findUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  try {
    // Admins can delete any review, normal users can only delete their own reviews (handled simplistically here)
    if (user.isAdmin) {
      Database.deleteReview(req.params.reviewId);
      return res.json({ success: true });
    } else {
      return res.status(403).json({ error: 'Unauthorized to delete this review' });
    }
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Failed to delete review' });
  }
});

// --- AI Suggestion / Recommendation Engine via Gemini ---
app.post('/api/ai/recommend', async (req, res) => {
  const { mood, budget, groupType, typePreference } = req.body;

  try {
    const client = getGeminiClient();
    const places = Database.getPlaces();

    // Prepare a compact text summary of our database listings for Gemini's search grounding/recommendation
    const catalogSummary = places.map(p => 
      `ID: ${p.id}, Name: "${p.name}", Type: ${p.type}, Category: ${p.category}, Location: ${p.location}, PriceRange: ${p.priceRange}, Environment: ${p.environment}, Rating: ${p.rating}/5, Specialty: ${p.bestDishes.join(', ')}`
    ).join('\n');

    const prompt = `
A user is looking for a place in Peshawar, Pakistan. Find and suggest the best recommendations from the catalog below that match these requirements:
- Mood / Vibe: ${mood || 'Any'}
- Budget Level (Price Range): ${budget || 'Any'}
- Group Type / Environment: ${groupType || 'Any'}
- Preferred Type: ${typePreference || 'Any'} (e.g., restaurant or hotel or any)

--- Available Catalog ---
${catalogSummary}
-------------------------

Please output a JSON response containing:
1. "rationale": A personalized, friendly text response (2-3 sentences) written in a warm local tone describing why you recommend these choices, celebrating Peshawar's famous hospitality.
2. "recommendedIds": An array of IDs (strings) from the catalog matching this request (limit to 1, 2, or 3 best matches).
3. "aiTips": A list of 2-3 local tips or ordering recommendations for these choices (e.g. "Order the Chapli Kabab with hot naan and ask for fresh tomatoes" or "Try the Serena gardens in the evening for beautiful sitar music").

Respond ONLY with valid JSON. Do not write any markdown code blocks, just pure JSON text.
`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rationale: { type: Type.STRING },
            recommendedIds: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            aiTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['rationale', 'recommendedIds', 'aiTips']
        }
      }
    });

    const resultText = response.text?.trim() || '{}';
    const jsonOutput = JSON.parse(resultText);
    res.json(jsonOutput);
  } catch (err: any) {
    console.error('Gemini Recommendation Error:', err);
    res.status(500).json({ 
      error: 'AI is currently sipping Green Tea (Kahwa). Please try again or configure the GEMINI_API_KEY.',
      details: err.message 
    });
  }
});


// ==================== VITE & STATIC SERVING ====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Peshawar Food Hub Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
