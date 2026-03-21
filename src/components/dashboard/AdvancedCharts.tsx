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

export const chartTypes = [
  { id: 'line', name: 'Line Chart', description: 'Trend over time' },
  { id: 'area', name: 'Area Chart', description: 'Volume with fill' },
  { id: 'bar', name: 'Bar Chart', description: 'Category comparison' },
  { id: 'pie', name: 'Pie Chart', description: 'Part-to-whole' },
  { id: 'radar', name: 'Radar Chart', description: 'Multi-dimensional' },
  { id: 'scatter', name: 'Scatter Plot', description: 'Correlation' },
  { id: 'composed', name: 'Composed', description: 'Mixed types' },
  { id: 'treemap', name: 'Treemap', description: 'Hierarchical data' },
  { id: 'funnel', name: 'Funnel', description: 'Process flow' },
  { id: 'gauge', name: 'Gauge', description: 'Single value' },
];
