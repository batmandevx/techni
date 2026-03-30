'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface HeatmapData {
  x: string;
  y: string;
  value: number;
}

interface HeatmapChartProps {
  data: HeatmapData[];
  height?: number;
  colorRange?: [string, string];
}

export default function HeatmapChart({
  data,
  height = 300,
  colorRange = ['#1e293b', '#6366f1']
}: HeatmapChartProps) {
  const [hoveredCell, setHoveredCell] = useState<{x: string, y: string} | null>(null);

  const { xLabels, yLabels, normalizedData, maxValue } = useMemo(() => {
    if (!data || data.length === 0) {
      return { xLabels: [], yLabels: [], normalizedData: [], maxValue: 0 };
    }

    const xSet = new Set<string>();
    const ySet = new Set<string>();
    let max = 0;

    data.forEach(d => {
      xSet.add(d.x);
      ySet.add(d.y);
      max = Math.max(max, d.value);
    });

    const xLabelsArray = Array.from(xSet);
    const yLabelsArray = Array.from(ySet);

    // Create a grid matrix
    const matrix: (HeatmapData | null)[][] = yLabelsArray.map(y =>
      xLabelsArray.map(x => {
        const cell = data.find(d => d.x === x && d.y === y);
        return cell || null;
      })
    );

    return {
      xLabels: xLabelsArray,
      yLabels: yLabelsArray,
      normalizedData: matrix,
      maxValue: max
    };
  }, [data]);

  const getColor = (value: number) => {
    if (maxValue === 0) return colorRange[0];
    const intensity = value / maxValue;
    
    // Interpolate between colors
    const r1 = parseInt(colorRange[0].slice(1, 3), 16);
    const g1 = parseInt(colorRange[0].slice(3, 5), 16);
    const b1 = parseInt(colorRange[0].slice(5, 7), 16);
    
    const r2 = parseInt(colorRange[1].slice(1, 3), 16);
    const g2 = parseInt(colorRange[1].slice(3, 5), 16);
    const b2 = parseInt(colorRange[1].slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * intensity);
    const g = Math.round(g1 + (g2 - g1) * intensity);
    const b = Math.round(b1 + (b2 - b1) * intensity);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        <p>No data available</p>
      </div>
    );
  }

  const cellWidth = Math.max(60, 300 / xLabels.length);
  const cellHeight = 40;

  return (
    <div className="w-full overflow-x-auto" style={{ height }}>
      <div className="inline-block min-w-full">
        {/* X Axis Labels */}
        <div className="flex ml-24 mb-2">
          {xLabels.map((label, i) => (
            <div
              key={i}
              className="text-xs text-slate-400 text-center font-medium"
              style={{ width: cellWidth }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-1">
          {yLabels.map((yLabel, yIndex) => (
            <div key={yIndex} className="flex items-center">
              {/* Y Axis Label */}
              <div className="w-24 text-xs text-slate-400 text-right pr-3 font-medium truncate">
                {yLabel}
              </div>
              
              {/* Row Cells */}
              <div className="flex gap-1">
                {normalizedData[yIndex]?.map((cell, xIndex) => {
                  if (!cell) return (
                    <div
                      key={xIndex}
                      className="rounded bg-slate-800/30"
                      style={{ width: cellWidth - 4, height: cellHeight }}
                    />
                  );
                  
                  const isHovered = hoveredCell?.x === cell.x && hoveredCell?.y === cell.y;
                  
                  return (
                    <motion.div
                      key={xIndex}
                      className="relative rounded cursor-pointer flex items-center justify-center"
                      style={{ 
                        width: cellWidth - 4, 
                        height: cellHeight,
                        backgroundColor: getColor(cell.value)
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: (yIndex * xLabels.length + xIndex) * 0.02 }}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                      onMouseEnter={() => setHoveredCell({ x: cell.x, y: cell.y })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <span className={`text-xs font-semibold ${
                        cell.value > maxValue * 0.6 ? 'text-white' : 'text-slate-300'
                      }`}>
                        {cell.value}
                      </span>
                      
                      {/* Tooltip */}
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 border border-white/10 rounded-lg shadow-xl whitespace-nowrap z-50"
                        >
                          <p className="text-xs text-slate-400">{cell.y} × {cell.x}</p>
                          <p className="text-lg font-bold text-white">{cell.value.toLocaleString()}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end mt-4 gap-2">
          <span className="text-xs text-slate-500">Low</span>
          <div 
            className="w-24 h-3 rounded-full"
            style={{ 
              background: `linear-gradient(to right, ${colorRange[0]}, ${colorRange[1]})` 
            }}
          />
          <span className="text-xs text-slate-500">High</span>
        </div>
      </div>
    </div>
  );
}
