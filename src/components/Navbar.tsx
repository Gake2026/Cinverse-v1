/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Bell, Sparkles, User, Tv, Film, PlusCircle, LayoutDashboard, Eye } from 'lucide-react';
import { Content, UserProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: UserProfile | null;
  onOpenProfile: () => void;
  allContent: Content[];
  onSelectContent: (content: Content) => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  user,
  onOpenProfile,
  allContent,
  onSelectContent,
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Attack on Titan Season 4 Dub is now streaming!', unread: true },
    { id: 2, text: 'Oppenheimer leads this week\'s Top 10 rankings!', unread: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter content matching search query
  const filteredContent = searchQuery.trim() === ''
    ? []
    : allContent.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Film },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'series', label: 'Series', icon: Tv },
    { id: 'anime', label: 'Anime', icon: Sparkles },
    { id: 'ai', label: 'AI Recommend', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/95 to-transparent backdrop-blur-sm border-b border-white/10 px-6 md:px-12 h-16 flex items-center justify-between">
      {/* Brand Logo & Tabs */}
      <div className="flex items-center gap-6 lg:gap-10">
        <button 
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-2 cursor-pointer group"
          id="nav-logo-btn"
        >
          <span className="font-sans font-extrabold text-2xl text-[#E50914] tracking-tighter uppercase transition-transform group-hover:scale-102">
            CineVerse
          </span>
        </button>

        {/* Desktop Tabs */}
        <div className="hidden md:flex items-center gap-6 text-[14px] font-medium font-sans">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className={`transition-colors duration-300 py-1 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white border-b-2 border-[#E50914]'
                    : 'text-[#a3a3a3] hover:text-white'
                }`}
                id={`nav-${item.id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Actions (Search, Notification, Profile) */}
      <div className="flex items-center gap-4">
        {/* Dynamic Live Search Engine */}
        <div className="relative">
          <div className="flex items-center bg-gray-900/80 border border-gray-800 rounded-full py-1.5 px-3 md:px-4 w-40 sm:w-60 lg:w-80 hover:border-gray-700 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all">
            <Search className="text-gray-400 w-4 h-4 mr-2" />
            <input
              type="text"
              placeholder="Titles, genres, cast..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="bg-transparent text-sm text-white w-full border-none focus:outline-none placeholder-gray-500"
              id="global-search-input"
            />
          </div>

          {/* Search Result Overlay */}
          {showSearchResults && searchQuery.trim() !== '' && (
            <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-gray-950/95 border border-gray-800 rounded-xl shadow-2xl overflow-hidden glass-panel-deep z-50">
              <div className="p-3 border-b border-gray-900 flex justify-between items-center bg-gray-900/20">
                <span className="text-xs font-semibold text-gray-400 tracking-wider">SEARCH RESULTS ({filteredContent.length})</span>
                <button 
                  onClick={() => setShowSearchResults(false)} 
                  className="text-xs text-red-500 hover:text-red-400 cursor-pointer"
                  id="close-search-results"
                >
                  Close
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {filteredContent.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">
                    No cinematic elements found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  filteredContent.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectContent(item);
                        setSearchQuery('');
                        setShowSearchResults(false);
                      }}
                      className="w-full text-left p-2.5 hover:bg-red-500/10 flex gap-3 border-b border-gray-900/50 group transition-all cursor-pointer"
                      id={`search-result-${item.id}`}
                    >
                      <img 
                        src={item.posterUrl} 
                        alt={item.title} 
                        className="w-10 h-14 rounded object-cover shadow border border-gray-800 group-hover:border-red-500/30 transition-all" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-white truncate group-hover:text-red-500 transition-colors">{item.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono uppercase text-gray-400 px-1 bg-gray-900 rounded">{item.type}</span>
                          <span className="text-xs text-gray-500">{item.releaseYear}</span>
                          <span className="text-xs text-yellow-500 font-bold font-mono">★ {item.rating}</span>
                        </div>
                        <div className="text-xs text-gray-400 truncate mt-1">{item.genres.join(', ')}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Tray */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowNotifications(prev => {
                if (!prev) {
                  // Mark all notifications as read on open
                  setNotifications(notifications.map(n => ({ ...n, unread: false })));
                }
                return !prev;
              });
            }}
            className="p-2 rounded-full hover:bg-gray-900/60 text-gray-400 hover:text-white transition-colors relative cursor-pointer"
            id="nav-notification-btn"
          >
            <Bell className="w-5 h-5" />
            {notifications.some(n => n.unread) && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-gray-950 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-950/95 border border-gray-800 rounded-xl shadow-2xl overflow-hidden glass-panel-deep z-50">
              <div className="p-3 border-b border-gray-900 bg-gray-900/20 flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400 tracking-wider">NOTIFICATIONS</span>
                <span className="text-xs text-gray-400 font-semibold font-mono">CineVerse Live</span>
              </div>
              <div className="divide-y divide-gray-900">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 hover:bg-gray-900/30 transition-all text-xs">
                    <div className="flex gap-2 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                      <p className="text-gray-300 leading-relaxed">{n.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Hook */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 cursor-pointer group"
          id="nav-profile-btn"
        >
          {user ? (
            <>
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-gray-800 object-cover group-hover:border-red-500 transition-colors"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-semibold text-gray-300 group-hover:text-white hidden sm:inline mr-1 max-w-[80px] truncate">{user.name}</span>
            </>
          ) : (
            <div className="p-2 rounded-full hover:bg-gray-900 text-gray-400 hover:text-white transition-colors">
              <User className="w-5 h-5" />
            </div>
          )}
        </button>
      </div>
    </nav>
  );
}
