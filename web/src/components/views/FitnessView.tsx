import {
  Activity,
  Flame,
  Info,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateShort, formatDuration, getFormStatus } from '../../utils/formatters';
import { FitnessChart } from '../FitnessChart';
import { MetricCard } from '../MetricCard';

export const FitnessView: React.FC = () => {
  const { wellness, athlete } = useApp();

  const sortedWellness = useMemo(() => {
    return [...wellness].sort(
      (a, b) => new Date(b.id).getTime() - new Date(a.id).getTime()
    );
  }, [wellness]);

  const latest = sortedWellness[0];
  const ctl = latest?.ctl ?? 78;
  const atl = latest?.atl ?? 82;
  const tsb = latest?.tsb ?? (ctl - atl);
  const formStatus = getFormStatus(tsb);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Interactive Chart */}
      <FitnessChart data={wellness} />

      {/* Fitness Modeling Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Fitness (CTL)"
          value={ctl.toFixed(1)}
          subValue="42-day rolling base"
          icon={<TrendingUp className="w-4 h-4" />}
          accentColor="#38BDF8"
        />

        <MetricCard
          label="Fatigue (ATL)"
          value={atl.toFixed(1)}
          subValue="7-day acute stress"
          icon={<Flame className="w-4 h-4" />}
          accentColor="#A855F7"
        />

        <MetricCard
          label="Form (TSB)"
          value={tsb > 0 ? `+${tsb.toFixed(1)}` : tsb.toFixed(1)}
          subValue={formStatus.label}
          icon={<Zap className="w-4 h-4" />}
          accentColor={formStatus.color}
        />

        <MetricCard
          label="eFTP"
          value={athlete?.ftp ? `${athlete.ftp} W` : '295 W'}
          subValue="Estimated Threshold"
          icon={<Activity className="w-4 h-4" />}
          accentColor="#FC5200"
        />
      </div>

      {/* Form Zones Guide Card */}
      <div className="bg-[#111622] border border-[#232D42] rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-[#00B4D8]" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
            Form Zones Reference (TSB = CTL − ATL)
          </h4>
        </div>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Form measures the balance between chronic fitness and acute fatigue. It guides training volume and peaking for races:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#151C2C] p-3.5 rounded-xl border border-[#00E5A3]/20">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-[#00E5A3] text-black mb-1.5">
              +5 to +25 TSB
            </span>
            <strong className="text-white block font-bold">Fresh & Race Ready</strong>
            <span className="text-slate-400 text-[11px] block mt-1">
              Supercompensation peak. Ideal for target events and races.
            </span>
          </div>

          <div className="bg-[#151C2C] p-3.5 rounded-xl border border-[#38BDF8]/20">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-[#38BDF8] text-black mb-1.5">
              -10 to -30 TSB
            </span>
            <strong className="text-white block font-bold">Optimal Training</strong>
            <span className="text-slate-400 text-[11px] block mt-1">
              Productive training stimulus building durable fitness base.
            </span>
          </div>

          <div className="bg-[#151C2C] p-3.5 rounded-xl border border-[#F59E0B]/20">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-[#F59E0B] text-black mb-1.5">
              -30 to -40 TSB
            </span>
            <strong className="text-white block font-bold">High Fatigue</strong>
            <span className="text-slate-400 text-[11px] block mt-1">
              Heavy stress on capacity. Plan recovery days and nutrition.
            </span>
          </div>

          <div className="bg-[#151C2C] p-3.5 rounded-xl border border-[#EF4444]/20">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-[#EF4444] text-white mb-1.5">
              &lt; -40 TSB
            </span>
            <strong className="text-white block font-bold">Overreaching Risk</strong>
            <span className="text-slate-400 text-[11px] block mt-1">
              Danger of illness or burnout. Rest days strongly advised.
            </span>
          </div>
        </div>
      </div>

      {/* Wellness History Table */}
      <div className="bg-[#111622] border border-[#232D42] rounded-2xl p-5 shadow-lg">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3">
          Daily Wellness & Fitness Log History ({sortedWellness.length} records)
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400 uppercase text-[10px] font-bold border-b border-white/5">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Fitness (CTL)</th>
                <th className="py-2.5 px-3">Fatigue (ATL)</th>
                <th className="py-2.5 px-3">Form (TSB)</th>
                <th className="py-2.5 px-3">HRV</th>
                <th className="py-2.5 px-3">Sleep</th>
                <th className="py-2.5 px-3">Rest HR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedWellness.slice(0, 15).map((w) => {
                const itemTsb = w.tsb ?? (w.ctl && w.atl ? w.ctl - w.atl : 0);
                const st = getFormStatus(itemTsb);
                return (
                  <tr key={w.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">{formatDateShort(w.id)}</td>
                    <td className="py-2.5 px-3 text-[#38BDF8] font-bold">{w.ctl ?? '--'}</td>
                    <td className="py-2.5 px-3 text-[#A855F7] font-bold">{w.atl ?? '--'}</td>
                    <td className="py-2.5 px-3 font-bold" style={{ color: st.color }}>
                      {itemTsb > 0 ? `+${Math.round(itemTsb)}` : Math.round(itemTsb)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{w.hrv ? `${w.hrv} ms` : '--'}</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {w.sleepSecs ? formatDuration(w.sleepSecs) : '--'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {w.restingHR ? `${w.restingHR} bpm` : '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
