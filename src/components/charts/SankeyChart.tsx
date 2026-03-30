'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface SankeyNode {
  id: string;
  name: string;
  value?: number;
  color?: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyChartProps {
  data: {
    nodes: SankeyNode[];
    links: SankeyLink[];
  };
  height?: number;
}

const defaultColors = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', 
  '#ec4899', '#f43f5e', '#f97316', '#fbbf24'
];

export default function SankeyChart({ data, height = 350 }: SankeyChartProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  if (!data || !data.links || data.links.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        <p>No data available</p>
      </div>
    );
  }

  // Process nodes and calculate positions
  const nodes = data.nodes.map((node, index) => ({
    ...node,
    color: node.color || defaultColors[index % defaultColors.length],
    incoming: data.links.filter(l => l.target === node.id).reduce((s, l) => s + l.value, 0),
    outgoing: data.links.filter(l => l.source === node.id).reduce((s, l) => s + l.value, 0)
  }));

  const maxValue = Math.max(...nodes.map(n => Math.max(n.incoming, n.outgoing)));

  // Group nodes by level (sources vs targets)
  const sourceNodes = nodes.filter(n => n.outgoing > 0);
  const targetNodes = nodes.filter(n => n.incoming > 0 && n.outgoing === 0);

  return (
    <div className="w-full overflow-x-auto" style={{ height }}>
      <div className="flex items-center justify-center min-w-[600px] h-full px-4">
        {/* Source Column */}
        <div className="flex flex-col gap-3">
          {sourceNodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div
                className="px-4 py-3 rounded-xl border border-white/10 backdrop-blur-sm cursor-pointer transition-all hover:scale-105"
                style={{ 
                  backgroundColor: `${node.color}20`,
                  borderColor: `${node.color}40`,
                  minWidth: 140
                }}
              >
                <p className="text-sm font-medium text-white">{node.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {node.outgoing?.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connections */}
        <div className="flex-1 mx-8 relative" style={{ height: height - 50 }}>
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              {nodes.map((node, i) => (
                <linearGradient key={node.id} id={`gradient-${node.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={node.color} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={node.color} stopOpacity="0.2" />
                </linearGradient>
              ))}
            </defs>
            
            {/* Draw flow lines */}
            {data.links.map((link, index) => {
              const sourceNode = nodes.find(n => n.id === link.source);
              const targetNode = nodes.find(n => n.id === link.target);
              const isHovered = hoveredLink === `${link.source}-${link.target}`;
              
              if (!sourceNode || !targetNode) return null;

              const strokeWidth = Math.max(2, (link.value / maxValue) * 40);
              
              return (
                <motion.path
                  key={index}
                  d={`M 0,${50 + index * 30} Q 100,${50 + index * 30} 200,${50 + (index % 3) * 60}`}
                  fill="none"
                  stroke={sourceNode.color}
                  strokeWidth={strokeWidth}
                  strokeOpacity={isHovered ? 1 : 0.4}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredLink(`${link.source}-${link.target}`)}
                  onMouseLeave={() => setHoveredLink(null)}
                />
              );
            })}
          </svg>

          {/* Flow values */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence>
              {hoveredLink && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg shadow-xl"
                >
                  {(() => {
                    const [source, target] = hoveredLink.split('-');
                    const link = data.links.find(l => l.source === source && l.target === target);
                    return (
                      <>
                        <p className="text-xs text-slate-400">
                          {source} → {target}
                        </p>
                        <p className="text-lg font-bold text-white">
                          {link?.value.toLocaleString()}
                        </p>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Target Column */}
        <div className="flex flex-col gap-3">
          {targetNodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="relative"
            >
              <div
                className="px-4 py-3 rounded-xl border border-white/10 backdrop-blur-sm cursor-pointer transition-all hover:scale-105"
                style={{ 
                  backgroundColor: `${node.color}20`,
                  borderColor: `${node.color}40`,
                  minWidth: 140
                }}
              >
                <p className="text-sm font-medium text-white">{node.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {node.incoming?.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
