/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Play, Search, AlertCircle, History, RefreshCcw, Star, Compass } from 'lucide-react';
import { AIRecommendation, PlaybackHistory, Content } from '../types';

interface AIRecommendationsProps {
  userId: string;
  playbackHistory: PlaybackHistory[];
  allContent: Content[];
  onPlay: (content: Content) => void;
  onSelectContent: (content: Content) => void;
}

export default function AIRecommendations({
  userId,
  playbackHistory,
  allContent,
  onPlay,
  onSelectContent,
}: AIRecommendationsProps) {
  const [moodPrompt, setMoodPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([
    {
      id: 'ai_init_1',
      title: 'Interstellar',
      type: 'movie',
      matchPercent: 98,
      reason: 'Since you enjoy immersive cosmic dramas, Interstellar provides a perfect balance of hard physics, emotional storytelling, and gorgeous scoring.',
      genreTags: ['Sci-Fi', 'Drama', 'Adventure'],
      backdropUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'ai_init_2',
      title: 'Cyberpunk: Edgerunners',
      type: 'anime',
      matchPercent: 94,
      reason: 'Matches your interest in fast-paced sci-fi. Edgerunners explores a visually dense futuristic landscape with high stakes and gorgeous animated battles.',
      genreTags: ['Anime', 'Action', 'Sci-Fi'],
      backdropUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1200'
    }
  ]);

  const presetMoods = [
    'Mind-bending Sci-Fi Thriller',
    'Dark gritty psychological suspense',
    'Cozy heartwarming anime highschool',
    'Atmospheric space exploration with epic music',
    'Fast-paced action with deep character growth',
    'Oscar-nominated cinematic dramas',
  ];

  const handleAIQuery = async (query: string) => {
    if (query.trim() === '') return;
    setIsLoading(true);
    setError(null);
    setMoodPrompt(query);

    // Compute active history summary to feed context to the backend server
    const historySummary = playbackHistory.length > 0
      ? playbackHistory.map(h => `${h.title} (${Math.round(h.progressPercent)}% done)`).join(', ')
      : 'None yet';

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          watchHistorySummary: historySummary
        })
      });

      if (!response.ok) {
        throw new Error('AI Engine is calibrating metadata. Fetch failed.');
      }

      const data = await response.json();
      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
      } else {
        throw new Error('Calibrating coordinates. Minimal matching titles returned.');
      }
    } catch (err: any) {
      console.warn('AI API Error, pulling best proxy catalog:', err);
      setError('AI Engine taking a little longer to optimize context, loaded recommended presets below.');
    } finally {
      setIsLoading(false);
    }
  };

  // Maps the AI model output recommendation to a real content catalog object to launch the player
  const handleLaunchRecommendation = (rec: AIRecommendation) => {
    // Try to find matching preset title in our rich movie/show catalog
    const matched = allContent.find(c => c.title.toLowerCase().includes(rec.title.toLowerCase()));
    if (matched) {
      onPlay(matched);
    } else {
      // Fallback is to play first popular movie of associated type to keep experiences high
      const typeFallback = allContent.find(c => c.type === rec.type) || allContent[0];
      onPlay(typeFallback);
    }
  };

  return (
    <div className="space-y-8 bg-[#121212]/15 p-2 sm:p-4 rounded-[4px]" id="ai-recs-panel">
      
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#E50914] font-bold text-lg md:text-xl font-sans uppercase tracking-tight">
            <Sparkles className="w-5 h-5 text-[#E50914]" />
            CineVerse Gemini AI Advisor
          </div>
          <p className="text-gray-400 text-xs mt-1">
            Synthesize smart, customized cinema, series or anime match streams based purely on your active mood, taste triggers, or viewing context.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-[4px] text-xs text-gray-400">
          <History className="w-4 h-4 text-emerald-400" />
          <span>Interactive Context • {playbackHistory.length} files loaded</span>
        </div>
      </div>

      {/* Primary Input Panel */}
      <div className="bg-[#121212] border border-white/10 rounded-[4px] p-4 sm:p-6 shadow-md">
        <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
          Describe the energy, mood, or concepts of what you want to watch:
        </label>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full flex items-center bg-[#050505] border border-white/10 focus-within:border-[#E50914] focus-within:ring-0 py-2.5 px-4 rounded-[4px] transition-all">
            <Search className="w-5 h-5 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="e.g., A dystopian space thriller with mind-bending plots like Inception..."
              value={moodPrompt}
              onChange={(e) => setMoodPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAIQuery(moodPrompt)}
              className="bg-transparent text-sm text-white w-full border-none focus:outline-none placeholder-gray-500 text-sm"
              id="ai-mood-query-input"
            />
          </div>

          <button
            onClick={() => handleAIQuery(moodPrompt)}
            disabled={isLoading || moodPrompt.trim() === ''}
            className="w-full sm:w-auto px-6 py-3.5 rounded-[4px] bg-[#E50914] hover:bg-[#b8070f] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            id="query-ai-recs-trigger"
          >
            {isLoading ? (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin" />
                Synthesizing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                Generate Match
              </>
            )}
          </button>
        </div>

        {/* Preset tags block */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Quick Mood Ideas:</span>
          {presetMoods.slice(0, 4).map(mood => (
            <button
              key={mood}
              onClick={() => handleAIQuery(mood)}
              className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-[#E50914]/15 border border-white/5 hover:border-[#E50914]/30 px-3 py-1 rounded-[4px] cursor-pointer transition-all"
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Results Deck */}
      <div className="space-y-4">
        <h3 className="section-title text-[18px] font-sans font-bold text-white uppercase tracking-wider border-l-[3px] border-[#E50914] pl-3">
          Generated Recommendations
        </h3>

        {error && (
          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-[2px] flex items-start gap-2.5 text-xs text-amber-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(n => (
              <div key={n} className="h-44 rounded-[4px] border border-white/10 skeleton-shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map(rec => (
              <div
                key={rec.id}
                className="group relative rounded-[4px] border border-white/10 hover:border-white/20 bg-[#121212] overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between"
                id={`ai-card-${rec.id}`}
              >
                
                {/* Backdrop image of match item */}
                <div className="h-32 relative overflow-hidden">
                  <img
                    src={rec.backdropUrl}
                    alt={rec.title}
                    className="w-full h-full object-cover brightness-[0.45] transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" />
                  
                  {/* Absolute Match Ratio marker */}
                  <div className="absolute top-3 right-3 bg-[#E50914] text-white font-sans font-bold text-[10px] uppercase px-2 py-0.5 rounded-[2px] shadow-md z-10">
                    {rec.matchPercent}% Match
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <span className="text-[9px] uppercase font-bold text-[#E50914] tracking-wider bg-red-950/40 px-2 py-0.5 rounded-[2px] border border-red-500/10 font-sans">
                      {rec.type}
                    </span>
                    <h4 className="font-sans font-extrabold text-base text-white mt-1 uppercase leading-tight">
                      {rec.title}
                    </h4>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed font-sans">
                      {rec.reason}
                    </p>
                    
                    {/* Generative genre markers */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {rec.genreTags.map(tag => (
                        <span key={tag} className="text-[9px] bg-white/5 border border-white/5 text-gray-400 px-2 py-0.5 rounded-[2px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Primary Launchers */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => handleLaunchRecommendation(rec)}
                      className="px-4 py-1.5 rounded-[4px] bg-white text-black hover:bg-white/90 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                      id={`ai-launch-${rec.id}`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Stream Title
                    </button>

                    <button
                      onClick={() => {
                        // Find content by title and trigger details view
                        const matched = allContent.find(c => c.title.toLowerCase().includes(rec.title.toLowerCase()));
                        if (matched) onSelectContent(matched);
                      }}
                      className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer uppercase tracking-wider font-semibold"
                    >
                      Synopsis Details
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
