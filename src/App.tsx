/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Check, Star, Play, Info, Heart, ArrowRight, Sparkles, 
  Tv, Film, AlertCircle, RefreshCcw, Bell, Shield, X, HelpCircle, Eye
} from 'lucide-react';

import { MOCK_CONTENT, POPULAR_GENRES } from './data/mockContent';
import { Content, UserProfile, PlaybackHistory, Episode } from './types';

// Importing Custom Component Modules 
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ContentCard from './components/ContentCard';
import VideoPlayer from './components/VideoPlayer';
import AIRecommendations from './components/AIRecommendations';
import AnimeSection from './components/AnimeSection';
import AdminPanel from './components/AdminPanel';
import UserProfileModal from './components/UserProfileModal';
import InstantLoader from './components/InstantLoader';

export default function App() {
  // Navigation tabs: 'home' | 'movies' | 'series' | 'anime' | 'ai' | 'analytics'
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [catalog, setCatalog] = useState<Content[]>(MOCK_CONTENT);
  
  // Auth and profile states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    id: 'demo_user',
    name: 'Guest Explorer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    email: 'guest@cineverse.io',
    subscriptionStatus: 'ultra_4k',
    joinedDate: new Date().toISOString()
  });
  
  const [showProfileModal, setShowProfileModal] = useState(false);

  // User list identifiers for Watchlist, Favorites, History
  const [watchlistIds, setWatchlistIds] = useState<string[]>(['m1', 't1']);
  const [favoritesIds, setFavoritesIds] = useState<string[]>(['m3', 'a1']);
  const [playbackHistory, setPlaybackHistory] = useState<PlaybackHistory[]>([
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
  ]);

  // View targets
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [activePlayer, setActivePlayer] = useState<Content | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<Episode | undefined>(undefined);
  const [activeSeasonNumber, setActiveSeasonNumber] = useState<number>(1);

  // Fetch initial profile & user lists on load
  useEffect(() => {
    if (!currentUser) return;
    fetch(`/api/activity/${currentUser.id}`)
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Fallback cache');
      })
      .then(data => {
        if (data.watchlist) setWatchlistIds(data.watchlist);
        if (data.favorites) setFavoritesIds(data.favorites);
        if (data.history) setPlaybackHistory(data.history);
      })
      .catch(err => {
        console.warn('API fetch offline, using local states:', err);
      });
  }, [currentUser]);

  // Load catalogs from persistent localStorage if present (for Admin add operations)
  useEffect(() => {
    const customContentCache = localStorage.getItem('cineverse_custom_content');
    if (customContentCache) {
      try {
        const parsed = JSON.parse(customContentCache);
        if (parsed && Array.isArray(parsed)) {
          setCatalog([...MOCK_CONTENT, ...parsed]);
        }
      } catch (err) {
        console.error('Error parsing content caches:', err);
      }
    }
  }, []);

  // Update lists with API Sync and caching
  const handleToggleWatchlist = async (contentId: string) => {
    if (!currentUser) {
      setShowProfileModal(true);
      return;
    }

    const inList = watchlistIds.includes(contentId);
    const updatedIds = inList 
      ? watchlistIds.filter(id => id !== contentId)
      : [...watchlistIds, contentId];
    
    setWatchlistIds(updatedIds);

    try {
      if (inList) {
        await fetch(`/api/activity/${currentUser.id}/watchlist/${contentId}`, { method: 'DELETE' });
      } else {
        await fetch(`/api/activity/${currentUser.id}/watchlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentId })
        });
      }
    } catch (err) {
      console.warn('Network offline, synced watchlist client side.');
    }
  };

  const handleToggleFavorites = async (contentId: string) => {
    if (!currentUser) {
      setShowProfileModal(true);
      return;
    }

    const inList = favoritesIds.includes(contentId);
    const updatedIds = inList
      ? favoritesIds.filter(id => id !== contentId)
      : [...favoritesIds, contentId];

    setFavoritesIds(updatedIds);

    try {
      if (inList) {
        await fetch(`/api/activity/${currentUser.id}/favorites/${contentId}`, { method: 'DELETE' });
      } else {
        await fetch(`/api/activity/${currentUser.id}/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentId })
        });
      }
    } catch (err) {
      console.warn('Network offline, favorites updated locally.');
    }
  };

  const handleUpdateHistory = async (
    contentId: string,
    progressPercent: number,
    seekSeconds: number,
    durationSeconds: number,
    seasonNum?: number,
    episodeNum?: number,
    episodeTitle?: string
  ) => {
    if (!currentUser) return;

    const matchedContent = catalog.find(c => c.id === contentId);
    if (!matchedContent) return;

    const newProg = {
      contentId,
      contentType: matchedContent.type,
      title: matchedContent.title,
      posterUrl: matchedContent.posterUrl,
      progressPercent,
      seekSeconds,
      durationSeconds,
      seasonNumber: seasonNum,
      episodeNumber: episodeNum,
      episodeTitle,
      updatedAt: new Date().toISOString()
    };

    // Filter duplicates and push to front of state
    setPlaybackHistory(prev => {
      const filtered = prev.filter(item => {
        if (item.contentId !== contentId) return true;
        if (matchedContent.type !== 'movie') {
          return item.seasonNumber !== seasonNum || item.episodeNumber !== episodeNum;
        }
        return false;
      });
      return [newProg, ...filtered].slice(0, 15);
    });

    try {
      await fetch(`/api/activity/${currentUser.id}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProg)
      });
    } catch (err) {
      // offline silent cache
    }
  };

  // Launch direct episode play
  const handlePlayEpisode = (content: Content, episode: Episode, seasonNum: number) => {
    setSelectedContent(null);
    setActiveEpisode(episode);
    setActiveSeasonNumber(seasonNum);
    setActivePlayer(content);
  };

  // Launch movie or default entry
  const handlePlayContent = (content: Content) => {
    setSelectedContent(null);
    if (content.type !== 'movie' && content.seasons?.[0]?.episodes?.[0]) {
      // Launch S1 Ep1 by default for series and anime
      setActiveEpisode(content.seasons[0].episodes[0]);
      setActiveSeasonNumber(1);
    } else {
      setActiveEpisode(undefined);
    }
    setActivePlayer(content);
  };

  // Auth logins
  const handleLogin = async (email: string, name: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setShowProfileModal(false);
      }
    } catch (err) {
      // Fallback signing locally
      const mockId = email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      setCurrentUser({
        id: mockId,
        name,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        email,
        subscriptionStatus: 'premium',
        joinedDate: new Date().toISOString()
      });
      setShowProfileModal(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setWatchlistIds([]);
    setFavoritesIds([]);
    setPlaybackHistory([]);
    setShowProfileModal(false);
  };

  const handleUpdateSubscription = (tier: 'free' | 'premium' | 'ultra_4k') => {
    if (!currentUser) return;
    const upd = { ...currentUser, subscriptionStatus: tier };
    setCurrentUser(upd);
    // Silent push
    fetch(`/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email, name: currentUser.name, subscriptionStatus: tier })
    }).catch(() => {});
  };

  // Content indexing portal callback
  const handleAddCustomContent = (newContent: any) => {
    const updatedCatalogList = [...catalog, newContent];
    setCatalog(updatedCatalogList);

    // Persist user added registries to localStorage
    const cachedDiff = updatedCatalogList.filter(c => c.id.startsWith('custom_'));
    localStorage.setItem('cineverse_custom_content', JSON.stringify(cachedDiff));
  };

  const handleDeleteContent = (id: string) => {
    const filtered = catalog.filter(c => c.id !== id);
    setCatalog(filtered);

    const cachedDiff = filtered.filter(c => c.id.startsWith('custom_'));
    if (cachedDiff.length > 0) {
      localStorage.setItem('cineverse_custom_content', JSON.stringify(cachedDiff));
    } else {
      localStorage.removeItem('cineverse_custom_content');
    }
  };

  // Movie genres lists 
  const moviesList = catalog.filter(c => c.type === 'movie');
  const tvList = catalog.filter(c => c.type === 'tv');
  const animeList = catalog.filter(c => c.type === 'anime');
  const recommendedList = catalog.filter(c => c.recommended);
  const trendingList = catalog.filter(c => c.trending);
  const recentlyAddedList = catalog.filter(c => c.recentlyAdded || c.id.startsWith('custom_'));

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between font-sans selection:bg-[#E50914]/30 overflow-x-hidden">
      
      {/* Primary Global Navigation Rail */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={currentUser}
        onOpenProfile={() => setShowProfileModal(true)}
        allContent={catalog}
        onSelectContent={setSelectedContent}
      />

      {/* Main Container viewport */}
      <main className="flex-grow pt-20 pb-12 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <AnimatePresence mode="wait">
          
          {/* Active Video Stream Layer OVERRIDE (Theater experience) */}
          {activePlayer && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mt-6 mb-8 w-full"
              id="active-player-wrapper"
            >
              <VideoPlayer
                content={activePlayer}
                activeEpisode={activeEpisode}
                seasonNumber={activeSeasonNumber}
                onClose={() => setActivePlayer(null)}
                onUpdateHistory={handleUpdateHistory}
              />
            </motion.div>
          )}

          {/* TAB CONTENT: HOME PORTAL */}
          {currentTab === 'home' && !activePlayer && (
            <motion.div
              key="home-tab-frame"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* Grand Banner Carousel */}
              <HeroBanner
                contentList={catalog}
                onPlay={handlePlayContent}
                onSelect={setSelectedContent}
              />

              {/* Instant direct play and URL stream bypass module */}
              <InstantLoader
                allContent={catalog}
                onLaunchStream={(content, episode, seasonNum) => {
                  // Check if this is a custom dynamic instant playback item
                  if (content.id.startsWith('custom_instant_')) {
                    handleAddCustomContent(content);
                  }
                  
                  setSelectedContent(null);
                  if (episode) {
                    setActiveEpisode(episode);
                    setActiveSeasonNumber(seasonNum || 1);
                  } else {
                    setActiveEpisode(undefined);
                  }
                  setActivePlayer(content);
                }}
              />

              {/* Continue Watching Sync row (Only populated when viewing history exists) */}
              {playbackHistory.length > 0 && (
                <div className="space-y-4" id="continue-watching-shelf">
                  <h3 className="section-title text-[18px] font-sans font-bold text-white uppercase tracking-wider border-l-[3px] border-[#E50914] pl-3">
                    Continue For You
                  </h3>
                  
                  <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                    {playbackHistory.map(hist => {
                      const associatedContent = catalog.find(c => c.id === hist.contentId);
                      return (
                        <div
                          key={`${hist.contentId}_${hist.episodeNumber || ''}`}
                          className="flex-shrink-0 w-64 bg-[#121212] border border-white/10 rounded-[4px] overflow-hidden hover:border-white/20 transition-all p-3 flex gap-3.5 group relative"
                        >
                          <img
                            src={hist.posterUrl}
                            alt="cw"
                            className="w-14 h-20 rounded-[2px] object-cover flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#E50914] transition-colors uppercase tracking-tight">
                                {hist.title}
                              </h4>
                              <p className="text-[10px] text-gray-500 truncate mt-1">
                                {hist.contentType === 'movie' 
                                  ? 'Movie Playback' 
                                  : `S${hist.seasonNumber} Ep ${hist.episodeNumber}`
                                }
                              </p>
                            </div>
                            
                            {/* Linear Seek Progress meter */}
                            <div className="space-y-1 mt-2">
                              <div className="flex justify-between text-[9px] font-mono text-gray-400">
                                <span>{hist.progressPercent}% Seen</span>
                                <span>{Math.round(hist.seekSeconds / 60)}m left</span>
                              </div>
                              <div className="w-full bg-[#050505] h-1 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#E50914] to-red-500"
                                  style={{ width: `${hist.progressPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Quick play overlay */}
                          <button
                            onClick={() => associatedContent && handlePlayContent(associatedContent)}
                            className="absolute top-2 right-2 p-1.5 bg-[#E50914] rounded-[4px] text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                            id={`cw-play-${hist.contentId}`}
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trending Streams Row */}
              <div className="space-y-4">
                <h3 className="section-title text-[18px] font-sans font-bold text-white uppercase tracking-wider border-l-[3px] border-[#E50914] pl-3">
                  Trending Blockbusters
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar custom-scrollbar">
                  {trendingList.map(item => (
                    <ContentCard
                      key={item.id}
                      content={item}
                      onPlay={handlePlayContent}
                      onSelect={setSelectedContent}
                      watchlistIds={watchlistIds}
                      favoritesIds={favoritesIds}
                      onToggleWatchlist={handleToggleWatchlist}
                      onToggleFavorites={handleToggleFavorites}
                    />
                  ))}
                </div>
              </div>

              {/* Anime Simulcasts Row */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="section-title text-[18px] font-sans font-bold text-white uppercase tracking-wider border-l-[3px] border-[#E50914] pl-3">
                    Anime Highlights
                  </h3>
                  <button onClick={() => setCurrentTab('anime')} className="text-xs text-[#E50914] font-bold flex items-center gap-1 hover:text-white cursor-pointer tracking-wider uppercase">
                    Anime Hub <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar custom-scrollbar">
                  {animeList.map(item => (
                    <ContentCard
                      key={item.id}
                      content={item}
                      onPlay={handlePlayContent}
                      onSelect={setSelectedContent}
                      watchlistIds={watchlistIds}
                      favoritesIds={favoritesIds}
                      onToggleWatchlist={handleToggleWatchlist}
                      onToggleFavorites={handleToggleFavorites}
                    />
                  ))}
                </div>
              </div>

              {/* Recommended For You row */}
              <div className="space-y-4">
                <h3 className="section-title text-[18px] font-sans font-bold text-white uppercase tracking-wider border-l-[3px] border-[#E50914] pl-3">
                  Recommended For You
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar custom-scrollbar">
                  {recommendedList.map(item => (
                    <ContentCard
                      key={item.id}
                      content={item}
                      onPlay={handlePlayContent}
                      onSelect={setSelectedContent}
                      watchlistIds={watchlistIds}
                      favoritesIds={favoritesIds}
                      onToggleWatchlist={handleToggleWatchlist}
                      onToggleFavorites={handleToggleFavorites}
                    />
                  ))}
                </div>
              </div>

              {/* Recently Added Carousel */}
              <div className="space-y-4">
                <h3 className="section-title text-[18px] font-sans font-bold text-white uppercase tracking-wider border-l-[3px] border-[#E50914] pl-3">
                  Recently Added
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar custom-scrollbar">
                  {recentlyAddedList.map(item => (
                    <ContentCard
                      key={item.id}
                      content={item}
                      onPlay={handlePlayContent}
                      onSelect={setSelectedContent}
                      watchlistIds={watchlistIds}
                      favoritesIds={favoritesIds}
                      onToggleWatchlist={handleToggleWatchlist}
                      onToggleFavorites={handleToggleFavorites}
                    />
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB CONTENT: MOVIES VIEW */}
          {currentTab === 'movies' && !activePlayer && (
            <motion.div
              key="movies-tab-frame"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Film className="w-5 h-5 text-red-500" />
                <h2 className="text-xl md:text-2xl font-bold font-display text-white">Full-Length Feature Films</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {moviesList.map(item => (
                  <ContentCard
                    key={item.id}
                    content={item}
                    onPlay={handlePlayContent}
                    onSelect={setSelectedContent}
                    watchlistIds={watchlistIds}
                    favoritesIds={favoritesIds}
                    onToggleWatchlist={handleToggleWatchlist}
                    onToggleFavorites={handleToggleFavorites}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB CONTENT: SERIES VIEW */}
          {currentTab === 'series' && !activePlayer && (
            <motion.div
              key="series-tab-frame"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Tv className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl md:text-2xl font-bold font-display text-white">Web Series & Serial Documents</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {tvList.map(item => (
                  <ContentCard
                    key={item.id}
                    content={item}
                    onPlay={handlePlayContent}
                    onSelect={setSelectedContent}
                    watchlistIds={watchlistIds}
                    favoritesIds={favoritesIds}
                    onToggleWatchlist={handleToggleWatchlist}
                    onToggleFavorites={handleToggleFavorites}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB CONTENT: ANIME CHRONICLES */}
          {currentTab === 'anime' && !activePlayer && (
            <motion.div
              key="anime-tab-frame"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AnimeSection
                animeContent={animeList}
                onPlayEpisode={handlePlayEpisode}
                onSelectContent={setSelectedContent}
              />
            </motion.div>
          )}

          {/* TAB CONTENT: GEMINI AI RECS */}
          {currentTab === 'ai' && !activePlayer && (
            <motion.div
              key="ai-tab-frame"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AIRecommendations
                userId={currentUser?.id || 'demo_user'}
                playbackHistory={playbackHistory}
                allContent={catalog}
                onPlay={handlePlayContent}
                onSelectContent={setSelectedContent}
              />
            </motion.div>
          )}

          {/* TAB CONTENT: CORE OPERATIONS (Admin Panel) */}
          {currentTab === 'analytics' && !activePlayer && (
            <motion.div
              key="ops-tab-frame"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPanel
                onAddCustomContent={handleAddCustomContent}
                onDeleteContent={handleDeleteContent}
                contentList={catalog}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* PERSISTENT MULTIMEDIA INFO EXPANDER PANEL */}
      <AnimatePresence>
        {selectedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            id="details-modal-wrapper"
          >
            <motion.div
              initial={{ y: 20, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.97 }}
              className="relative w-full max-w-3xl bg-[#121212] border border-white/10 rounded-[4px] overflow-hidden shadow-2xl"
            >
              
              {/* Top cover overlay */}
              <div className="relative h-48 md:h-64">
                <img
                  src={selectedContent.backdropUrl}
                  alt="detail backdrop"
                  className="w-full h-full object-cover brightness-[0.45]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" />
                
                {/* Close Button details overlay */}
                <button
                  onClick={() => setSelectedContent(null)}
                  className="absolute top-4 right-4 p-2 bg-black/80 border border-white/10 rounded-full text-gray-400 hover:text-white transition-all cursor-pointer"
                  id="close-details-overlay"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold text-[#E50914] bg-red-950/40 px-2.5 py-0.5 rounded-[2px] border border-red-500/20 font-sans tracking-wider">
                      Cineverse exclusive
                    </span>
                    <span className="text-amber-400 text-xs font-bold">★ {selectedContent.rating} IMDb</span>
                  </div>
                  <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-white tracking-tight uppercase leading-none">
                    {selectedContent.title}
                  </h2>
                </div>
              </div>

              {/* Informative description contents */}
              <div className="p-6 md:p-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Text descriptions */}
                  <div className="md:col-span-2 space-y-4">
                    <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-sans">
                      {selectedContent.synopsis}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePlayContent(selectedContent)}
                        className="px-6 py-2.5 bg-white hover:bg-white/90 text-black font-bold rounded-[4px] text-xs flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider"
                        id="details-stream-btn"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Play
                      </button>

                      <button
                        onClick={() => handleToggleWatchlist(selectedContent.id)}
                        className={`px-4 py-2.5 rounded-[4px] border text-xs font-bold font-sans transition-all cursor-pointer uppercase tracking-wider ${
                          watchlistIds.includes(selectedContent.id)
                            ? 'bg-[#E50914] border-[#E50914] text-white'
                            : 'bg-white/10 border-white/5 hover:bg-white/20 text-white'
                        }`}
                        id="details-watchlist-btn"
                      >
                        {watchlistIds.includes(selectedContent.id) ? '✓ Watchlist' : '+ Watchlist'}
                      </button>
                    </div>
                  </div>

                  {/* Metadata panel side card items */}
                  <div className="space-y-3.5 text-xs text-gray-400 border-l border-white/10 pl-6">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Cast</span>
                      <p className="text-gray-200 mt-1">{selectedContent.cast.join(', ')}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Genres</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedContent.genres.map(genre => (
                          <span key={genre} className="bg-white/5 border border-white/5 px-2 py-0.5 rounded-[2px] text-gray-300 font-medium">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono border-t border-white/10 pt-3">
                      <span>Index Code:</span>
                      <span className="text-white select-all">{selectedContent.tmdbId}</span>
                    </div>
                  </div>

                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECURITY PROFILE INTERFACE ACCESS DRAWER */}
      <AnimatePresence>
        {showProfileModal && (
          <UserProfileModal
            user={currentUser}
            onClose={() => setShowProfileModal(false)}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onUpdateSubscription={handleUpdateSubscription}
          />
        )}
      </AnimatePresence>

      {/* Global Bottom Footer Brand */}
      <footer className="w-full bg-gray-950/90 border-t border-gray-900 py-6 text-center text-xs text-gray-500 mt-12 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-display font-semibold text-gray-400">
            <span className="w-5 h-5 bg-red-600 rounded text-xs text-white flex items-center justify-center">C</span>
            CineVerse OTT Streaming Dashboard
          </div>
          <div className="flex gap-4 font-mono">
            <span className="hover:text-white transition-colors cursor-help" title="Anti-Scraping locks enabled">Encrypted Tunnel</span>
            <span>•</span>
            <a href="https://streamimdb.ru/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer" title="StreamIMDb Russian Embed engine">Source: streamimdb.ru</a>
          </div>
          <span>© 2026 CineVerse Private Corporate Media. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
}
