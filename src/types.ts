/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Episode {
  id: string;
  number: number;
  title: string;
  thumbnail: string;
  duration: string;
  synopsis: string;
  seasonNumber: number;
  videoUrl?: string; // HLS stream if available
}

export interface Season {
  number: number;
  name: string;
  episodes: Episode[];
}

export interface Content {
  id: string;
  imdbId?: string;
  tmdbId?: string;
  title: string;
  type: 'movie' | 'tv' | 'anime';
  posterUrl: string;
  backdropUrl: string;
  rating: number; // e.g. 8.7
  releaseYear: string;
  duration?: string; // e.g. "2h 28m" (for movies)
  synopsis: string;
  genres: string[];
  cast: string[];
  trending?: boolean;
  recentlyAdded?: boolean;
  recommended?: boolean;
  animeStatus?: 'ongoing' | 'completed';
  seasons?: Season[];
  dubAvailable?: boolean;
  subAvailable?: boolean;
  youtubeTrailer?: string; // YouTube video ID e.g., "dQw4w9WgXcQ"
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  email: string;
  subscriptionStatus: 'free' | 'premium' | 'ultra_4k';
  joinedDate: string;
}

export interface PlaybackHistory {
  contentId: string;
  contentType: 'movie' | 'tv' | 'anime';
  title: string;
  posterUrl: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  progressPercent: number; // 0 to 100
  seekSeconds: number;
  durationSeconds: number;
  updatedAt: string;
}

export interface UserWatchlist {
  userId: string;
  watchlist: string[]; // array of contentIds
  favorites: string[]; // array of contentIds
  history: PlaybackHistory[];
}

export interface AIRecommendation {
  id: string;
  title: string;
  type: 'movie' | 'tv' | 'anime';
  matchPercent: number;
  reason: string;
  genreTags: string[];
  backdropUrl?: string;
}

export interface SearchResult {
  content: Content[];
  aiSuggestions?: AIRecommendation[];
}

export interface AdminAnalytics {
  totalWatchTimeHours: number;
  totalUsers: number;
  activeStreams: number;
  subscriberConversionRate: number;
  conversionsWeekly: number[];
  audienceDemographics: { genre: string; count: number }[];
  popularWatchTimes: { hour: string; views: number }[];
}
