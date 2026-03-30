'use client';

import { useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area
} from 'recharts';
import { motion } from 'framer-motion';

interface ComposedChartProps {
  data: Array<{
    name: string;
    bar: number;
    line: number;
    area?: number;
  }>;
  height?: number;
  colors?: {
    bar?: string;
    line?: string;
    area?: string;
  };
  showArea?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/95 border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-xl"
      >
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-300 text-sm">{entry.name}</span>
            </div>
            <span className="text-white font-semibold">
              {entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

export default function ComposedChartComponent({
  data,
  height = 300,
  colors = { bar: '#6366f1', line: '#10b981', area: '#f59e0b' },
  showArea = false
}: ComposedChartProps) {
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="composedBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.bar} stopOpacity={0.8}/>
              <stop offset="100%" stopColor={colors.bar} stopOpacity={0.3}/>
            </linearGradient>
            {showArea && (
              <linearGradient id="composedAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.area} stopOpacity={0.4}/>
                <stop offset="100%" stopColor={colors.area} stopOpacity={0}/>
              </linearGradient>
            )}
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255,255,255,0.05)" 
            vertical={false}
          />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
          />
          <Bar
            yAxisId="left"
            dataKey="bar"
            name="Revenue"
            fill="url(#composedBarGradient)"
            radius={[6, 6, 0, 0]}
            onMouseEnter={() => setHoveredSeries('bar')}
            onMouseLeave={() => setHoveredSeries(null)}
            opacity={hoveredSeries && hoveredSeries !== 'bar' ? 0.5 : 1}
          />
          {showArea && (
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="area"
              name="Target"
              stroke={colors.area}
              strokeWidth={2}
              fill="url(#composedAreaGradient)"
              onMouseEnter={() => setHoveredSeries('area')}
              onMouseLeave={() => setHoveredSeries(null)}
              opacity={hoveredSeries && hoveredSeries !== 'area' ? 0.3 : 1}
            />
          )}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="line"
            name="Growth"
            stroke={colors.line}
            strokeWidth={3}
            dot={{ fill: colors.line, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            onMouseEnter={() => setHoveredSeries('line')}
            onMouseLeave={() => setHoveredSeries(null)}
            opacity={hoveredSeries && hoveredSeries !== 'line' ? 0.5 : 1}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
