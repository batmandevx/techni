'use client';

import { motion } from 'framer-motion';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts';

interface DataPoint { name: string; [key: string]: any; }

interface BarChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  color?: string;
  colors?: string[];
  height?: number;
  horizontal?: boolean;
  showValues?: boolean;
  showReferenceLine?: boolean;
  referenceValue?: number;
  animated?: boolean;
}

const defaultColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-white font-medium mb-1.5 text-sm">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color || e.fill }} />
          <span className="text-slate-400 capitalize">{e.name}:</span>
          <span className="text-white font-semibold">{e.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export default function BarChart({
  data,
  title,
  subtitle,
  color = '#6366f1',
  colors = defaultColors,
  height = 300,
  horizontal = false,
  showValues = false,
  showReferenceLine = false,
  referenceValue,
  animated = true,
}: BarChartProps) {
  const keys = Object.keys(data[0] || {}).filter(k => k !== 'name');
  const singleKey = keys.length === 1 ? keys[0] : 'value';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 10, right: 10, left: horizontal ? 60 : 0, bottom: 0 }}
          barCategoryGap="30%"
        >
          <defs>
            {keys.map((k, i) => (
              <linearGradient key={k} id={`bg-${k}`} x1="0" y1="0" x2={horizontal ? '1' : '0'} y2={horizontal ? '0' : '1'}>
                <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={1} />
                <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0.5} />
              </linearGradient>
            ))}
            <linearGradient id="bg-single" x1="0" y1="0" x2={horizontal ? '1' : '0'} y2={horizontal ? '0' : '1'}>
              <stop offset="0%" stopColor={colors[0]} stopOpacity={1} />
              <stop offset="100%" stopColor={colors[0]} stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={!horizontal} vertical={horizontal} />
          <XAxis
            type={horizontal ? 'number' : 'category'}
            dataKey={horizontal ? undefined : 'name'}
            stroke="rgba(148,163,184,0.3)"
            tick={{ fill: 'rgba(148,163,184,0.7)', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickLine={false}
            tickFormatter={horizontal ? (v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v : undefined}
          />
          <YAxis
            type={horizontal ? 'category' : 'number'}
            dataKey={horizontal ? 'name' : undefined}
            stroke="rgba(148,163,184,0.3)"
            tick={{ fill: 'rgba(148,163,184,0.7)', fontSize: horizontal ? 10 : 11 }}
            axisLine={false}
            tickLine={false}
            width={horizontal ? 80 : 40}
            tickFormatter={!horizontal ? (v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v : undefined}
          />
          {showReferenceLine && referenceValue !== undefined && (
            <ReferenceLine
              y={referenceValue}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{ value: 'Target', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
            />
          )}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          {keys.length > 1 && (
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: '12px' }}
              formatter={(val) => <span style={{ color: 'rgba(148,163,184,0.8)', fontSize: '12px', textTransform: 'capitalize' }}>{val}</span>}
            />
          )}
          {keys.length > 1 ? (
            keys.map((k, i) => (
              <Bar
                key={k}
                dataKey={k}
                fill={`url(#bg-${k})`}
                radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                animationDuration={animated ? 1400 : 0}
                animationEasing="ease-out"
                isAnimationActive={animated}
                maxBarSize={40}
              />
            ))
          ) : (
            <Bar
              dataKey={singleKey}
              radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              animationDuration={animated ? 1400 : 0}
              animationEasing="ease-out"
              isAnimationActive={animated}
              maxBarSize={40}
            >
              {data.map((_, idx) => (
                <Cell
                  key={idx}
                  fill={`url(#bg-single)`}
                  style={{ filter: `drop-shadow(0 0 6px ${colors[idx % colors.length]}40)` }}
                />
              ))}
            </Bar>
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
