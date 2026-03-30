'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface FloatingCard3DProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export default function FloatingCard3D({ children, className = '', glowColor = 'rgba(99, 102, 241, 0.3)' }: FloatingCard3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-15deg', '15deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative ${className}`}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-px rounded-2xl blur-xl opacity-0 transition-opacity duration-500"
        style={{ 
          background: glowColor,
          opacity: isHovered ? 0.5 : 0,
        }}
      />
      
      {/* Card content */}
      <div 
        className="relative h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
        style={{ transform: 'translateZ(50px)' }}
      >
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: `translateZ(60px)`,
          }}
        />
        
        {children}
      </div>
    </motion.div>
  );
}
