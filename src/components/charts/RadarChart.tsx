'use client';

import { motion } from 'framer-motion';
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface RadarChartProps {
  data: { subject: string; [key: string]: any }[];
  keys: string[];
  colors?: string[];
  height?: number;
  title?: string;
  subtitle?: string;
}

const defaultColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function RadarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-white font-semibold mb-1.5 text-sm">{payload[0]?.payload?.subject}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="text-white font-semibold">{entry.value?.toFixed(0)}</span>
        </div>
      ))}
    </div>
  );
}

export default function RadarChart({ data, keys, colors = defaultColors, height = 320, title, subtitle }: RadarChartProps) {
  if (!data || data.length === 0 || !keys || keys.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
        No data available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h3 className="text-base font-semibold text-white">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsRadarChart data={data} margin={{ top: 5, right: 30, bottom: 5, left: 30 }}>
          <defs>
            {keys.map((k, i) => (
              <radialGradient key={k} id={`rg-${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.5} />
                <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0.05} />
              </radialGradient>
            ))}
          </defs>
          <PolarGrid stroke="rgba(255,255,255,0.07)" gridType="polygon" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'rgba(148,163,184,0.9)', fontSize: 11, fontWeight: 500 }}
            stroke="rgba(255,255,255,0.08)"
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: 'rgba(148,163,184,0.4)', fontSize: 9 }}
            stroke="transparent"
            tickCount={4}
          />
          {keys.map((k, i) => (
            <Radar
              key={k}
              name={k}
              dataKey={k}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              fill={`url(#rg-${i})`}
              fillOpacity={1}
              dot={{ fill: colors[i % colors.length], r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: colors[i % colors.length], strokeWidth: 0 }}
              animationDuration={1400}
              animationEasing="ease-out"
            />
          ))}
          <Tooltip content={<RadarTooltip />} />
          {keys.length > 1 && (
            <Legend
              iconType="circle"
              iconSize={7}
              wrapperStyle={{ paddingTop: '8px' }}
              formatter={(val) => <span style={{ color: 'rgba(148,163,184,0.8)', fontSize: '11px' }}>{val}</span>}
            />
          )}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
