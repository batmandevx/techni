'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis,
  Treemap,
  RadialBarChart,
  RadialBar,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl p-3 shadow-2xl">
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300 text-sm">{entry.name}:</span>
            <span className="text-white font-semibold">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// 1. Multi-Axis Line Chart
export function MultiAxisChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
          <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
          <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2} name="Orders" />
          <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue ($)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 2. Stacked Bar Chart
export function StackedBarChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="electronics" stackId="a" fill="#6366f1" name="Electronics" />
          <Bar dataKey="clothing" stackId="a" fill="#10b981" name="Clothing" />
          <Bar dataKey="home" stackId="a" fill="#f59e0b" name="Home" />
          <Bar dataKey="sports" stackId="a" fill="#ef4444" name="Sports" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 3. Scatter Plot with Trend
export function ScatterTrendChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" dataKey="inventory" name="Inventory Days" stroke="#64748b" />
          <YAxis type="number" dataKey="sales" name="Sales Volume" stroke="#64748b" />
          <ZAxis type="number" dataKey="profit" range={[50, 400]} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Products" data={data} fill="#6366f1" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// 4. Donut Chart with Center Text
export function DonutChart({ data }: { data: any[] }) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  
  return (
    <div className="h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl font-bold text-white">{total}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
      </div>
    </div>
  );
}

// 5. Horizontal Bar Chart
export function HorizontalBarChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="#64748b" fontSize={12} />
          <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={100} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 6. Area Range Chart
export function AreaRangeChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="stock" stroke="#6366f1" fill="url(#splitColor)" name="Stock Level" />
          <Area type="monotone" dataKey="threshold" stroke="#f59e0b" fill="none" strokeDasharray="5 5" name="Threshold" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// 7. Treemap Chart
export function TreemapChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#0f172a"
          fill="#6366f1"
        />
      </ResponsiveContainer>
    </div>
  );
}

// 8. Gauge/Radial Chart
export function GaugeChart({ value, max = 100, label }: { value: number; max?: number; label: string }) {
  const data = [{ name: 'A', value: value, fill: value > 80 ? '#10b981' : value > 50 ? '#f59e0b' : '#ef4444' }];
  
  return (
    <div className="h-[250px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="70%"
          innerRadius="60%"
          outerRadius="100%"
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar background dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-12">
        <p className="text-4xl font-bold text-white">{value}%</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// 9. Waterfall Chart
export function WaterfallChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="positive" stackId="a" fill="#10b981" name="Increase" />
          <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Decrease" />
          <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Cumulative" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// 10. Funnel Chart
export function FunnelChartComponent({ data }: { data: any[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip content={<CustomTooltip />} />
          <Funnel
            dataKey="value"
            data={data}
            isAnimationActive
          >
            {data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
}

// 11. SPIDER WEB CHART - Enhanced Radar with multiple layers
export function SpiderWebChart({ data }: { data: any[] }) {
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={11} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={10} />
          <Radar
            name="Current"
            dataKey="A"
            stroke="#6366f1"
            strokeWidth={2}
            fill="#6366f1"
            fillOpacity={0.3}
          />
          <Radar
            name="Target"
            dataKey="B"
            stroke="#10b981"
            strokeWidth={2}
            fill="#10b981"
            fillOpacity={0.2}
          />
          <Radar
            name="Previous"
            dataKey="C"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="#f59e0b"
            fillOpacity={0.1}
          />
          <Legend />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 12. HONEYCOMB CHART - Hexagonal grid visualization
export function HoneycombChart({ data }: { data: any[] }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="h-[350px] flex items-center justify-center">
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <defs>
          {data.map((item, index) => {
            const intensity = item.value / maxValue;
            return (
              <linearGradient key={index} id={`hexGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={item.color} stopOpacity={0.3 + intensity * 0.7} />
                <stop offset="100%" stopColor={item.color} stopOpacity={0.1 + intensity * 0.5} />
              </linearGradient>
            );
          })}
        </defs>
        {data.map((item, index) => {
          const row = Math.floor(index / 4);
          const col = index % 4;
          const x = 50 + col * 90 + (row % 2) * 45;
          const y = 50 + row * 78;
          const size = 30 + (item.value / maxValue) * 25;
          const intensity = item.value / maxValue;
          
          const hexPoints = [];
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            hexPoints.push(`${x + size * Math.cos(angle)},${y + size * Math.sin(angle)}`);
          }
          
          return (
            <motion.g
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <polygon
                points={hexPoints.join(' ')}
                fill={`url(#hexGradient-${index})`}
                stroke={item.color}
                strokeWidth={2}
                className="cursor-pointer hover:stroke-white transition-all"
              />
              <text x={x} y={y - 5} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                {item.value}%
              </text>
              <text x={x} y={y + 10} textAnchor="middle" fill="#94a3b8" fontSize="8">
                {item.name}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

// 13. PIE CHART - 3D-style with exploded segments
export function PieChart3D({ data }: { data: any[] }) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  
  return (
    <div className="h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            outerRadius={100}
            innerRadius={0}
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={(_, index) => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke={hoveredIndex === index ? '#fff' : 'transparent'}
                strokeWidth={hoveredIndex === index ? 3 : 0}
                style={{
                  filter: hoveredIndex === index ? 'brightness(1.2)' : 'brightness(1)',
                  transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: 'center',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// 14. NIGHTINGALE ROSE CHART
export function NightingaleRoseChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="80%"
            label={(entry) => entry.name}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// 15. BUBBLE CHART - Advanced with categories
export function BubbleChart({ data }: { data: any[] }) {
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Growth Rate" 
            stroke="#64748b" 
            unit="%"
            domain={[-20, 40]}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Market Share" 
            stroke="#64748b" 
            unit="%"
            domain={[0, 30]}
          />
          <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Revenue" />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl p-3 shadow-2xl">
                    <p className="text-white font-semibold mb-1">{data.name}</p>
                    <p className="text-gray-400 text-sm">Growth: {data.x}%</p>
                    <p className="text-gray-400 text-sm">Share: {data.y}%</p>
                    <p className="text-gray-400 text-sm">Revenue: ${data.z}K</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          {['Stars', 'Cash Cows', 'Question Marks', 'Dogs'].map((category, idx) => {
            const colors = ['#6366f1', '#10b981', '#f59e0b', '#64748b'];
            const categoryData = data.filter(d => d.category === category);
            return (
              <Scatter
                key={category}
                name={category}
                data={categoryData}
                fill={colors[idx]}
                fillOpacity={0.7}
              />
            );
          })}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// 16. CANDLESTICK CHART - Stock-style
export function CandlestickChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="range" fill="transparent" stroke="transparent" />
          {data.map((entry, index) => (
            <g key={index}>
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={0}
                stroke={entry.close > entry.open ? '#10b981' : '#ef4444'}
                strokeWidth={2}
              />
            </g>
          ))}
          <Bar dataKey="close" fill="#6366f1" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// 17. WAFFLE/PICTOGRAM CHART
export function WaffleChart({ percentage, label, color = '#6366f1' }: { percentage: number; label: string; color?: string }) {
  const rows = 10;
  const cols = 10;
  const filledCells = Math.round(percentage);
  
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 220" className="w-full max-w-[200px]">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="18" height="18" fill="transparent" />
          </pattern>
        </defs>
        {[...Array(100)].map((_, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          const x = col * 20 + 2;
          const y = row * 20 + 2;
          const isFilled = index < filledCells;
          
          return (
            <motion.rect
              key={index}
              x={x}
              y={y}
              width="16"
              height="16"
              rx="3"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.01, duration: 0.3 }}
              fill={isFilled ? color : 'rgba(255,255,255,0.1)'}
              className={isFilled ? 'hover:brightness-125 transition-all cursor-pointer' : ''}
            />
          );
        })}
        <text x="100" y="215" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
          {percentage}%
        </text>
      </svg>
      <p className="text-gray-400 text-sm mt-2">{label}</p>
    </div>
  );
}

// 18. RADIAL BAR CHART - Multiple rings
export function MultiRadialChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="90%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </RadialBar>
          <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
          <Tooltip content={<CustomTooltip />} />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 19. STEP CHART
export function StepChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="stepColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="stepAfter"
            dataKey="value"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#stepColor)"
          />
          <Line type="stepAfter" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// 20. HEATMAP CALENDAR
export function CalendarHeatmap({ data }: { data: any[] }) {
  const getColor = (value: number) => {
    if (value === 0) return 'rgba(255,255,255,0.05)';
    if (value < 20) return 'rgba(99, 102, 241, 0.2)';
    if (value < 40) return 'rgba(99, 102, 241, 0.4)';
    if (value < 60) return 'rgba(99, 102, 241, 0.6)';
    if (value < 80) return 'rgba(99, 102, 241, 0.8)';
    return 'rgba(99, 102, 241, 1)';
  };

  return (
    <div className="h-[300px] overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={day} className="w-8 text-center text-xs text-gray-500 mb-1">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {data.map((item, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.01 }}
              className="w-8 h-8 rounded-md cursor-pointer relative group"
              style={{ backgroundColor: getColor(item.value) }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                {item.date}: {item.value} orders
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            {[0.1, 0.3, 0.5, 0.7, 0.9, 1].map((opacity, i) => (
              <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: `rgba(99, 102, 241, ${opacity})` }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

// 21. SANKEY-STYLE FLOW CHART
export function FlowChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" hide />
          <YAxis dataKey="stage" type="category" stroke="#64748b" width={100} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList dataKey="value" position="right" fill="#fff" />
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// 22. POLAR AREA CHART
export function PolarAreaChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="name" stroke="#64748b" fontSize={11} />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#64748b" />
          <Radar
            name="Value"
            dataKey="value"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.5}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Chart types reference
export const chartTypes = [
  { id: 'line', name: 'Line Chart', description: 'Trend over time' },
  { id: 'area', name: 'Area Chart', description: 'Volume with fill' },
  { id: 'bar', name: 'Bar Chart', description: 'Category comparison' },
  { id: 'pie', name: 'Pie Chart', description: 'Part-to-whole' },
  { id: 'radar', name: 'Radar/Spider', description: 'Multi-dimensional' },
  { id: 'scatter', name: 'Scatter Plot', description: 'Correlation' },
  { id: 'bubble', name: 'Bubble Chart', description: '3D data points' },
  { id: 'treemap', name: 'Treemap', description: 'Hierarchical data' },
  { id: 'funnel', name: 'Funnel', description: 'Process flow' },
  { id: 'gauge', name: 'Gauge', description: 'Single value' },
  { id: 'honeycomb', name: 'Honeycomb', description: 'Hexagonal grid' },
  { id: 'waffle', name: 'Waffle Chart', description: 'Percentage grid' },
  { id: 'nightingale', name: 'Nightingale Rose', description: 'Polar area' },
  { id: 'calendar', name: 'Calendar Heatmap', description: 'Time-based' },
  { id: 'step', name: 'Step Chart', description: 'Discrete changes' },
];
