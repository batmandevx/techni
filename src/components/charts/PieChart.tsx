'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
  Legend,
} from 'recharts';

interface DataPoint { name: string; value: number; [key: string]: any; }

interface PieChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  colors?: string[];
  height?: number;
  donut?: boolean;
  showLabels?: boolean;
  // Legacy props for backward compatibility
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  animated?: boolean;
  centerText?: string;
  centerSubtext?: string;
}

const defaultColors = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0 0 10px ${fill}80)` }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 14}
        outerRadius={outerRadius + 18}
        fill={fill}
        opacity={0.4}
      />
    </g>
  );
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  const total = d.payload?.total || 1;
  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.payload?.fill || d.color }} />
        <p className="text-white font-medium text-sm">{d.name}</p>
      </div>
      <p className="text-2xl font-bold text-white">{d.value?.toLocaleString()}</p>
      <p className="text-xs text-slate-400">{((d.value / total) * 100).toFixed(1)}% of total</p>
    </div>
  );
}

export default function PieChartComponent({
  data,
  title,
  subtitle,
  colors = defaultColors,
  height = 300,
  donut = true,
  showLabels = true,
  showLegend,
  innerRadius = 55,
  outerRadius = 80,
  animated = true,
  centerText,
  centerSubtext,
}: PieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);

  // When centerText/centerSubtext are provided use legacy center display
  const useLegacyCenter = !!(centerText || centerSubtext);
  // When showLegend is explicitly provided, respect it; otherwise use showLabels
  const useLegend = showLegend !== undefined ? showLegend : false;

  // Inject total into each entry so tooltip can compute %
  const dataWithTotal = data.map(d => ({ ...d, total }));

  // Determine radii: if legacy props differ from defaults, respect them
  const effectiveInnerRadius = donut ? innerRadius : 0;
  const effectiveOuterRadius = outerRadius;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}
      <div className={`flex ${showLabels && !useLegacyCenter ? 'flex-col lg:flex-row' : 'flex-col'} items-center gap-4`}>
        <div
          className="relative flex-shrink-0"
          style={{ width: '100%', maxWidth: showLabels && !useLegacyCenter ? '220px' : '100%', height }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <defs>
                {data.map((_, i) => (
                  <filter key={i} id={`pie-glow-${i}`}>
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
              </defs>
              <Pie
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={renderActiveShape}
                data={dataWithTotal}
                cx="50%"
                cy={useLegacyCenter ? '45%' : '50%'}
                innerRadius={effectiveInnerRadius}
                outerRadius={effectiveOuterRadius}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                animationDuration={animated ? 1200 : 0}
                animationEasing="ease-out"
                isAnimationActive={animated}
                paddingAngle={donut ? 3 : 1}
                stroke="transparent"
              >
                {dataWithTotal.map((entry, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {useLegend && (
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ color: 'rgba(148,163,184,0.8)', fontSize: '12px' }}>{value}</span>}
                />
              )}
            </RechartsPieChart>
          </ResponsiveContainer>

          {/* Legacy center text (centerText / centerSubtext props) */}
          {useLegacyCenter && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                {centerText && (
                  <motion.p
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-2xl font-bold text-white"
                  >
                    {centerText}
                  </motion.p>
                )}
                {centerSubtext && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-xs text-slate-400"
                  >
                    {centerSubtext}
                  </motion.p>
                )}
              </div>
            </div>
          )}

          {/* Donut center total (when no legacy centerText) */}
          {donut && !useLegacyCenter && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xl font-bold text-white">{total.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-0.5">Total</p>
              </div>
            </div>
          )}
        </div>

        {/* Inline legend labels (shown when showLabels is true and no legacy mode) */}
        {showLabels && !useLegacyCenter && (
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            {data.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all duration-200 ${activeIndex === i ? 'bg-white/10' : 'hover:bg-white/5'}`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors[i % colors.length], boxShadow: `0 0 6px ${colors[i % colors.length]}80` }}
                />
                <p className="text-sm text-white flex-1 truncate">{item.name}</p>
                <p className="text-xs font-semibold text-slate-400 flex-shrink-0">{total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'}%</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
