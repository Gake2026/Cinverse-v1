/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, Info, Volume2, VolumeX, ChevronLeft, ChevronRight, Star, Sparkles } from 'lucide-react';
import { Content } from '../types';

interface HeroBannerProps {
  contentList: Content[];
  onPlay: (content: Content) => void;
  onSelect: (content: Content) => void;
}

export default function HeroBanner({ contentList, onPlay, onSelect }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const trendingItems = contentList.filter(item => item.trending).slice(0, 4);

  useEffect(() => {
    // Reset trailer play state when sliding moves
    setIsPlayingTrailer(false);
    
    // Auto-slide every 10 seconds unless the user starts playing a trailer
    if (isPlayingTrailer) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % trendingItems.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [currentIndex, isPlayingTrailer, trendingItems.length]);

  if (trendingItems.length === 0) return null;
  const activeContent = trendingItems[currentIndex];

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % trendingItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + trendingItems.length) % trendingItems.length);
  };

  return (
    <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-[#050505] border-b border-white/10 rounded-sm">
      {/* Background Media Panel */}
      <div className="absolute inset-0 w-full h-full transition-all duration-700 ease-in-out">
        {isPlayingTrailer && activeContent.youtubeTrailer ? (
          <div className="absolute inset-0 w-full h-full scale-[1.35] pointer-events-none origin-center">
            <iframe
              title={`Trailer: ${activeContent.title}`}
              src={`https://www.youtube.com/embed/${activeContent.youtubeTrailer}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${activeContent.youtubeTrailer}&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1`}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="absolute inset-0">
            <img
              src={activeContent.backdropUrl}
              alt={activeContent.title}
              className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.05] transition-transform duration-[10s] scale-102"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Ambient Overlay Gradients matching Netflix design closely */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/20 to-transparent" />
      </div>

      {/* Hero Interactive Text Container */}
      <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-12 pb-10 md:pb-16 max-w-2xl z-10">
        
        {/* Dynamic Badges */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <div className="text-[#E50914] font-sans font-bold text-[11px] md:text-xs tracking-[2px] uppercase">
            CineVerse Premiering Now
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 border border-white/25 rounded-[4px] text-white">
            {activeContent.type}
          </span>
          <span className="text-xs text-gray-400 font-medium tracking-wide">
            {activeContent.releaseYear}
          </span>
          <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-400 font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-[4px]">
            {Math.round(activeContent.rating * 10 + 10)}% Match
          </div>
        </div>

        {/* Movie Big Bold Display Title */}
        <h1 className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-[-2px] leading-[1.1] mb-4 select-none uppercase">
          {activeContent.title}
        </h1>

        {/* Genres & Tags */}
        <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-[#a3a3a3]">
          {activeContent.genres.map((g, i) => (
            <React.Fragment key={g}>
              <span className="text-white">{g}</span>
              {i < activeContent.genres.length - 1 && <span className="text-white/20">•</span>}
            </React.Fragment>
          ))}
          {activeContent.duration && (
            <>
              <span className="text-white/20">•</span>
              <span className="text-white">{activeContent.duration}</span>
            </>
          )}
        </div>

        {/* Story Synopsis */}
        <p className="text-xs md:text-sm text-[#a3a3a3] leading-relaxed mb-6 max-w-xl line-clamp-3 font-sans">
          {activeContent.synopsis}
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onPlay(activeContent)}
            className="px-7 py-3 rounded-[4px] bg-white text-[#050505] hover:bg-white/90 font-bold transition-all flex items-center gap-2 text-[14px] cursor-pointer"
            id="hero-play-btn"
          >
            <Play className="w-4 h-4 fill-current" />
            Play Now
          </button>

          <button
            onClick={() => onSelect(activeContent)}
            className="px-7 py-3 rounded-[4px] bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold transition-all flex items-center gap-2 text-[14px] cursor-pointer"
            id="hero-info-btn"
          >
            <Info className="w-4 h-4" />
            More Info
          </button>

          {activeContent.youtubeTrailer && (
            <button
              onClick={() => {
                if (!isPlayingTrailer) {
                  setIsPlayingTrailer(true);
                  setIsMuted(true);
                } else {
                  setIsMuted(!isMuted);
                }
              }}
              className="p-3 rounded-[4px] bg-white/10 hover:bg-white/20 text-white cursor-pointer backdrop-blur transition-all flex items-center justify-center border border-white/5"
              title={isPlayingTrailer ? (isMuted ? 'Unmute Trailer' : 'Mute Trailer') : 'Watch Playable Promo'}
              id="hero-sound-btn"
            >
              {!isPlayingTrailer ? (
                <div className="flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-[11px]">
                  <Play className="w-3.5 h-3.5" /> Promo
                </div>
              ) : isMuted ? (
                <VolumeX className="w-4 h-4 text-gray-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#E50914]" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Sliding Control Arrows */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2 z-10">
        <button
          onClick={handlePrev}
          className="p-2.5 rounded-full bg-gray-950/80 hover:bg-red-600/20 border border-gray-800 hover:border-red-500/40 text-gray-400 hover:text-white cursor-pointer transition-all"
          id="hero-prev-btn"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-xs font-mono text-gray-500 tracking-wider">
          <span className="text-white font-bold">{currentIndex + 1}</span> / {trendingItems.length}
        </div>
        <button
          onClick={handleNext}
          className="p-2.5 rounded-full bg-gray-950/80 hover:bg-red-600/20 border border-gray-800 hover:border-red-500/40 text-gray-400 hover:text-white cursor-pointer transition-all"
          id="hero-next-btn"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Lower Linear Gradient Screen Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-950 to-transparent" />
    </div>
  );
}
