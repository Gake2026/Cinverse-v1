/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Trash2, Edit3, Check, CloudLightning, ShieldAlert, Users, 
  Tv, Film, Eye, Play, DollarSign, Activity, Award, Star, Sliders, TrendingUp
} from 'lucide-react';
import { Content, AdminAnalytics } from '../types';

interface AdminPanelProps {
  onAddCustomContent: (newContent: any) => void;
  onDeleteContent: (id: string) => void;
  contentList: Content[];
}

export default function AdminPanel({
  onAddCustomContent,
  onDeleteContent,
  contentList,
}: AdminPanelProps) {
  // Mock analytics metrics
  const analytics: AdminAnalytics = {
    totalWatchTimeHours: 148200,
    totalUsers: 5882,
    activeStreams: 342,
    subscriberConversionRate: 72.8,
    conversionsWeekly: [45, 52, 68, 72, 85, 99, 114],
    audienceDemographics: [
      { genre: 'Action', count: 420 },
      { genre: 'Anime', count: 380 },
      { genre: 'Sci-Fi', count: 310 },
      { genre: 'Drama', count: 240 },
    ],
    popularWatchTimes: [
      { hour: '6 PM', views: 820 },
      { hour: '8 PM', views: 1240 },
      { hour: '10 PM', views: 1480 },
      { hour: '12 AM', views: 920 },
    ],
  };

  // Content Upload States
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'movie' | 'tv' | 'anime'>('movie');
  const [newGenre, setNewGenre] = useState('Sci-Fi');
  const [newTmdbId, setNewTmdbId] = useState('');
  const [newImdbId, setNewImdbId] = useState('');
  const [newReleaseYear, setNewReleaseYear] = useState('2026');
  const [newDuration, setNewDuration] = useState('2h 15m');
  const [newSynopsis, setNewSynopsis] = useState('');
  const [newPosterUrl, setNewPosterUrl] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400');
  const [newBackdropUrl, setNewBackdropUrl] = useState('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1200');
  const [newRating, setNewRating] = useState('8.5');
  const [newTrailer, setNewTrailer] = useState('dQw4w9WgXcQ');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'users' | 'moderation'>('dashboard');

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const added = {
      id: `custom_${Date.now()}`,
      title: newTitle,
      type: newType,
      genres: [newGenre],
      tmdbId: newTmdbId || '157336', // Fallback to Interstellar if empty
      imdbId: newImdbId,
      releaseYear: newReleaseYear,
      duration: newDuration,
      rating: parseFloat(newRating) || 8.0,
      synopsis: newSynopsis || 'Added via CineVerse Admin Upload Portal.',
      posterUrl: newPosterUrl,
      backdropUrl: newBackdropUrl,
      youtubeTrailer: newTrailer,
      trending: true,
      recentlyAdded: true
    };

    onAddCustomContent(added);

    // Reset fields
    setNewTitle('');
    setNewTmdbId('');
    setNewSynopsis('');
    alert(`"${newTitle}" successfully indexed under TMDb stream registers!`);
  };

  return (
    <div className="space-y-8 bg-[#121212]/15 p-2 sm:p-4 rounded-[4px]" id="cineverse-admin-component">
      
      {/* Admin Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-sans text-white flex items-center gap-2 uppercase tracking-tight">
            <Sliders className="w-5 h-5 text-[#E50914]" />
            CineVerse operations center
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Publish stream indexes, monitor active traffic, customize subscription tiers, and coordinate fallback protocols.
          </p>
        </div>

        {/* Console Hub Category Selectors */}
        <div className="flex bg-[#050505] p-1 rounded-[4px] border border-white/5">
          {[
            { id: 'dashboard', label: '📊 Metrics' },
            { id: 'content', label: '🍿 Stream Database' },
            { id: 'users', label: '👥 Users' },
            { id: 'moderation', label: '🛡️ Safeguards' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-bold cursor-pointer transition-all uppercase tracking-wider ${
                activeTab === tab.id
                  ? 'bg-[#E50914] text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
              id={`admin-tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUBTAB 1: Metrics Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 't1', label: 'Watch Time (Hrs)', val: '148.2K', sub: 'Calculated metrics', icon: Activity, color: 'text-emerald-500' },
              { id: 't2', label: 'Active Users', val: '5,882', sub: '+12% weekly sync', icon: Users, color: 'text-indigo-400' },
              { id: 't3', label: 'Current Connection', val: '342 online', sub: 'HLS CDN live stream', icon: Eye, color: 'text-red-500 animate-pulse' },
              { id: 't4', label: 'VIP Revenue', val: '72.8%', sub: 'Account conversion rate', icon: DollarSign, color: 'text-amber-500' },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className="bg-[#121212] p-4 rounded-[4px] border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-2 right-2 p-1.5 bg-black/40 rounded-[2px] border border-white/5">
                    <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 block uppercase tracking-wider">{stat.label}</span>
                  <span className="text-2xl md:text-3xl font-sans font-extrabold text-white mt-2 block">{stat.val}</span>
                  <span className="text-[10px] text-gray-400 tracking-wide mt-1 block font-medium uppercase">{stat.sub}</span>
                </div>
              );
            })}
          </div>

          {/* Graphical Analytics (D3 mockup pure code visuals) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Demographic Distribution */}
            <div className="bg-[#121212] p-5 rounded-[4px] border border-white/10">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider flex items-center gap-1 uppercase">
                <TrendingUp className="w-4 h-4 text-[#E50914]" /> AUDIENCE GENRE POPULARITY INDEX
              </span>
              <div className="mt-6 space-y-4">
                {analytics.audienceDemographics.map((demo, idx) => {
                  const maxCount = 420;
                  const percentWidth = (demo.count / maxCount) * 100;
                  const barColors = [
                    'bg-[#E50914]',
                    'bg-indigo-600',
                    'bg-emerald-600',
                    'bg-amber-500'
                  ];
                  return (
                    <div key={demo.genre} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-300 uppercase tracking-tight">{demo.genre} Index</span>
                        <span className="font-bold text-white font-mono">{demo.count} accounts</span>
                      </div>
                      <div className="w-full bg-[#050505] h-1.5 rounded-[4px] overflow-hidden">
                        <div 
                          className={`h-full rounded-[4px] ${barColors[idx % barColors.length]}`}
                          style={{ width: `${percentWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hourly Active Streams Tracker */}
            <div className="bg-[#121212] p-5 rounded-[4px] border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider flex items-center gap-1 uppercase">
                  <ClockIcon className="w-4 h-4 text-emerald-400" /> CDN PEAK TRAFFIC ACTIVITY
                </span>
                <p className="text-xs text-gray-500 mt-1">Daily database concurrent operations measured dynamic.</p>
              </div>

              {/* Graphic line node bars */}
              <div className="grid grid-cols-4 gap-2 mt-6 h-36 items-end pb-2">
                {analytics.popularWatchTimes.map(time => {
                  const maxVal = 1480;
                  const ratio = (time.views / maxVal) * 100;
                  return (
                    <div key={time.hour} className="flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] text-gray-400 font-mono font-bold leading-none">{time.views}</span>
                      <div 
                        className="w-8 bg-[#E50914] rounded-t-[2px] shadow-lg relative group overflow-hidden"
                        style={{ height: `${ratio * 0.7}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform" />
                      </div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">{time.hour}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUBTAB 2: Content Indexes & Upload Portal */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in font-sans">
          
          {/* Add Content Portal (1 Column Form) */}
          <div className="bg-[#121212] p-5 rounded-[4px] border border-white/10">
            <h3 className="font-sans font-bold text-sm text-gray-200 flex items-center gap-1.5 mb-4 border-b border-white/5 pb-3 uppercase tracking-wider">
              <Plus className="w-5 h-5 text-[#E50914]" />
              Index Stream Content
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-gray-400 mb-1 uppercase tracking-wider text-[10px]">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inception"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-[4px] py-2.5 px-3 text-white focus:border-[#E50914] focus:outline-none transition-all text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 uppercase tracking-wider text-[10px]">Type</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-[4px] p-2.5 text-white focus:border-[#E50914] focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="movie">Movie</option>
                    <option value="tv">TV Series</option>
                    <option value="anime">Anime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 uppercase tracking-wider text-[10px]">Primary Genre</label>
                  <select
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-[4px] p-2.5 text-white focus:border-[#E50914] focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Action">Action</option>
                    <option value="Anime">Anime</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Drama">Drama</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 uppercase tracking-wider text-[10px]">TMDb ID (Required)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 157336"
                    value={newTmdbId}
                    onChange={(e) => setNewTmdbId(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-[4px] py-2.5 px-3 text-white focus:border-[#E50914] focus:outline-none transition-all text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 uppercase tracking-wider text-[10px]">Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026"
                    value={newReleaseYear}
                    onChange={(e) => setNewReleaseYear(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-[4px] py-2.5 px-3 text-white focus:border-[#E50914] focus:outline-none transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 uppercase tracking-wider text-[10px]">YouTube Trailer ID</label>
                <input
                  type="text"
                  placeholder="e.g. dQw4w9WgXcQ"
                  value={newTrailer}
                  onChange={(e) => setNewTrailer(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-[4px] py-2.5 px-3 text-white focus:border-[#E50914] focus:outline-none transition-all text-xs"
                  id="new-trailer-id-input"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 uppercase tracking-wider text-[10px]">Synopsis</label>
                <textarea
                  placeholder="Enter story outline..."
                  value={newSynopsis}
                  onChange={(e) => setNewSynopsis(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-[4px] p-2.5 text-white focus:border-[#E50914] focus:outline-none transition-all text-xs h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#E50914] hover:bg-[#b8070f] font-bold text-white rounded-[4px] shadow-md cursor-pointer flex items-center justify-center gap-1 text-xs uppercase tracking-wider"
                id="add-content-btn"
              >
                <CloudLightning className="w-4 h-4" /> Save Content Index
              </button>
            </form>
          </div>

          {/* Active Registers Listing (2 Columns Table) */}
          <div className="lg:col-span-2 bg-[#121212] p-5 rounded-[4px] border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="font-sans font-bold text-sm text-gray-200 border-b border-white/5 pb-3 mb-4 uppercase tracking-wider">
                Active Database Registry ({contentList.length} items)
              </h3>
              
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1.5">
                {contentList.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#050505] border border-white/5 rounded-[4px] flex items-center justify-between gap-4 group hover:border-[#E50914]/40 transition-all text-xs text-gray-400 font-medium"
                    id={`reg-row-${item.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.posterUrl}
                        alt="index mini"
                        className="w-8 h-12 rounded-[2px] object-cover border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="text-white font-bold font-sans truncate max-w-[200px] uppercase tracking-tight">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-gray-500 text-[10px] uppercase">
                          <span className="bg-white/5 text-gray-300 font-mono text-[9px] px-1 py-0.5 rounded-[2px] border border-white/5">
                            {item.type}
                          </span>
                          <span>TMDb: {item.tmdbId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right hidden sm:block">
                        <span className="text-amber-400 font-bold block">★ {item.rating}</span>
                        <span className="text-[10px] text-gray-500 block font-mono">{item.releaseYear}</span>
                      </div>
                      
                      <button
                        onClick={() => onDeleteContent(item.id)}
                        className="p-2 bg-white/5 hover:bg-[#E50914]/10 text-gray-400 hover:text-red-500 rounded-[4px] border border-white/5 hover:border-red-500/10 cursor-pointer transition-all"
                        title="Delete registry"
                        id={`del-reg-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 font-mono uppercase tracking-wider pt-4">
              <span>Database integrity check: Active</span>
              <span>Syncing fallbacks local</span>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 3: User Tiers */}
      {activeTab === 'users' && (
        <div className="bg-[#121212] p-6 rounded-[4px] border border-white/10 animate-fade-in font-sans">
          <h3 className="font-sans font-bold text-sm text-gray-200 border-b border-white/5 pb-3 mb-4 uppercase tracking-wider">
            Demographic Accounts & VIP Billing Index
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-400 font-medium whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Profile</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Subscription Plan</th>
                  <th className="py-3 px-4">Access Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {[
                  { name: 'Guest Explorer', email: 'guest@cineverse.io', tier: 'Ultra 4K Executive', start: '2026-05-27', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', color: 'text-amber-400 bg-amber-500/15 border-amber-500/20' },
                  { name: 'Saber Arthur', email: 'excalibur@royal.uk', tier: 'Premium HD', start: '2026-04-12', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/20' },
                  { name: 'Nezuko Kamado', email: 'bamboo@demonslayer.jp', tier: 'Otaku Gold', start: '2026-01-18', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', color: 'text-[#E50914] bg-[#E50914]/15 border-red-500/20' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="py-3.5 px-4 flex items-center gap-2">
                      <img src={row.avatar} alt="tr" className="w-7 h-7 rounded-full border border-white/10 object-cover" />
                      <span className="text-white font-extrabold uppercase tracking-tight">{row.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-500">{row.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-[2px] text-[9px] font-bold uppercase border ${row.color}`}>
                        {row.tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-42">
                      <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/10 rounded-[2px] text-[9px] font-bold uppercase tracking-wide">
                        ● Live Node
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono select-all text-gray-500">{row.start}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Moderation Tools */}
      {activeTab === 'moderation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in font-sans">
          
          <div className="bg-[#121212] p-5 rounded-[4px] border border-white/10 space-y-4">
            <h3 className="font-sans font-bold text-sm text-gray-200 border-b border-white/5 pb-3 uppercase tracking-wider">
              Anti-Scraping & Global CDN Security
            </h3>

            <div className="space-y-4 text-xs font-semibold text-gray-300">
              {[
                { label: 'Cloudflare Threat Mitigation', val: 'Active (Tier 5)', state: true },
                { label: 'JWT HMAC Signature Tokenizer', val: 'Strict (HMAC-SHA256)', state: true },
                { label: 'Global CDN Hotlink Locks', val: 'Normal verified', state: true },
              ].map((guard, idx) => (
                <div key={idx} className="p-3 bg-[#050505] border border-white/5 rounded-[4px] flex items-center justify-between">
                  <div>
                    <span className="block text-white text-xs uppercase tracking-tight font-bold">{guard.label}</span>
                    <span className="text-[9px] font-mono text-gray-500">{guard.val}</span>
                  </div>
                  <span className="text-emerald-500 bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/10 rounded-[4px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Normal
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#121212] p-5 rounded-[4px] border border-white/10 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-sans font-bold text-sm text-gray-200 border-b border-white/5 pb-3 uppercase tracking-wider">
                Server Integrity Flags
              </h3>
              <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed">
                If the streaming system experiences frame dropouts or iframe overrides, CineVerse auto-signals optimized proxy redirect pipelines to reconstruct subtitle mappings.
              </p>
            </div>

            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-[4px] flex items-start gap-3 text-red-200 text-xs leading-relaxed">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#E50914]" />
              <div>
                <span className="font-bold text-white block uppercase tracking-wide text-[10px] mb-1">Encrypted Pipelines Binding</span>
                Your client resolves streaming streams via <span className="font-mono text-white underline">streamimdb.ru</span> directly with fast-lane embedded zero-buffer configurations.
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

// Inline sub components to keep execution error-free
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
