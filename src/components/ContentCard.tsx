/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Plus, Check, Star, Info, Heart, Award } from 'lucide-react';
import { Content } from '../types';

interface ContentCardProps {
  key?: string;
  content: Content;
  onPlay: (content: Content) => void;
  onSelect: (content: Content) => void;
  watchlistIds: string[];
  favoritesIds: string[];
  onToggleWatchlist: (contentId: string) => void;
  onToggleFavorites: (contentId: string) => void;
}

export default function ContentCard({
  content,
  onPlay,
  onSelect,
  watchlistIds,
  favoritesIds,
  onToggleWatchlist,
  onToggleFavorites,
}: ContentCardProps) {
  const inWatchlist = watchlistIds.includes(content.id);
  const inFavorites = favoritesIds.includes(content.id);

  return (
    <div className="relative flex-shrink-0 w-44 sm:w-52 h-[260px] sm:h-[310px] rounded-[4px] overflow-hidden bg-[#121212] border border-white/10 group shadow-md hover:shadow-black/80 hover:border-white/20 transition-all duration-300">
      
      {/* High Quality Poster Image */}
      <img
        src={content.posterUrl}
        alt={content.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        referrerPolicy="no-referrer"
        loading="lazy"
      />

      {/* Modern Anime badges */}
      {content.type === 'anime' && (
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {content.animeStatus === 'ongoing' && (
            <span className="bg-[#E50914] text-[9px] font-bold text-white px-1.5 py-0.5 rounded-[2px] tracking-wide uppercase">
              Ongoing
            </span>
          )}
          <div className="flex gap-1">
            {content.dubAvailable && (
              <span className="bg-white/10 backdrop-blur-md text-[8px] font-extrabold text-white px-1.5 py-0.5 rounded-[2px] uppercase font-mono border border-white/10">
                Dub
              </span>
            )}
            {content.subAvailable && (
              <span className="bg-white/10 backdrop-blur-md text-[8px] font-extrabold text-white px-1.5 py-0.5 rounded-[2px] uppercase font-mono border border-white/10">
                Sub
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top 10 IMDB highlight badge */}
      {content.rating >= 8.8 && (
        <div className="absolute top-2 right-2 bg-[#E50914] font-bold font-sans text-[9px] text-white px-1.5 py-0.5 rounded-[2px] shadow-md z-10 flex items-center gap-0.5 pointer-events-none uppercase tracking-wide">
          ★ {content.rating} IMDB
        </div>
      )}

      {/* Bottom Cinematic Gradient Shading overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Premium Cinematic Hover Information Container */}
      <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-3 group-hover:translate-y-0 z-20">
        
        {/* Rating Metrics & Year */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span className="font-sans text-xs font-bold text-white">{content.rating}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">
            {content.releaseYear.split('-')[0]}
          </span>
        </div>

        {/* Dynamic Film Title */}
        <h4 className="font-sans font-extrabold text-xs text-white tracking-tight leading-tight line-clamp-1 truncate mb-2 uppercase">
          {content.title}
        </h4>

        {/* Micro Category Listing */}
        <div className="flex flex-wrap gap-1 mb-3">
          {content.genres.slice(0, 2).map(tag => (
            <span key={tag} className="text-[9px] bg-white/5 border border-white/10 text-gray-300 px-1.5 py-0.5 rounded-[2px] font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* Clickable Quick Action Rows */}
        <div className="flex items-center gap-1.5">
          {/* Play/Stream Button */}
          <button
            onClick={() => onPlay(content)}
            className="flex-1 py-1.5 bg-white text-black hover:bg-white/90 font-bold rounded-[4px] text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
            id={`card-play-${content.id}`}
          >
            <Play className="w-3 h-3 fill-current" />
            Stream
          </button>

          {/* Details trigger */}
          <button
            onClick={() => onSelect(content)}
            className="p-1.5 bg-white/10 hover:bg-white/20 hover:text-white rounded-[4px] text-gray-300 border border-white/5 transition-all cursor-pointer"
            title="Expand Synopsis Details"
            id={`card-select-${content.id}`}
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Watchlist toggle trigger */}
          <button
            onClick={() => onToggleWatchlist(content.id)}
            className={`p-1.5 rounded-[4px] border transition-all cursor-pointer ${
              inWatchlist
                ? 'bg-[#E50914] border-[#E50914] text-white'
                : 'bg-white/10 border-white/5 hover:bg-white/20 text-gray-300 hover:text-white'
            }`}
            title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            id={`card-watchlist-${content.id}`}
          >
            {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>

          {/* Heart Favorites toggle trigger */}
          <button
            onClick={() => onToggleFavorites(content.id)}
            className={`p-1.5 rounded-[4px] border transition-all cursor-pointer ${
              inFavorites
                ? 'bg-rose-600/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30 font-semibold'
                : 'bg-white/10 border-white/5 hover:bg-white/20 text-gray-300 hover:text-white'
            }`}
            title={inFavorites ? 'Remove favorite' : 'Set favorite'}
            id={`card-fav-${content.id}`}
          >
            <Heart className={`w-3.5 h-3.5 ${inFavorites ? 'fill-current' : ''}`} />
          </button>
        </div>

      </div>
    </div>
  );
}
