/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Safe directory resolution for both ESM and CJS bundle targets
const currentDirname = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header as required
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini AI successfully initialized for CineVerse.');
  } catch (err) {
    console.error('Failed to initialize Gemini SDK:', err);
  }
} else {
  console.warn('GEMINI_API_KEY is not defined. AI RECOMMENDATIONS will use elegant offline logic.');
}

// PERSISTENCE LAYER: File-based local store + safe transactional fallbacks
const DB_FILE = path.join(currentDirname, 'user_data.json');

interface LocalDB {
  users: Record<string, {
    id: string;
    name: string;
    avatar: string;
    email: string;
    subscriptionStatus: 'free' | 'premium' | 'ultra_4k';
    joinedDate: string;
  }>;
  activity: Record<string, {
    watchlist: string[];
    favorites: string[];
    history: any[];
  }>;
}

const defaultDB: LocalDB = {
  users: {
    'demo_user': {
      id: 'demo_user',
      name: 'Guest Explorer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      email: 'guest@cineverse.io',
      subscriptionStatus: 'ultra_4k',
      joinedDate: new Date().toISOString(),
    }
  },
  activity: {
    'demo_user': {
      watchlist: ['m1', 't1'],
      favorites: ['m3', 'a1'],
      history: [
        {
          contentId: 'm1',
          contentType: 'movie',
          title: 'Interstellar',
          posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=600',
          progressPercent: 42,
          seekSeconds: 4250,
          durationSeconds: 10140,
          updatedAt: new Date().toISOString()
        }
      ]
    }
  }
};

let dbState: LocalDB = { ...defaultDB };

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      dbState = { ...defaultDB, ...parsed };
      console.log('Data successfully loaded from user_data.json');
    } else {
      saveDB();
    }
  } catch (err) {
    console.error('Could not load user_data.json, fallback to cache:', err);
  }
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf8');
  } catch (err) {
    console.warn('Failed to persist state (this is normal if running in strict read-only modes):', err);
  }
}

loadDB();

// API ROUTES

// AUTHENTICATION API
app.post('/api/auth/login', (req, res) => {
  const { email, password, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const userId = email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  
  if (!dbState.users[userId]) {
    // Auto-signup
    dbState.users[userId] = {
      id: userId,
      name: name || email.split('@')[0],
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?auto=format&fit=crop&q=80&w=150`,
      email,
      subscriptionStatus: 'premium',
      joinedDate: new Date().toISOString(),
    };
    dbState.activity[userId] = {
      watchlist: [],
      favorites: [],
      history: [],
    };
    saveDB();
  }

  res.json({
    token: `cv_jwt_${userId}`,
    user: dbState.users[userId]
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, name, subscriptionStatus } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and Name are required' });
  }

  const userId = email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  
  dbState.users[userId] = {
    id: userId,
    name,
    avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&q=80&w=150`,
    email,
    subscriptionStatus: subscriptionStatus || 'premium',
    joinedDate: new Date().toISOString(),
  };

  dbState.activity[userId] = {
    watchlist: [],
    favorites: [],
    history: [],
  };

  saveDB();
  res.json({
    token: `cv_jwt_${userId}`,
    user: dbState.users[userId]
  });
});

// GET USER WORKSPACE PROFILE
app.get('/api/profile/:userId', (req, res) => {
  const { userId } = req.params;
  const user = dbState.users[userId];
  if (!user) {
    return res.status(404).json({ error: 'User does not exist' });
  }
  res.json(user);
});

// GET USER ACTIVITY / HISTORY / WATCHLIST
app.get('/api/activity/:userId', (req, res) => {
  const { userId } = req.params;
  if (!dbState.activity[userId]) {
    dbState.activity[userId] = { watchlist: [], favorites: [], history: [] };
    saveDB();
  }
  res.json(dbState.activity[userId]);
});

// ADD TO WATCHLIST
app.post('/api/activity/:userId/watchlist', (req, res) => {
  const { userId } = req.params;
  const { contentId } = req.body;
  if (!contentId) return res.status(400).json({ error: 'contentId required' });

  if (!dbState.activity[userId]) {
    dbState.activity[userId] = { watchlist: [], favorites: [], history: [] };
  }

  const watchlist = dbState.activity[userId].watchlist;
  if (!watchlist.includes(contentId)) {
    watchlist.push(contentId);
    saveDB();
  }
  res.json({ watchlist });
});

// DELETE FROM WATCHLIST
app.delete('/api/activity/:userId/watchlist/:contentId', (req, res) => {
  const { userId, contentId } = req.params;
  
  if (dbState.activity[userId]) {
    dbState.activity[userId].watchlist = dbState.activity[userId].watchlist.filter(id => id !== contentId);
    saveDB();
  }
  res.json({ watchlist: dbState.activity[userId]?.watchlist || [] });
});

// ADD TO FAVORITES
app.post('/api/activity/:userId/favorites', (req, res) => {
  const { userId } = req.params;
  const { contentId } = req.body;
  if (!contentId) return res.status(400).json({ error: 'contentId required' });

  if (!dbState.activity[userId]) {
    dbState.activity[userId] = { watchlist: [], favorites: [], history: [] };
  }

  const favorites = dbState.activity[userId].favorites;
  if (!favorites.includes(contentId)) {
    favorites.push(contentId);
    saveDB();
  }
  res.json({ favorites });
});

// REMOVE FROM FAVORITES
app.delete('/api/activity/:userId/favorites/:contentId', (req, res) => {
  const { userId, contentId } = req.params;
  
  if (dbState.activity[userId]) {
    dbState.activity[userId].favorites = dbState.activity[userId].favorites.filter(id => id !== contentId);
    saveDB();
  }
  res.json({ favorites: dbState.activity[userId]?.favorites || [] });
});

// UPDATE PLAYBACK HISTORY & RESUME TIME
app.post('/api/activity/:userId/history', (req, res) => {
  const { userId } = req.params;
  const { 
    contentId, 
    contentType, 
    title, 
    posterUrl, 
    seasonNumber, 
    episodeNumber, 
    episodeTitle, 
    progressPercent, 
    seekSeconds, 
    durationSeconds 
  } = req.body;

  if (!contentId) return res.status(400).json({ error: 'contentId required' });

  if (!dbState.activity[userId]) {
    dbState.activity[userId] = { watchlist: [], favorites: [], history: [] };
  }

  let historyList = dbState.activity[userId].history;
  
  // Remove existing progress for same item/episode to prevent duplicates
  historyList = historyList.filter(item => {
    if (item.contentId !== contentId) return true;
    if (contentType !== 'movie') {
      return item.seasonNumber !== seasonNumber || item.episodeNumber !== episodeNumber;
    }
    return false;
  });

  const newProgress = {
    contentId,
    contentType,
    title,
    posterUrl,
    seasonNumber,
    episodeNumber,
    episodeTitle,
    progressPercent,
    seekSeconds,
    durationSeconds,
    updatedAt: new Date().toISOString()
  };

  historyList.unshift(newProgress);
  // Cap at 15 items for layout
  dbState.activity[userId].history = historyList.slice(0, 15);
  saveDB();

  res.json({ history: dbState.activity[userId].history });
});

// GEMINI-POWERED AI RECOMMENDATION
app.post('/api/ai/recommend', async (req, res) => {
  const { prompt, watchHistorySummary } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Mood or prompt is required' });
  }

  // Fallback offline recommendation mapping if Gemini is unavailable
  const offlineRecommendations = [
    {
      id: 'ai_fallback_1',
      title: 'Neon Horizon: 2099',
      type: 'movie',
      matchPercent: 95,
      reason: `Matching your request for '${prompt}'. Cyberpunk theme with high-tech immersive visual layers.`,
      genreTags: ['Sci-Fi', 'Action']
    },
    {
      id: 'ai_fallback_2',
      title: 'Echoes of Midnight',
      type: 'tv',
      matchPercent: 88,
      reason: `Inspired by '${prompt}' and thriller cues. Psychological drama featuring suspenseful mysteries.`,
      genreTags: ['Mystery', 'Thriller']
    },
    {
      id: 'ai_fallback_3',
      title: 'Chronicles of Kamado',
      type: 'anime',
      matchPercent: 91,
      reason: `Suggested for your '${prompt}' anime desire. Incredible modern cell shading, fast transitions, and emotional depths.`,
      genreTags: ['Anime', 'Fantasy', 'Action']
    }
  ];

  if (!ai) {
    console.log('Gemini client absent, returning smart offline list.');
    return res.json({ recommendations: offlineRecommendations });
  }

  try {
    const aiPrompt = `You are a premium AI movie advisor for "CineVerse", an ultra-modern streaming platform. 
The user is searching for content matching this description or mood: "${prompt}".
${watchHistorySummary ? `The user has recently watched: ${watchHistorySummary}. Use this context to personalize suggestions.` : ''}

Recommend exactly 3 existing popular movies, shows, or anime. Format the output STRICTLY as a JSON array inside the structure specified.
Each item must have:
- title: exact name of movie/show/anime
- type: 'movie' | 'tv' | 'anime'
- matchPercent: high integer (e.g. 96)
- reason: short human-friendly cinematic explanation (1-2 sentences) of why this matches the user prompt
- genreTags: string array of genre tags (e.g. ['Sci-Fi', 'Thriller'])
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: aiPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              description: 'List of recommended titles',
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['movie', 'tv', 'anime'] },
                  matchPercent: { type: Type.INTEGER },
                  reason: { type: Type.STRING },
                  genreTags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['title', 'type', 'matchPercent', 'reason', 'genreTags']
              }
            }
          },
          required: ['recommendations']
        }
      }
    });

    const bodyText = response.text || '';
    const parsed = JSON.parse(bodyText.trim());
    
    // Inject custom backdrop placeholders from Unsplash to ensure spectacular rendering
    const enhancedRecs = (parsed.recommendations || []).map((rec: any, idx: number) => {
      const designKeywords = rec.genreTags.join(',').toLowerCase();
      let photoId = '506703719100-a0f3a48c0f86'; // Space default
      if (designKeywords.includes('cyber') || designKeywords.includes('sci-fi')) {
        photoId = '1578632767115-351597cf2477';
      } else if (designKeywords.includes('anime') || designKeywords.includes('fantasy')) {
        photoId = '1607604276583-eef5d076aa5f';
      } else if (designKeywords.includes('thriller') || designKeywords.includes('mystery')) {
        photoId = '1509316975850-ff9c5deb0cd9';
      } else if (designKeywords.includes('drama')) {
        photoId = '1440404653325-ab127d49abc1';
      }
      return {
        id: `ai_gen_${idx}_${Date.now()}`,
        ...rec,
        backdropUrl: `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=1200`
      };
    });

    res.json({ recommendations: enhancedRecs });
  } catch (err) {
    console.error('Gemini generateContent error:', err);
    res.json({ recommendations: offlineRecommendations });
  }
});

// SECURE BACKEND PROXY FOR IMDB KEYLESS SEARCH SUGGESTIONS
app.get('/api/search/external', async (req, res) => {
  try {
    const q = req.query.q as string || '';
    const cleanQ = q.trim();
    if (!cleanQ) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const firstChar = cleanQ.charAt(0).toLowerCase();
    // Use the official, public IMDb autocomplete/suggestion service
    // Example: https://v2.sg.media-imdb.com/suggestion/a/avatar.json
    // Replace spaces with underscores if needed, or simply let encodeURIComponent do its work
    const url = `https://v2.sg.media-imdb.com/suggestion/${encodeURIComponent(firstChar)}/${encodeURIComponent(cleanQ.toLowerCase())}.json`;
    console.log(`[EXTERNAL SEARCH] Proxying request to IMDb suggestions service: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({ error: `IMDb lookup responded with status ${response.status}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('[EXTERNAL SEARCH] Error fetching from IMDb suggestion API:', error);
    res.status(500).json({ error: error?.message || 'Server error searching external records' });
  }
});

async function startServer() {
  // WEB APP INTEGRATION (Vite Middleware Setup)
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

  // Start Server on Hardcoded Port 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CineVerse server booting successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start CineVerse server:', err);
});
