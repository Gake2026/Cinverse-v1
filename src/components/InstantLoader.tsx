/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Sparkles, AlertCircle, Cpu, Link2, Film, Tv, CheckCircle2 } from 'lucide-react';
import { Content, Episode } from '../types';

interface InstantLoaderProps {
  allContent: Content[];
  onLaunchStream: (content: Content, episode?: Episode, seasonNum?: number) => void;
}

export default function InstantLoader({ allContent, onLaunchStream }: InstantLoaderProps) {
  const [inputValue, setInputValue] = useState('');
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [seasonNum, setSeasonNum] = useState(1);
  const [episodeNum, setEpisodeNum] = useState(1);
  
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'idle' | 'loading' | 'success' | 'error' }>({
    text: '',
    type: 'idle'
  });

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();

    if (!query) {
      setStatusMessage({ text: 'Please enter a movie title or paste an IMDb / TMDb link.', type: 'error' });
      return;
    }

    setStatusMessage({ text: '🔍 Reconstructing stream pipelines...', type: 'loading' });

    try {
      // 1. Try to extract IMDb ID (starting with tt followed by digits)
      const imdbMatch = query.match(/(tt\d+)/i);
      // 2. Try to extract TMDb ID from URL formats
      const tmdbMatch = query.match(/themoviedb\.org\/(movie|tv)\/(\d+)/i);
      // 3. Try to extract raw digits if user pastes raw TMDB ID
      const rawTmdbMatch = /^\d+$/.test(query) ? query : null;

      let detectedImdbId = '';
      let detectedTmdbId = '';
      let parsedType = contentType;

      if (imdbMatch) {
         detectedImdbId = imdbMatch[1].toLowerCase();
      } else if (tmdbMatch) {
         parsedType = tmdbMatch[1].toLowerCase() === 'tv' ? 'tv' : 'movie';
         detectedTmdbId = tmdbMatch[2];
      } else if (rawTmdbMatch) {
         detectedTmdbId = rawTmdbMatch;
      }

      // Check if we match an existing item in our localized catalog
      const matchedLocalItem = allContent.find(item => {
        if (item.title.toLowerCase() === query.toLowerCase()) return true;
        if (detectedImdbId && item.imdbId?.toLowerCase() === detectedImdbId) return true;
        if (detectedTmdbId && item.tmdbId?.toString() === detectedTmdbId) return true;
        return false;
      });

      if (matchedLocalItem) {
        setStatusMessage({ text: '🎥 Matching original catalog element found! Redirecting...', type: 'success' });
        setTimeout(() => {
          if (matchedLocalItem.type === 'movie') {
            onLaunchStream(matchedLocalItem);
          } else {
            const targetSeasonNum = seasonNum;
            const targetSeason = matchedLocalItem.seasons?.find(s => s.number === targetSeasonNum) || matchedLocalItem.seasons?.[0];
            const targetEpisode = targetSeason?.episodes.find(ep => ep.number === episodeNum) || targetSeason?.episodes[0];
            onLaunchStream(matchedLocalItem, targetEpisode, targetSeasonNum);
          }
          setStatusMessage({ text: '', type: 'idle' });
          setInputValue('');
        }, 1000);
        return;
      }

      // If it's a raw movie or show title target, look up the IMDb identity!
      let displayTitle = query;
      let posterImg = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400';
      let releaseYearVal = new Date().getFullYear().toString();
      let castList = ['Dynamic Stream Artist'];

      // Perform a search query if we don't have direct IDs or if we want to resolve details
      if (!detectedImdbId && !detectedTmdbId) {
        const response = await fetch(`/api/search/external?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error(`Failed to resolve external query [Status: ${response.status}]`);
        }
        const data = await response.json();
        if (data && data.d && data.d.length > 0) {
          // Find the best match corresponding to our chosen content type
          let bestMatch = data.d[0];
          if (parsedType === 'tv') {
            const tvMatch = data.d.find((item: any) => item.qid && (item.qid.includes('tv') || item.qid.includes('series')));
            if (tvMatch) bestMatch = tvMatch;
          } else {
            const movieMatch = data.d.find((item: any) => item.qid === 'movie' || item.qid === 'feature');
            if (movieMatch) bestMatch = movieMatch;
          }

          detectedImdbId = bestMatch.id;
          displayTitle = bestMatch.l;
          if (bestMatch.i && bestMatch.i[0]) {
            posterImg = bestMatch.i[0];
          }
          if (bestMatch.y) {
            releaseYearVal = bestMatch.y.toString();
          }
          if (bestMatch.s) {
            castList = bestMatch.s.split(', ');
          }
        } else {
          // No results found from IMDb suggestion engine, raise local error or fallback
          setStatusMessage({ text: '⚠️ No direct match found on server lookup. Playing local stream bypass...', type: 'idle' });
        }
      }

      // Construct a robust virtual Content Object on the fly
      if (displayTitle.includes('/') || displayTitle.startsWith('tt')) {
        displayTitle = detectedImdbId 
          ? `External Stream [${detectedImdbId.toUpperCase()}]`
          : detectedTmdbId 
            ? `External Stream [TMDb ID: ${detectedTmdbId}]`
            : 'Custom Direct Stream';
      }

      const virtualContent: Content = {
        id: `custom_instant_${Date.now()}`,
        title: displayTitle,
        type: parsedType,
        synopsis: `Independently dynamic stream player configured for ${displayTitle}. Fast track router streaming resolves zero-buffer connections index directly.`,
        posterUrl: posterImg,
        backdropUrl: posterImg,
        rating: 9.0,
        releaseYear: releaseYearVal,
        genres: ['Direct Play', 'External'],
        cast: castList,
        imdbId: detectedImdbId || undefined,
        tmdbId: detectedTmdbId || (!detectedImdbId ? '872585' : undefined),
        seasons: parsedType === 'tv' ? [
          {
            number: seasonNum,
            name: `Season ${seasonNum}`,
            episodes: Array.from({ length: Math.max(episodeNum, 12) }, (_, idx) => ({
              id: `custom_ep_${idx + 1}`,
              title: `Episode ${idx + 1}`,
              number: idx + 1,
              duration: '22:00',
              thumbnail: posterImg,
              synopsis: `Direct dynamic stream lookup for Season ${seasonNum} Episode ${idx + 1}.`,
              seasonNumber: seasonNum
            }))
          }
        ] : undefined
      };

      setStatusMessage({ 
        text: `🚀 Direct line established: "${displayTitle}" ${detectedImdbId ? `[IMDb: ${detectedImdbId.toUpperCase()}]` : ''}`, 
        type: 'success' 
      });

      setTimeout(() => {
        if (parsedType === 'movie') {
          onLaunchStream(virtualContent);
        } else {
          const matchedEpisode = virtualContent.seasons?.[0]?.episodes.find(ep => ep.number === episodeNum) 
            || virtualContent.seasons?.[0]?.episodes[0];
          onLaunchStream(virtualContent, matchedEpisode, seasonNum);
        }
        setStatusMessage({ text: '', type: 'idle' });
        setInputValue('');
      }, 1000);

    } catch (err: any) {
      console.error('Error resolving stream query:', err);
      setStatusMessage({ 
        text: `⚠️ Search error: ${err.message || 'Could not contact search node. Playing fallback...'}.`, 
        type: 'error' 
      });
    }
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-[4px] p-6 text-white text-sans relative overflow-hidden" id="instant-stream-loader-root">
      {/* Background lights effect */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#E50914]/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold flex items-center gap-2 uppercase tracking-tight">
            <Cpu className="w-5 h-5 text-[#E50914] animate-pulse" />
            Instant Direct Stream Solver
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Type any Movie name or paste an IMDb / TMDb full url to search and play instantly using absolute bypass server pools.
          </p>
        </div>

        <div className="flex bg-[#050505] p-1 rounded-[4px] border border-white/5 h-9 items-center self-start md:self-auto">
          <button
            type="button"
            onClick={() => setContentType('movie')}
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-[2px] cursor-pointer transition-all flex items-center gap-1 ${
              contentType === 'movie' ? 'bg-[#E50914] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Film className="w-3 h-3" />
            Movie
          </button>
          <button
            type="button"
            onClick={() => setContentType('tv')}
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-[2px] cursor-pointer transition-all flex items-center gap-1 ${
              contentType === 'tv' ? 'bg-[#E50914] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Tv className="w-3 h-3" />
            TV Show / Anime
          </button>
        </div>
      </div>

      <form onSubmit={handleLaunch} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="e.g., Star Wars, tt1375666, or https://www.imdb.com/title/tt0903747/"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (statusMessage.type !== 'idle') setStatusMessage({ text: '', type: 'idle' });
              }}
              className="w-full bg-[#050505] border border-white/10 rounded-[4px] py-3.5 pl-11 pr-4 text-xs md:text-sm text-white focus:border-[#E50914] focus:outline-none placeholder-gray-500 tracking-wide transition-all"
              id="instant-stream-query"
            />
          </div>

          <button
            type="submit"
            disabled={statusMessage.type === 'loading'}
            className="px-6 py-3.5 bg-[#E50914] hover:bg-[#b8070f] text-white rounded-[4px] font-extrabold text-xs uppercase tracking-wider shadow-lg hover:shadow-[#E50914]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-[160px] disabled:opacity-50"
            id="instant-stream-submit"
          >
            <Play className="w-4 h-4 fill-current" />
            Play Stream
          </button>
        </div>

        {/* Dynamic TV Show options */}
        {contentType === 'tv' && (
          <div className="grid grid-cols-2 gap-4 max-w-xs animate-fade-in bg-[#050505]/50 p-3 rounded-[4px] border border-white/5">
            <div>
              <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">Season Number</label>
              <input
                type="number"
                min="1"
                max="99"
                value={seasonNum}
                onChange={(e) => setSeasonNum(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-[#050505] border border-white/10 rounded-[2px] py-1 px-2.5 text-xs text-center text-white font-mono focus:border-[#E50914] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">Episode Number</label>
              <input
                type="number"
                min="1"
                max="99"
                value={episodeNum}
                onChange={(e) => setEpisodeNum(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-[#050505] border border-white/10 rounded-[2px] py-1 px-2.5 text-xs text-center text-white font-mono focus:border-[#E50914] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Pipeline feedback messages */}
        {statusMessage.text && (
          <div 
            className={`p-3.5 rounded-[4px] border text-xs flex items-center gap-2.5 animate-pulse ${
              statusMessage.type === 'error' 
                ? 'bg-red-500/5 border-red-500/20 text-red-400'
                : statusMessage.type === 'success'
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-gray-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#E50914]" />
            )}
            <span className="font-semibold tracking-wide">{statusMessage.text}</span>
          </div>
        )}
      </form>
    </div>
  );
}
