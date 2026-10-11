import {
  Activity,
  Calendar,
  Compass,
  LogOut,
  RefreshCw,
  TrendingUp,
  User,
} from 'lucide-react';
import React from 'react';
import { useApp } from '../context/AppContext';

export type NavTab = 'dashboard' | 'fitness' | 'activities' | 'plan' | 'profile';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const {
    athlete,
    credentials,
    isRefreshing,
    refreshData,
    useImperial,
    toggleUnits,
    logout,
  } = useApp();

  const isDemo = credentials?.isDemo;
  const displayName = athlete?.firstname || athlete?.name || 'Athlete';

  return (
    <header className="sticky top-0 z-30 bg-[#0B0E14]/90 backdrop-blur-md border-b border-[#232D42]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#00E5A3]/10 border border-[#00E5A3]/30 flex items-center justify-center text-[#00E5A3]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white block leading-none">
                INTERVALS PULSE
              </span>
              <span className="text-[10px] font-semibold text-slate-400 leading-none">
                Performance Dashboard
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#111622] p-1 rounded-xl border border-[#232D42]">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-[#1A2234] text-[#00E5A3] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Today</span>
            </button>

            <button
              onClick={() => onSelectTab('fitness')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'fitness'
                  ? 'bg-[#1A2234] text-[#00E5A3] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Fitness & Form</span>
            </button>

            <button
              onClick={() => onSelectTab('activities')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'activities'
                  ? 'bg-[#1A2234] text-[#00E5A3] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Activities</span>
            </button>

            <button
              onClick={() => onSelectTab('plan')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'plan'
                  ? 'bg-[#1A2234] text-[#00E5A3] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Plan</span>
            </button>

            <button
              onClick={() => onSelectTab('profile')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'profile'
                  ? 'bg-[#1A2234] text-[#00E5A3] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2.5">
            {/* Status Pill */}
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                isDemo
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-[#00E5A3]/10 text-[#00E5A3] border border-[#00E5A3]/20'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isDemo ? 'bg-amber-400' : 'bg-[#00E5A3] animate-pulse'}`}
              />
              {isDemo ? 'Demo Mode' : 'Live API'}
            </span>

            {/* Units Toggle */}
            <button
              onClick={toggleUnits}
              title="Toggle Units (Metric / Imperial)"
              className="bg-[#111622] hover:bg-[#1A2234] border border-[#232D42] text-xs font-bold px-2.5 py-1.5 rounded-xl text-slate-300 transition-colors"
            >
              {useImperial ? 'MI / LBS' : 'KM / KG'}
            </button>

            {/* Sync Button */}
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              title="Sync Data from Intervals.icu"
              className="w-9 h-9 rounded-xl bg-[#111622] hover:bg-[#1A2234] border border-[#232D42] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#00E5A3]' : ''}`} />
            </button>

            {/* Athlete Avatar & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              {athlete?.profile_medium ? (
                <img
                  src={athlete.profile_medium}
                  alt={displayName}
                  className="w-8 h-8 rounded-full border border-[#00E5A3] object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1A2234] border border-[#232D42] flex items-center justify-center text-[#00E5A3] font-bold text-xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <button
                onClick={logout}
                title="Disconnect"
                className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-white/5 text-xs overflow-x-auto">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1 font-bold rounded-lg ${currentTab === 'dashboard' ? 'text-[#00E5A3] bg-white/5' : 'text-slate-400'}`}
          >
            Today
          </button>
          <button
            onClick={() => onSelectTab('fitness')}
            className={`px-3 py-1 font-bold rounded-lg ${currentTab === 'fitness' ? 'text-[#00E5A3] bg-white/5' : 'text-slate-400'}`}
          >
            Fitness
          </button>
          <button
            onClick={() => onSelectTab('activities')}
            className={`px-3 py-1 font-bold rounded-lg ${currentTab === 'activities' ? 'text-[#00E5A3] bg-white/5' : 'text-slate-400'}`}
          >
            Activities
          </button>
          <button
            onClick={() => onSelectTab('plan')}
            className={`px-3 py-1 font-bold rounded-lg ${currentTab === 'plan' ? 'text-[#00E5A3] bg-white/5' : 'text-slate-400'}`}
          >
            Plan
          </button>
          <button
            onClick={() => onSelectTab('profile')}
            className={`px-3 py-1 font-bold rounded-lg ${currentTab === 'profile' ? 'text-[#00E5A3] bg-white/5' : 'text-slate-400'}`}
          >
            Profile
          </button>
        </div>
      </div>
    </header>
  );
};
