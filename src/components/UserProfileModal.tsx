/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Mail, Shield, User, LogOut, Check, Award, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onLogin: (email: string, name: string) => void;
  onLogout: () => void;
  onUpdateSubscription: (tier: 'free' | 'premium' | 'ultra_4k') => void;
}

export default function UserProfileModal({
  user,
  onClose,
  onLogin,
  onLogout,
  onUpdateSubscription,
}: UserProfileModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please provide your corporate or personal email');
      return;
    }
    const safeName = name || email.split('@')[0];
    onLogin(email, safeName);
    setErrorMessage('');
  };

  const AVATAR_OPTIONS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
      
      {/* Container Frame */}
      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-[4px] shadow-2xl overflow-hidden">
        
        {/* Modal Top Header Controls */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <span className="text-xs font-sans font-bold text-[#E50914] uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#E50914]" /> SECURITY ACCESS PROFILE
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-[2px] bg-white/5 text-gray-400 hover:text-white cursor-pointer transition-colors border border-white/5"
            id="close-profile-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body content */}
        <div className="p-6 space-y-6">
          {user ? (
            // LOGGED IN VIEW MODULE
            <div className="space-y-6 text-center animate-fade-in">
              
              {/* Profile card metadata info */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full border-2 border-[#E50914] object-cover shadow-xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-[#E50914] rounded-full ring-2 ring-[#121212] shadow">
                    <Sparkles className="w-3.5 h-3.5 text-white fill-current" />
                  </div>
                </div>

                <h3 className="font-sans font-extrabold text-[#E50914] text-lg mt-3 uppercase tracking-tight">{user.name}</h3>
                <p className="text-xs text-gray-400 font-mono">{user.email}</p>

                {/* VIP level badge */}
                <div className="mt-3 inline-flex items-center gap-1 bg-[#E50914]/15 px-4 py-1.5 rounded-[2px] border border-[#E50914]/30 text-xs text-[#E50914] font-bold uppercase tracking-wider font-sans">
                  <Award className="w-4 h-4 text-[#E50914] fill-current" />
                  Subscription: {user.subscriptionStatus === 'ultra_4k' ? '⭐️ Executive Ultra 4K' : 'Premium VIP'}
                </div>
              </div>

              {/* Modify subscription options section */}
              <div className="space-y-3 bg-black/40 p-4 rounded-[4px] border border-white/10 text-left">
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Upgrade Account Tier</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { id: 'premium', label: 'VIP Premium HD', desc: 'Stereo Sound' },
                    { id: 'ultra_4k', label: 'Executive Ultra 4K', desc: 'Atmos 7.1' },
                  ].map(tier => {
                    const isSelected = user.subscriptionStatus === tier.id;
                    return (
                      <button
                        key={tier.id}
                        onClick={() => onUpdateSubscription(tier.id as any)}
                        className={`p-2.5 rounded-[4px] border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#E50914]/10 border-[#E50914] text-[#E50914] font-bold'
                            : 'bg-[#050505] border-white/10 text-gray-300 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs block leading-tight">{tier.label}</span>
                        <span className="text-[9px] text-gray-500 font-bold block mt-0.5 leading-none">{tier.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Joined Date watermark */}
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wide">
                System Key: {user.id} • Registered {new Date(user.joinedDate).toLocaleDateString()}
              </div>

              {/* Logout Action */}
              <button
                onClick={onLogout}
                className="w-full py-2.5 bg-white/5 hover:bg-[#E50914]/10 text-gray-300 hover:text-[#E50914] border border-white/10 hover:border-red-500/25 font-bold rounded-[4px] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider"
                id="profile-logout"
              >
                <LogOut className="w-4 h-4" /> Sign Out From Device
              </button>

            </div>
          ) : (
            // LOGGED OUT AUTH GATE MODULE
            <div className="space-y-4 animate-fade-in">
              <div className="text-center space-y-1">
                <h3 className="font-sans font-extrabold text-lg text-white uppercase tracking-tight">Access CineVerse Library</h3>
                <p className="text-xs text-gray-400">Unlock custom catalogs, track seek points, and stream from legal private hosting modules.</p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-[2px] flex items-start gap-2 text-xs text-red-100">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-gray-400 mb-1 uppercase tracking-wider text-[10px]">CineVerse Email</label>
                  <div className="flex items-center bg-[#050505] border border-white/10 rounded-[4px] px-3 py-2.5 focus-within:border-[#E50914] transition-all">
                    <Mail className="w-4 h-4 text-gray-500 mr-2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. email@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent text-white border-none focus:outline-none w-full text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 uppercase tracking-wider text-[10px]">Your Name</label>
                  <div className="flex items-center bg-[#050505] border border-white/10 rounded-[4px] px-3 py-2.5 focus-within:border-[#E50914] transition-all">
                    <User className="w-4 h-4 text-gray-500 mr-2" />
                    <input
                      type="text"
                      placeholder="e.g. Cinema Enthusiast"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-transparent text-white border-none focus:outline-none w-full text-xs"
                    />
                  </div>
                </div>

                {/* Dummy Login keys alert */}
                <div className="p-3 bg-white/5 border border-white/10 rounded-[2px] text-[10px] text-gray-400 flex items-start gap-1.5 leading-normal">
                  <Lock className="w-3.5 h-3.5 mt-0.5 text-[#E50914] flex-shrink-0" />
                  Active private channel verification. Any email immediately logs into our high-speed stream system!
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#E50914] hover:bg-[#b8070f] text-white font-bold rounded-[4px] transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider shadow-md"
                  id="profile-auth-submit"
                >
                  <Sparkles className="w-4 h-4 fill-current" /> Initialize Session
                </button>
              </form>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
