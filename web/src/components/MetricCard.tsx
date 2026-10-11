import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  icon: React.ReactNode;
  accentColor?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subValue,
  icon,
  accentColor = '#00E5A3',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#111622] rounded-2xl p-4 sm:p-5 border border-[#232D42] shadow-lg flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-[#334155] hover:bg-[#151C2C]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {value}
        </span>
        {unit && <span className="text-xs font-semibold text-slate-400">{unit}</span>}
      </div>

      {subValue && (
        <span className="text-xs font-semibold mt-1" style={{ color: accentColor }}>
          {subValue}
        </span>
      )}
    </div>
  );
};
