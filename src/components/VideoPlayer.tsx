/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  Settings, RotateCcw, Share2, Award, SkipForward, ArrowLeft, Tv, RefreshCw, Layers 
} from 'lucide-react';
import { Content, Episode } from '../types';

interface VideoPlayerProps {
  content: Content;
  activeEpisode?: Episode;
  seasonNumber?: number;
  onClose: () => void;
  onUpdateHistory: (
    contentId: string, 
    progressPercent: number, 
    currentSeek: number, 
    duration: number,
    seasonNum?: number,
    episodeNum?: number,
    episodeTitle?: string
  ) => void;
}

export default function VideoPlayer({
  content,
  activeEpisode,
  seasonNumber,
  onClose,
  onUpdateHistory,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120); // mock duration seconds
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedServer, setSelectedServer] = useState('imdb');
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [activeAudioLanguage, setActiveAudioLanguage] = useState('eng');
  const [activeSubtitles, setActiveSubtitles] = useState('none');

  const playerRef = useRef<HTMLDivElement>(null);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto skip intro threshold logic (e.g., from 10s to 35s)
  useEffect(() => {
    if (currentTime > 10 && currentTime < 35) {
      setShowSkipIntro(true);
    } else {
      setShowSkipIntro(false);
    }

    // Debounce backend history updates
    if (currentTime > 0 && currentTime % 8 === 0) {
      const progressPercent = Math.min(Math.round((currentTime / duration) * 100), 100);
      onUpdateHistory(
        content.id,
        progressPercent,
        currentTime,
        duration,
        seasonNumber,
        activeEpisode?.number,
        activeEpisode?.title
      );
    }
  }, [currentTime, duration]);

  // Handle ticking of progress timer for the Mock HLS mode
  useEffect(() => {
    if (selectedServer !== 'cdn') return;
    
    if (isPlaying) {
      updateTimerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (updateTimerRef.current) clearInterval(updateTimerRef.current);
    }

    return () => {
      if (updateTimerRef.current) clearInterval(updateTimerRef.current);
    };
  }, [isPlaying, selectedServer, duration]);

  const handleSkipIntro = () => {
    setCurrentTime(36);
    setShowSkipIntro(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!isFullscreen) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen to fullscreen exit key binds automatically
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Compute streamimdb embedding URL
  // Movie format: https://streamimdb.ru/movie/{tmdb_id_or_imdb_id}
  // TV format: https://streamimdb.ru/tv/{tmdb_id_or_imdb_id}/{season_number}/{episode_number}
  const streamImdbUrl = content.type === 'movie'
    ? `https://streamimdb.ru/movie/${content.tmdbId || content.imdbId || '872585'}`
    : `https://streamimdb.ru/tv/${content.tmdbId || content.imdbId || '66732'}/${seasonNumber || 1}/${activeEpisode?.number || 1}`;

  return (
    <div 
      ref={playerRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-black transition-all duration-500 shadow-2xl ${
        isTheaterMode ? 'z-50 border border-red-500/20' : 'border border-gray-900'
      }`}
      id="cineverse-video-component"
    >
      {/* Top Media Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/90 to-transparent z-40 flex items-center justify-between pointer-events-auto">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white px-3 py-1.5 rounded-lg bg-gray-950/60 border border-gray-800 backdrop-blur-md cursor-pointer transition-colors"
          id="close-player-btn"
        >
          <ArrowLeft className="w-4 h-4 text-red-500" /> Back to Dashboard
        </button>

        <div className="text-right hidden sm:block">
          <h2 className="text-white font-display font-bold text-sm md:text-base leading-tight">
            {content.title}
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            {content.type === 'movie' 
              ? 'Feature Film • Ultra HD' 
              : `S${seasonNumber || 1} • Ep ${activeEpisode?.number || 1}: "${activeEpisode?.title || 'Chapter Episode'}"`
            }
          </p>
        </div>
      </div>

      {/* Main Core Screen Frame (The Iframe stream OR Mock Canvas with Custom HUDs) */}
      <div className="relative aspect-video w-full flex items-center justify-center bg-gray-950">
        {selectedServer === 'imdb' ? (
          // Undercover REAL streamimdb player container with beautiful lighting border
          <div className="w-full h-full relative">
            <iframe
              src={streamImdbUrl}
              title={`Streaming: ${content.title}`}
              className="w-full h-full border-none"
              allowFullScreen
              referrerPolicy="no-referrer"
            />
            {/* Direct Link Info Watermark */}
            <a
              href="https://streamimdb.ru/"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 left-2 bg-black/80 font-mono text-[9px] text-gray-400 px-2 py-1 rounded border border-gray-800 hover:text-white transition-colors cursor-pointer z-40"
            >
              Source: streamimdb.ru
            </a>

            {/* Direct Link Bypass Action */}
            <div className="absolute bottom-2 right-2 bg-black/90 font-sans text-[10px] text-gray-300 px-3 py-1.5 rounded-[4px] border border-white/10 shadow-2xl z-40 flex items-center gap-2">
              <span className="hidden xs:inline">Iframe player blocked?</span>
              <a
                href={streamImdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E50914] text-white font-extrabold px-2 py-1 rounded-[2px] uppercase text-[9px] hover:bg-white hover:text-black transition-all cursor-pointer tracking-wider"
              >
                ⚡ Open Stream Directly (New Tab)
              </a>
            </div>
          </div>
        ) : (
          // CineVerse Premium Direct CDN video mockup with complete controls HUD
          <div className="w-full h-full relative flex items-center justify-center">
            {/* Cinematic visual mockup loop based on visual genre theme */}
            <img 
              src={content.backdropUrl}
              alt="CDN stream placeholder"
              className={`w-full h-full object-cover filter transition-all ${
                isPlaying ? 'brightness-[0.4] contrast-[1.1] scale-100 blur-[2px]' : 'brightness-[0.2] contrast-[0.9] blur-[8px]'
              }`}
            />

            {/* Custom Overlay HUD Controls (Visible when not in iframe mode) */}
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-between p-4 md:p-6 z-30">
              <div /> {/* Spacer */}

              {/* Centered Large Interactive Play Indicator */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-5 rounded-full bg-red-600/90 text-white hover:scale-110 active:scale-95 transition-all cursor-pointer red-glow"
                  id="cdn-play-trigger"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current" />}
                </button>
              </div>

              {/* Bottom Custom Control Deck Component */}
              <div className="bg-gray-950/80 p-3 md:p-4 rounded-xl border border-gray-900 backdrop-blur-md flex flex-col gap-3">
                
                {/* Custom Seek Bar Tracker */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400">{formatTime(currentTime)}</span>
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full relative cursor-pointer overflow-hidden group">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-indigo-500 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <input 
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={(e) => setCurrentTime(Number(e.target.value))}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                  <span className="text-xs font-mono text-gray-400">{formatTime(duration)}</span>
                </div>

                {/* Sub-panels Control Row */}
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-4">
                    {/* Retro Scrub helper */}
                    <button
                      onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                      className="p-1.5 text-gray-400 hover:text-white cursor-pointer transition-colors"
                      title="Rewind 10 Seconds"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Volume Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-gray-400 hover:text-white cursor-pointer transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(Number(e.target.value));
                          setIsMuted(false);
                        }}
                        className="w-16 h-1 bg-gray-700 rounded-full accent-red-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Right hand controls (Speed, dubs, subs etc) */}
                  <div className="flex items-center gap-3 md:gap-4">
                    {/* Audio Track Selector */}
                    <select
                      value={activeAudioLanguage}
                      onChange={(e) => setActiveAudioLanguage(e.target.value)}
                      className="bg-gray-900/80 text-[11px] text-gray-300 font-medium px-2 py-1 rounded border border-gray-800 focus:border-red-500 cursor-pointer"
                    >
                      <option value="eng">English [ENG]</option>
                      <option value="jpn">Japanese [日本語]</option>
                      <option value="hin">Hindi [हिन्दी]</option>
                    </select>

                    {/* Subtitle Track Selector */}
                    <select
                      value={activeSubtitles}
                      onChange={(e) => setActiveSubtitles(e.target.value)}
                      className="bg-gray-900/80 text-[11px] text-gray-300 font-medium px-2 py-1 rounded border border-gray-800 focus:border-red-500 cursor-pointer"
                    >
                      <option value="none">No Subtitles</option>
                      <option value="eng">English [CC]</option>
                      <option value="jpn">Japanese [JP]</option>
                      <option value="spa">Spanish [ES]</option>
                    </select>

                    {/* Speed selection */}
                    <select
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                      className="bg-gray-900/80 text-[11px] text-gray-300 font-medium px-2 py-1 rounded border border-gray-800 focus:border-red-500 cursor-pointer"
                    >
                      <option value="0.75">0.75x</option>
                      <option value="1">1.0x (Normal)</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2.0x</option>
                    </select>

                    {/* Fullscreen Trigger */}
                    <button
                      onClick={toggleFullscreen}
                      className="p-1.5 text-gray-400 hover:text-white cursor-pointer transition-colors"
                      title={isFullscreen ? 'Exit Fullscreen' : 'Enter 4K Fullscreen'}
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Floating Skip Intro Trigger Button (Visible between 10s and 35s in CDN stream mode) */}
        {showSkipIntro && selectedServer === 'cdn' && (
          <button
            onClick={handleSkipIntro}
            className="absolute bottom-24 right-6 px-4 py-2 bg-gradient-to-r from-red-600 to-indigo-600 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xl shadow-red-500/30 border border-red-500/20 z-40 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-bounce"
            id="skip-intro-btn-action"
          >
            <SkipForward className="w-4 h-4" /> Skip Cinematic Intro
          </button>
        )}
      </div>

      {/* Multi Server Selector Deck */}
      <div className="p-4 bg-gray-950 border-t border-gray-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Servers Tab lists */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 mr-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-red-500" /> Active CDN Server:
          </span>
          {[
            { id: 'imdb', label: 'External Server', note: 'Subtitle/Audio embeds' },
            { id: 'cdn', label: 'CineVerse Pro Player (HLS Overlay)', note: 'Premium fast CDN' },
          ].map(server => (
            <button
              key={server.id}
              onClick={() => setSelectedServer(server.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedServer === server.id
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/10'
                  : 'bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800'
              }`}
              id={`server-btn-${server.id}`}
            >
              <RefreshCw className="w-3 h-3" />
              {server.label}
            </button>
          ))}
        </div>

        {/* Cinematic theater controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
          <button
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              isTheaterMode 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                : 'bg-gray-900 border-gray-800 hover:text-white'
            }`}
            title="Dims the rest of the application interface for a cinema experience"
            id="theater-mode-btn"
          >
            <Tv className="w-3.5 h-3.5" />
            {isTheaterMode ? 'Theater Mode ON' : 'Ambiance Lighting'}
          </button>
          
          <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-gray-500 bg-gray-900/40 px-2 py-1 rounded">
            <Award className="w-3.5 h-3.5 text-indigo-400" /> High Bitrate Active
          </div>
        </div>

      </div>
    </div>
  );
}
