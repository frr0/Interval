import {
  Activity as PulseIcon,
  Calendar,
  ChevronRight,
  Heart,
  Moon,
  TrendingUp,
} from 'lucide-react';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Activity } from '../../types/intervals';
import { formatDuration, getFormStatus } from '../../utils/formatters';
import { ActivityCard } from '../ActivityCard';
import { MetricCard } from '../MetricCard';
import { RecoveryRing } from '../RecoveryRing';
import { WeeklyLoadBar } from '../WeeklyLoadBar';

interface DashboardViewProps {
  onSelectActivity: (activity: Activity) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectActivity,
  onNavigateTab,
}) => {
  const {
    athlete,
    latestWellness,
    activities,
    events,
    recoveryScore,
    useImperial,
  } = useApp();

  const ctl = latestWellness?.ctl ?? 78;
  const atl = latestWellness?.atl ?? 82;
  const tsb = latestWellness?.tsb ?? (ctl - atl);
  const formStatus = getFormStatus(tsb);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivity = activities.find((a) =>
    a.start_date_local && a.start_date_local.startsWith(todayStr)
  );
  const mostRecentActivity = activities[0];

  const todayEvent = events.find((e) =>
    e.start_date_local && e.start_date_local.startsWith(todayStr)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Grid: Recovery Ring + Fitness Triplet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Recovery Hero Card (5 cols on lg) */}
        <div className="lg:col-span-5 bg-[#111622] rounded-3xl p-6 sm:p-7 border border-[#232D42] shadow-xl flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
              Daily Recovery & Readiness
            </span>
            <button
              onClick={() => onNavigateTab('fitness')}
              className="text-xs font-bold text-[#00E5A3] hover:underline flex items-center gap-1"
            >
              <span>Trends</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <RecoveryRing
            score={recoveryScore}
            size={210}
            strokeWidth={15}
            restingHR={latestWellness?.restingHR}
            hrv={latestWellness?.hrv}
          />

          <p className="text-xs text-slate-400 text-center mt-4 max-w-xs leading-relaxed">
            {recoveryScore >= 67
              ? 'Your central nervous system is primed for high-strain training and intensity.'
              : recoveryScore >= 34
              ? 'Moderate readiness. Stick to aerobic baseline workouts or sweetspot.'
              : 'Elevated physiological fatigue. Prioritize sleep, nutrition, and active recovery.'}
          </p>
        </div>

        {/* Fitness Triplet & Training Load (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          {/* Triplet Cards Row */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-[#111622] p-4 sm:p-5 rounded-2xl border border-[#38BDF8]/20 text-center shadow-lg">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Fitness
              </span>
              <span className="text-3xl sm:text-4xl font-black text-[#38BDF8] block tracking-tight">
                {Math.round(ctl)}
              </span>
              <span className="text-[11px] font-bold text-slate-400 mt-1 block">CTL (42d)</span>
            </div>

            <div className="bg-[#111622] p-4 sm:p-5 rounded-2xl border border-[#A855F7]/20 text-center shadow-lg">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Fatigue
              </span>
              <span className="text-3xl sm:text-4xl font-black text-[#A855F7] block tracking-tight">
                {Math.round(atl)}
              </span>
              <span className="text-[11px] font-bold text-slate-400 mt-1 block">ATL (7d)</span>
            </div>

            <div
              className="bg-[#111622] p-4 sm:p-5 rounded-2xl border text-center shadow-lg"
              style={{ borderColor: `${formStatus.color}30` }}
            >
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Form
              </span>
              <span className="text-3xl sm:text-4xl font-black block tracking-tight" style={{ color: formStatus.color }}>
                {tsb > 0 ? `+${Math.round(tsb)}` : Math.round(tsb)}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold truncate mt-1 block" style={{ color: formStatus.color }}>
                {formStatus.label}
              </span>
            </div>
          </div>

          {/* 7-Day Training Load Bar */}
          <WeeklyLoadBar activities={activities} />
        </div>
      </div>

      {/* Today's Planned Session (if any) */}
      {todayEvent && !todayActivity && (
        <div className="bg-[#111622] border border-[#00B4D8]/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00B4D8]" />
              <span className="text-xs font-black uppercase tracking-wider text-[#00B4D8]">
                Today's Planned Workout
              </span>
            </div>
            {todayEvent.load && (
              <span className="text-xs font-black text-[#FC5200]">
                Planned Load ~{todayEvent.load}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-white">{todayEvent.name}</h3>
          {todayEvent.description && (
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {todayEvent.description}
            </p>
          )}
          {todayEvent.moving_time && (
            <span className="text-xs text-slate-400 font-medium block mt-2">
              Target duration: {formatDuration(todayEvent.moving_time)}
            </span>
          )}
        </div>
      )}

      {/* Latest Activity Feed Banner */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            {todayActivity ? "Today's Activity" : 'Latest Workout'}
          </span>
          <button
            onClick={() => onNavigateTab('activities')}
            className="text-xs font-bold text-[#00E5A3] hover:underline"
          >
            View All ({activities.length})
          </button>
        </div>

        {todayActivity ? (
          <ActivityCard
            activity={todayActivity}
            useImperial={useImperial}
            onSelect={onSelectActivity}
          />
        ) : mostRecentActivity ? (
          <ActivityCard
            activity={mostRecentActivity}
            useImperial={useImperial}
            onSelect={onSelectActivity}
          />
        ) : (
          <div className="bg-[#111622] rounded-2xl p-8 border border-[#232D42] text-center text-slate-400 text-sm">
            No workouts logged yet.
          </div>
        )}
      </div>

      {/* Daily Wellness Biometrics Grid */}
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
          Daily Wellness & Biometrics
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            label="Sleep"
            value={
              latestWellness?.sleepSecs
                ? formatDuration(latestWellness.sleepSecs)
                : '7h 45m'
            }
            subValue={
              latestWellness?.sleepScore
                ? `${latestWellness.sleepScore}% Sleep Score`
                : 'Good Quality'
            }
            icon={<Moon className="w-4 h-4" />}
            accentColor="#818CF8"
          />

          <MetricCard
            label="HRV (rMSSD)"
            value={latestWellness?.hrv ? `${latestWellness.hrv}` : '64'}
            unit="ms"
            subValue="Within baseline"
            icon={<Heart className="w-4 h-4" />}
            accentColor="#00E5A3"
          />

          <MetricCard
            label="Resting HR"
            value={latestWellness?.restingHR || athlete?.restingHR || 46}
            unit="bpm"
            subValue="Low & recovered"
            icon={<PulseIcon className="w-4 h-4" />}
            accentColor="#00B4D8"
          />

          <MetricCard
            label="Ramp Rate"
            value={
              latestWellness?.rampRate !== undefined
                ? `${latestWellness.rampRate > 0 ? '+' : ''}${latestWellness.rampRate}`
                : '+3.2'
            }
            unit="/wk"
            subValue="Safe building"
            icon={<TrendingUp className="w-4 h-4" />}
            accentColor="#F59E0B"
          />
        </div>
      </div>
    </div>
  );
};
