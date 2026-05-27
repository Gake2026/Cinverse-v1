/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Sparkles, Star, Award, Tv, ArrowRight, Video, Flame } from 'lucide-react';
import { Content, Episode, Season } from '../types';

interface AnimeSectionProps {
  animeContent: Content[];
  onPlayEpisode: (content: Content, episode: Episode, seasonNum: number) => void;
  onSelectContent: (content: Content) => void;
}

export default function AnimeSection({
  animeContent,
  onPlayEpisode,
  onSelectContent,
}: AnimeSectionProps) {
  const [activeAnime, setActiveAnime] = useState<Content>(animeContent[0]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [audioPreference, setAudioPreference] = useState<'dub' | 'sub'>('sub');

  if (animeContent.length === 0) return null;

  const currentSeason = activeAnime.seasons?.find(s => s.number === selectedSeason) || activeAnime.seasons?.[0];

  return (
    <div className="space-y-8 p-1 md:p-4 rounded-[4px]" id="anime-experience-panel">
      
      {/* Top Header Section */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-sans text-white flex items-center gap-2 uppercase tracking-tight">
            <Flame className="w-5 h-5 text-[#E50914]" />
            CineVerse Anime Hub
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Browse on-going anime series, toggle dub or sub tracks, and browse premium streaming selections.
          </p>
        </div>

        {/* Audio preferencer toggler */}
        <div className="flex bg-[#050505] p-1 rounded-[4px] border border-white/5">
          {[
            { id: 'sub', label: '🇯🇵 JP Dub (Sub)' },
            { id: 'dub', label: '🇺🇸 EN Dubbed' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setAudioPreference(opt.id as 'dub' | 'sub')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-bold cursor-pointer transition-all uppercase tracking-wider ${
                audioPreference === opt.id
                  ? 'bg-[#E50914] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              id={`audio-pref-${opt.id}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout: Active Anime Spotlight Left, Anime Selector List Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Anime detail module (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-[4px] overflow-hidden min-h-[40vh] bg-[#121212] flex flex-col justify-end p-6 border border-white/10">
            {/* Backdrop shading elements */}
            <div className="absolute inset-0">
              <img
                src={activeAnime.backdropUrl}
                alt={activeAnime.title}
                className="w-full h-full object-cover filter brightness-[0.35] transition-all"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent" />

            {/* Title HUD */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-[#E50914] text-[10px] font-extrabold text-white px-2 py-0.5 rounded-[2px] tracking-wider uppercase font-sans">
                  OTAKU CHOICE
                </span>
                {activeAnime.animeStatus === 'ongoing' && (
                  <span className="bg-emerald-600 text-[10px] font-extrabold text-white px-2 py-0.5 rounded-[2px] tracking-wider uppercase font-sans animate-pulse">
                    SIMULCAST
                  </span>
                )}
                <div className="flex gap-1 text-[9px] font-mono font-bold text-gray-400">
                  {activeAnime.dubAvailable && <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-[2px]">DUB</span>}
                  {activeAnime.subAvailable && <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-[2px]">SUB</span>}
                </div>
              </div>

              <h1 className="font-sans font-extrabold text-3xl md:text-4xl text-white tracking-tight leading-none uppercase">
                {activeAnime.title}
              </h1>

              <div className="flex items-center gap-3 text-xs text-gray-400 font-bold">
                <span className="text-amber-400 flex items-center gap-1">
                  ★ {activeAnime.rating} IMDb
                </span>
                <span>•</span>
                <span>Simulcast</span>
                <span>•</span>
                <span className="text-gray-300 font-mono">{activeAnime.releaseYear}</span>
              </div>

              <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-sans max-w-2xl line-clamp-3">
                {activeAnime.synopsis}
              </p>

              {/* Series Details button */}
              <button
                onClick={() => onSelectContent(activeAnime)}
                className="mt-2 text-xs text-[#E50914] font-bold hover:text-white transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                id="anime-spotlight-info"
              >
                More Info & Cast details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Episode Selector Dashboard wrapper */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-4">
                <h3 className="font-sans font-bold text-base text-gray-200 uppercase tracking-wider">Episode Listings</h3>
                
                {/* Season tabs list if multi season available */}
                {activeAnime.seasons && activeAnime.seasons.length > 1 && (
                  <div className="flex gap-1.5 animate-fade-in">
                    {activeAnime.seasons.map(s => (
                      <button
                        key={s.number}
                        onClick={() => setSelectedSeason(s.number)}
                        className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-[2px] border transition-all cursor-pointer ${
                          selectedSeason === s.number
                            ? 'bg-[#E50914]/10 border-[#E50914] text-[#E50914]'
                            : 'bg-white/5 border-white/5 hover:border-white/15 text-gray-400'
                        }`}
                      >
                        S{s.number}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/5 px-2 py-0.5 rounded-[2px]">
                Server Fast-lane
              </span>
            </div>

            {/* List items */}
            <div className="space-y-3">
              {currentSeason?.episodes.map(ep => (
                <div
                  key={ep.id}
                  className="bg-[#121212] border border-white/5 hover:border-white/15 rounded-[4px] p-3 transition-all flex flex-col sm:flex-row gap-4 items-center justify-between group"
                  id={`ep-row-${ep.id}`}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                    <div className="relative w-36 h-20 rounded-[2px] overflow-hidden flex-shrink-0 border border-white/5 bg-[#050505]">
                      <img
                        src={ep.thumbnail}
                        alt={ep.title}
                        className="w-full h-full object-cover brightness-[0.7] group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      {/* Play Hover Indicator */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 px-1 font-mono text-[9px] text-gray-400 rounded-[2px]">
                        {ep.duration}
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1 text-center sm:text-left">
                      <div className="text-[10px] font-bold text-[#E50914] uppercase tracking-wider">
                        EPISODE {ep.number}
                      </div>
                      <h4 className="font-sans font-bold text-sm text-white leading-snug truncate">
                        {ep.title}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-1 truncate font-sans">
                        {ep.synopsis}
                      </p>
                    </div>
                  </div>

                  {/* Play episode shortcut button */}
                  <button
                    onClick={() => onPlayEpisode(activeAnime, ep, selectedSeason)}
                    className="px-4 py-2 bg-white/5 hover:bg-white text-gray-300 hover:text-black border border-white/10 hover:border-white font-bold text-[11px] uppercase tracking-wider transition-all w-full sm:w-auto text-center flex items-center justify-center gap-1.5 cursor-pointer rounded-[4px]"
                    id={`launch-ep-${ep.id}`}
                  >
                    <Video className="w-3.5 h-3.5" /> Stream
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Selector Rail List */}
        <div className="space-y-4">
          <h3 className="section-title text-[18px] font-sans font-bold text-white uppercase tracking-wider border-l-[3px] border-[#E50914] pl-3">
            Anime Catalog
          </h3>

          <div className="space-y-3 max-h-[75vh] overflow-y-auto custom-scrollbar pr-1">
            {animeContent.map(anime => {
              const isActive = anime.id === activeAnime.id;
              return (
                <button
                  key={anime.id}
                  onClick={() => {
                    setActiveAnime(anime);
                    setSelectedSeason(1);
                  }}
                  className={`w-full text-left p-2.5 rounded-[4px] border transition-all flex gap-3.5 group cursor-pointer ${
                    isActive
                      ? 'bg-[#E50914]/10 border-[#E50914] text-white font-bold'
                      : 'bg-[#121212] border-white/5 hover:border-white/15 text-gray-300'
                  }`}
                  id={`anime-sidebar-btn-${anime.id}`}
                >
                  <img
                    src={anime.posterUrl}
                    alt={anime.title}
                    className="w-12 h-16 rounded-[4px] object-cover flex-shrink-0 border border-white/5 transition-colors"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1 py-1">
                    <div className="text-[9px] font-sans font-bold text-[#E50914] uppercase tracking-wider leading-none">
                      {anime.animeStatus}
                    </div>
                    <h4 className="font-sans font-extrabold text-xs text-white truncate group-hover:text-[#E50914] transition-colors mt-1.5 uppercase leading-none">
                      {anime.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-amber-400 font-bold">★ {anime.rating}</span>
                      <span className="text-[10px] text-gray-600">•</span>
                      <span className="text-[10px] text-gray-400 font-mono">{anime.releaseYear}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
