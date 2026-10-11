import {
  Heart,
  LogOut,
  RefreshCw,
  Scale,
  Zap,
} from 'lucide-react';
import React from 'react';
import { useApp } from '../../context/AppContext';

export const ProfileView: React.FC = () => {
  const {
    athlete,
    credentials,
    useImperial,
    toggleUnits,
    refreshData,
    isRefreshing,
    logout,
  } = useApp();

  const isDemo = credentials?.isDemo;
  const displayName = athlete?.name || athlete?.firstname || 'Athlete';

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      {/* Athlete Hero Card */}
      <div className="bg-[#111622] border border-[#232D42] rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex items-center gap-5 mb-6">
          {athlete?.profile_medium ? (
            <img
              src={athlete.profile_medium}
              alt={displayName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#00E5A3]"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#1A2234] border border-[#232D42] flex items-center justify-center text-[#00E5A3] font-black text-2xl">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{displayName}</h2>
            {(athlete?.city || athlete?.country) && (
              <span className="text-xs text-slate-400 block mt-0.5">
                {[athlete.city, athlete.country].filter(Boolean).join(', ')}
              </span>
            )}
            <span className="inline-block mt-2 bg-[#1A2234] px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Athlete ID: {athlete?.id || credentials?.athleteId || '0'}
            </span>
          </div>
        </div>

        {/* Baselines Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#1A2234] rounded-2xl border border-white/5 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              <Zap className="w-3 h-3 text-[#FC5200]" />
              FTP
            </div>
            <span className="text-lg font-black text-white">
              {athlete?.ftp ? `${athlete.ftp} W` : '295 W'}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              <Heart className="w-3 h-3 text-red-400" />
              Rest HR
            </div>
            <span className="text-lg font-black text-white">
              {athlete?.restingHR ? `${athlete.restingHR} bpm` : '46 bpm'}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              <Heart className="w-3 h-3 text-red-500" />
              Max HR
            </div>
            <span className="text-lg font-black text-white">
              {athlete?.maxHR ? `${athlete.maxHR} bpm` : '194 bpm'}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              <Scale className="w-3 h-3 text-[#00B4D8]" />
              Weight
            </div>
            <span className="text-lg font-black text-white">
              {athlete?.weight
                ? useImperial
                  ? `${(athlete.weight * 2.20462).toFixed(1)} lbs`
                  : `${athlete.weight.toFixed(1)} kg`
                : '68.5 kg'}
            </span>
          </div>
        </div>
      </div>

      {/* Preferences & Settings */}
      <div className="bg-[#111622] border border-[#232D42] rounded-3xl p-6 shadow-xl space-y-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Preferences & Units
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div>
            <span className="text-sm font-bold text-white block">Units of Measurement</span>
            <span className="text-xs text-slate-400">
              {useImperial ? 'Imperial (Miles, Feet, Lbs)' : 'Metric (Kilometers, Meters, Kg)'}
            </span>
          </div>
          <button
            onClick={toggleUnits}
            className="px-3.5 py-1.5 rounded-xl bg-[#1A2234] border border-[#232D42] text-xs font-bold text-[#00E5A3] hover:bg-[#25324C] transition-colors"
          >
            Switch to {useImperial ? 'Metric' : 'Imperial'}
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div>
            <span className="text-sm font-bold text-white block">Connection Type</span>
            <span className="text-xs text-slate-400">
              {isDemo ? 'Running in Simulated Demo Mode' : 'Connected directly to Intervals.icu API'}
            </span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
              isDemo ? 'bg-amber-500/10 text-amber-400' : 'bg-[#00E5A3]/10 text-[#00E5A3]'
            }`}
          >
            {isDemo ? 'Demo Mode' : 'Live Sync'}
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm font-bold text-white block">Force Re-sync</span>
            <span className="text-xs text-slate-400">Pull freshest workouts, wellness, and events</span>
          </div>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1A2234] border border-[#232D42] text-xs font-bold text-white hover:bg-[#25324C] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00E5A3]' : ''}`} />
            <span>Sync Now</span>
          </button>
        </div>
      </div>

      {/* Disconnect Account */}
      <div className="text-center pt-2">
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-2xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Disconnect Intervals.icu Account</span>
        </button>
        <span className="text-[11px] text-slate-500 block mt-2">
          Intervals Pulse v1.0.0 Web Edition • Athlete Performance Modeling
        </span>
      </div>
    </div>
  );
};
