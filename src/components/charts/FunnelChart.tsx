'use client';

import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  Tooltip,
  Funnel,
  FunnelChart as RechartsFunnel,
  LabelList,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';

interface FunnelChartProps {
  data: Array<{
    name: string;
    value: number;
    fill?: string;
  }>;
  height?: number;
  colors?: string[];
}

const defaultColors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const index = data?.index ?? 0;
    const prevValue = index > 0 ? data?.prevValue : null;
    const conversionRate = prevValue ? Math.round((data.value / prevValue) * 100) : 100;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/95 border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-xl"
      >
        <p className="text-white font-semibold mb-1">{data.name}</p>
        <p className="text-2xl font-bold" style={{ color: data.fill }}>
          {data.value?.toLocaleString()}
        </p>
        {prevValue && (
          <p className="text-xs text-slate-400 mt-1">
            Conversion: <span className="text-emerald-400 font-medium">{conversionRate}%</span>
          </p>
        )}
      </motion.div>
    );
  }
  return null;
};

export default function FunnelChartComponent({
  data,
  height = 350,
  colors = defaultColors
}: FunnelChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Add index and prevValue for calculations
  const enhancedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item, index) => ({
      ...item,
      index,
      prevValue: index > 0 ? data[index - 1].value : null,
      fill: item.fill || colors[index % colors.length],
      percent: index === 0 ? 100 : Math.round((item.value / data[0].value) * 100)
    }));
  }, [data, colors]);

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
        <RechartsFunnel>
          <Tooltip content={<CustomTooltip />} />
          <Funnel
            dataKey="value"
            data={enhancedData}
            isAnimationActive
            animationDuration={1000}
            animationBegin={0}
          >
            <LabelList
              position="inside"
              fill="#fff"
              stroke="none"
              dataKey="name"
              formatter={(value: string, entry: any) => {
                const percent = entry?.payload?.percent ?? 0;
                return `${value}: ${percent}%`;
              }}
              className="text-xs font-medium"
            />
            {enhancedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                stroke={hoveredIndex === index ? '#fff' : 'none'}
                strokeWidth={2}
                fillOpacity={hoveredIndex === index ? 1 : 0.85}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  filter: hoveredIndex === index ? 'brightness(1.2)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </Funnel>
        </RechartsFunnel>
      </ResponsiveContainer>
    </div>
  );
}
