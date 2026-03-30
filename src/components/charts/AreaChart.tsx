'use client';

import { motion } from 'framer-motion';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';

interface DataPoint { name: string; [key: string]: any; }

interface AreaChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  colors?: string[];
  showLegend?: boolean;
  height?: number;
  gradient?: boolean;
  showReferenceLine?: boolean;
  referenceValue?: number;
  animated?: boolean;
  stacked?: boolean;
}

const defaultColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl min-w-[140px]">
      <p className="text-slate-400 font-medium mb-2 text-xs uppercase tracking-wider">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
          <span className="text-slate-400 capitalize">{e.name}:</span>
          <span className="text-white font-bold ml-auto pl-2">
            {typeof e.value === 'number' && e.value >= 1000
              ? e.value >= 1000000 ? `${(e.value / 1000000).toFixed(1)}M` : `${(e.value / 1000).toFixed(1)}k`
              : e.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AreaChart({
  data,
  title,
  subtitle,
  colors = defaultColors,
  showLegend = true,
  height = 300,
  gradient = true,
  showReferenceLine = false,
  referenceValue,
  animated = true,
  stacked = false,
}: AreaChartProps) {
  const keys = Object.keys(data[0] || {}).filter(k => k !== 'name');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {keys.map((k, i) => (
              <linearGradient key={k} id={`ag-${k}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.5} />
                <stop offset="60%" stopColor={colors[i % colors.length]} stopOpacity={0.15} />
                <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="rgba(148,163,184,0.3)"
            tick={{ fill: 'rgba(148,163,184,0.7)', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickLine={false}
          />
          <YAxis
            stroke="rgba(148,163,184,0.3)"
            tick={{ fill: 'rgba(148,163,184,0.7)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
            width={45}
          />
          {showReferenceLine && referenceValue !== undefined && (
            <ReferenceLine
              y={referenceValue}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{ value: 'Target', fill: '#f59e0b', fontSize: 10, position: 'right' }}
            />
          )}
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1, strokeDasharray: '4 4' }} />
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: '16px' }}
              iconType="circle"
              iconSize={8}
              formatter={(val) => <span style={{ color: 'rgba(148,163,184,0.8)', fontSize: '12px', textTransform: 'capitalize' }}>{val}</span>}
            />
          )}
          {keys.map((k, i) => (
            <Area
              key={k}
              type="monotone"
              dataKey={k}
              stroke={colors[i % colors.length]}
              strokeWidth={2.5}
              fill={gradient ? `url(#ag-${k})` : 'transparent'}
              dot={false}
              activeDot={{ r: 5, fill: colors[i % colors.length], stroke: 'rgba(255,255,255,0.3)', strokeWidth: 2 }}
              animationDuration={animated ? 1600 : 0}
              animationEasing="ease-out"
              isAnimationActive={animated}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
