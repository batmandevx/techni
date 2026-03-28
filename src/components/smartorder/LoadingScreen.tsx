'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete?: () => void;
  minDuration?: number;
  showReplay?: boolean;
}

// Easing functions
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeOutElastic = (t: number) => {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
};

// Loop shape definitions
const buildLoop = (farX: number, height: number, narrowTop: number, narrowBot: number, farTopY?: number, farBotY?: number) => ({
  top: {
    p0: { x: 0, y: 0 },
    cp1: { x: narrowTop, y: -height * 0.92 },
    cp2: { x: farX * 0.85, y: farTopY || -height * 0.95 },
    p1: { x: farX, y: 0 }
  },
  bot: {
    p0: { x: farX, y: 0 },
    cp1: { x: farX * 0.85, y: farBotY || height * 0.95 },
    cp2: { x: narrowBot, y: height * 0.92 },
    p1: { x: 0, y: 0 }
  }
});

const blueMain = buildLoop(-108, 62, -38, -38);
const blueOuter = buildLoop(-120, 74, -42, -42);
const goldMain = buildLoop(105, 58, 35, 35);
const goldOuter = buildLoop(118, 70, 40, 40);
const goldRing3 = buildLoop(98, 50, 30, 30);
const goldRing4 = buildLoop(94, 46, 27, 27);

class Particle {
  x: number; y: number; color: string; vx: number; vy: number; size: number; life: number; decay: number;
  constructor(x: number, y: number, color: string, opts: { vx?: number; vy?: number; size?: number; decay?: number } = {}) {
    this.x = x; this.y = y; this.color = color;
    this.vx = (opts.vx || (Math.random() - 0.5) * 1.5);
    this.vy = (opts.vy || (Math.random() - 0.5) * 1.5);
    this.size = opts.size || (Math.random() * 2 + 0.5);
    this.life = 1; this.decay = opts.decay || (Math.random() * 0.018 + 0.006);
  }
  update() {
    this.x += this.vx; this.y += this.vy; this.life -= this.decay;
    this.vx *= 0.99; this.vy *= 0.99;
  }
}

class Orb {
  loop: ReturnType<typeof buildLoop>; color: string; speed: number; size: number; t: number; trail: { x: number; y: number }[];
  constructor(loop: ReturnType<typeof buildLoop>, color: string, speed: number, size: number) {
    this.loop = loop; this.color = color; this.speed = speed; this.size = size;
    this.t = Math.random(); this.trail = [];
  }
  update(dt: number, logoCX: number, logoCY: number, S: number) {
    this.t = (this.t + this.speed * dt) % 1;
    const p = this.loopPoint(this.t);
    this.trail.unshift({ x: logoCX + p.x * S, y: logoCY + p.y * S });
    if (this.trail.length > 24) this.trail.pop();
  }
  loopPoint(t: number) {
    if (t <= 0.5) return this.bezPt(this.loop.top.p0, this.loop.top.cp1, this.loop.top.cp2, this.loop.top.p1, t * 2);
    else return this.bezPt(this.loop.bot.p0, this.loop.bot.cp1, this.loop.bot.cp2, this.loop.bot.p1, (t - 0.5) * 2);
  }
  bezPt(p0: { x: number; y: number }, cp1: { x: number; y: number }, cp2: { x: number; y: number }, p1: { x: number; y: number }, t: number) {
    const m = 1 - t;
    return {
      x: m * m * m * p0.x + 3 * m * m * t * cp1.x + 3 * m * t * t * cp2.x + t * t * t * p1.x,
      y: m * m * m * p0.y + 3 * m * m * t * cp1.y + 3 * m * t * t * cp2.y + t * t * t * p1.y
    };
  }
}

export default function LoadingScreen({ onComplete, minDuration = 4000, showReplay = false }: LoadingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const orbsRef = useRef<Orb[]>([]);
  const starsRef = useRef<{ x: number; y: number; size: number; speed: number; offset: number; alpha: number }[]>([]);
  const energyRingsRef = useRef<{ x: number; y: number; color: string; r: number; life: number }[]>([]);
  const letterSparklesSpawned = useRef<Set<number>>(new Set());
  const oneBurstSpawned = useRef(false);
  const orbsReadyRef = useRef(false);
  const burstDoneRef = useRef(false);

  const initStars = useCallback((W: number, H: number) => {
    starsRef.current = [];
    for (let i = 0; i < 70; i++) {
      starsRef.current.push({
        x: Math.random() * W, y: Math.random() * H,
        size: Math.random() * 1.3 + 0.3, speed: Math.random() * 0.003 + 0.001,
        offset: Math.random() * Math.PI * 2, alpha: Math.random() * 0.25 + 0.08
      });
    }
  }, []);

  const initOrbs = useCallback(() => {
    orbsRef.current = [
      new Orb(blueMain, '#00d8ff', 0.00024, 3),
      new Orb(goldMain, '#f0b840', 0.0002, 3),
      new Orb(blueOuter, '#00d8ff', 0.00017, 2.2),
      new Orb(goldOuter, '#f0b840', 0.00021, 2.2),
    ];
  }, []);

  const restartAnimation = useCallback(() => {
    startTimeRef.current = undefined;
    particlesRef.current = [];
    energyRingsRef.current = [];
    orbsRef.current = [];
    letterSparklesSpawned.current = new Set();
    oneBurstSpawned.current = false;
    orbsReadyRef.current = false;
    burstDoneRef.current = false;
    setIsComplete(false);
    setShowContent(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars(W, H);
    };

    resize();
    window.addEventListener('resize', resize);
    const S = Math.min(W / 1100, H / 600);
    const logoCX = W / 2 - 100 * S;
    const logoCY = H / 2;
    initStars(W, H);

    const spawnBurst = (x: number, y: number, color: string, n: number) => {
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 / n) * i + Math.random() * 0.4;
        const spd = Math.random() * 3 + 1;
        particlesRef.current.push(new Particle(x, y, color, {
          vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
          size: Math.random() * 2.5 + 0.5, decay: Math.random() * 0.015 + 0.008
        }));
      }
    };

    const spawnRing = (x: number, y: number, color: string) => {
      energyRingsRef.current.push({ x, y, color, r: 0, life: 1 });
    };

    const drawStars = (t: number) => {
      starsRef.current.forEach(s => {
        const f = 0.5 + 0.5 * Math.sin(t * s.speed + s.offset);
        ctx.globalAlpha = s.alpha * f;
        ctx.fillStyle = '#b0c8e0';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const drawBG = () => {
      const g = ctx.createRadialGradient(logoCX, logoCY, 0, logoCX, logoCY, Math.max(W, H) * 0.7);
      g.addColorStop(0, '#10223a');
      g.addColorStop(0.35, '#0c1a2e');
      g.addColorStop(1, '#060e1a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
      v.addColorStop(0, 'transparent');
      v.addColorStop(1, 'rgba(4,8,16,0.5)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, W, H);
    };

    const drawAmbientGlow = (t: number) => {
      const p = 0.6 + 0.15 * Math.sin(t * 0.001);
      [
        { x: -95, c: '#00b8ff', a: 0.07, r: 160 },
        { x: 95, c: '#f0b840', a: 0.055, r: 150 },
        { x: 0, c: '#3ddc84', a: 0.04, r: 70 }
      ].forEach(glow => {
        ctx.save();
        ctx.globalAlpha = glow.a * p;
        const gr = ctx.createRadialGradient(logoCX + glow.x * S, logoCY, 0, logoCX + glow.x * S, logoCY, glow.r * S);
        gr.addColorStop(0, glow.c);
        gr.addColorStop(1, 'transparent');
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      });
    };

    const loopPoint = (loop: typeof blueMain, t: number) => {
      if (t <= 0.5) return bezPt(loop.top.p0, loop.top.cp1, loop.top.cp2, loop.top.p1, t * 2);
      return bezPt(loop.bot.p0, loop.bot.cp1, loop.bot.cp2, loop.bot.p1, (t - 0.5) * 2);
    };

    const bezPt = (p0: { x: number; y: number }, cp1: { x: number; y: number }, cp2: { x: number; y: number }, p1: { x: number; y: number }, t: number) => {
      const m = 1 - t;
      return {
        x: m * m * m * p0.x + 3 * m * m * t * cp1.x + 3 * m * t * t * cp2.x + t * t * t * p1.x,
        y: m * m * m * p0.y + 3 * m * m * t * cp1.y + 3 * m * t * t * cp2.y + t * t * t * p1.y
      };
    };

    const strokeLoopPartial = (loop: typeof blueMain, progress: number, ox: number, oy: number, sc: number) => {
      if (progress <= 0) return;
      const N = 180;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * progress;
        const p = loopPoint(loop, t);
        const x = ox + p.x * sc;
        const y = oy + p.y * sc;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const drawRing = (loop: typeof blueMain, progress: number, color: string, lineW: number, glowCol: string, glowSz: number) => {
      if (progress <= 0) return;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineW * S;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = glowCol;
      ctx.shadowBlur = glowSz * S;
      strokeLoopPartial(loop, easeInOutCubic(progress), logoCX, logoCY, S);
      ctx.restore();
    };

    const drawCrossing = (progress: number) => {
      if (progress <= 0) return;
      const ep = easeOutCubic(progress);
      const hw = 45 * S * ep;
      const hh = 36 * S * ep;
      const grad = ctx.createLinearGradient(logoCX - hw, logoCY, logoCX + hw, logoCY);
      grad.addColorStop(0, 'rgba(0,200,255,0.45)');
      grad.addColorStop(0.42, 'rgba(61,220,132,0.95)');
      grad.addColorStop(0.58, 'rgba(61,220,132,0.95)');
      grad.addColorStop(1, 'rgba(240,184,64,0.45)');
      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8 * S;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(61,220,132,0.55)';
      ctx.shadowBlur = 10 * S;
      ctx.beginPath();
      ctx.moveTo(logoCX - hw, logoCY - hh);
      ctx.lineTo(logoCX + hw, logoCY + hh);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(logoCX - hw, logoCY + hh);
      ctx.lineTo(logoCX + hw, logoCY - hh);
      ctx.stroke();
      ctx.restore();
    };

    const drawGlowDots = (dp: number, t: number) => {
      if (dp <= 0) return;
      const pulse = (i: number) => 0.65 + 0.35 * Math.sin(t * 0.002 + i * 1.3);
      const dots = [
        { loop: blueMain, lt: 0.5, color: '#00d8ff', sz: 4.5 },
        { loop: blueOuter, lt: 0.2, color: '#00d8ff', sz: 3.5 },
        { loop: blueOuter, lt: 0.8, color: '#00d8ff', sz: 3 },
        { x: logoCX, y: logoCY, color: '#3ddc84', sz: 5.5 },
        { loop: goldOuter, lt: 0.22, color: '#f0b840', sz: 4.5 },
        { loop: goldMain, lt: 0.5, color: '#f0b840', sz: 3.5 },
        { loop: goldOuter, lt: 0.78, color: '#f0b840', sz: 3 },
      ];

      dots.forEach((d: any, i) => {
        const cp = Math.max(0, Math.min(1, (dp - i * 0.06) / 0.4));
        if (cp <= 0) return;
        const ep = easeOutCubic(cp);
        const a = pulse(i) * ep;
        let x: number, y: number;
        if (d.loop) {
          const pt = loopPoint(d.loop, d.lt);
          x = logoCX + pt.x * S;
          y = logoCY + pt.y * S;
        } else {
          x = d.x; y = d.y;
        }
        const sz = d.sz * S * ep;
        ctx.save();
        ctx.globalAlpha = a * 0.22;
        ctx.fillStyle = d.color;
        ctx.shadowColor = d.color;
        ctx.shadowBlur = 28 * S;
        ctx.beginPath();
        ctx.arc(x, y, sz * 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = a * 0.5;
        ctx.fillStyle = d.color;
        ctx.shadowColor = d.color;
        ctx.shadowBlur = 14 * S;
        ctx.beginPath();
        ctx.arc(x, y, sz * 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = a * 0.9;
        ctx.fillStyle = '#fff';
        ctx.shadowColor = d.color;
        ctx.shadowBlur = 10 * S;
        ctx.beginPath();
        ctx.arc(x, y, sz * 0.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const drawText = (progress: number, t: number) => {
      const fs = Math.round(54 * S);
      const bx = logoCX + 160 * S;
      const by = logoCY + 8 * S;
      const tenchi = 'Tenchi';
      const charDelay = 0.065;
      const charDuration = 0.22;

      ctx.font = `300 ${fs}px 'Outfit',sans-serif`;

      let xAccum = 0;
      const charPositions: { x: number; w: number }[] = [];
      for (let i = 0; i < tenchi.length; i++) {
        const w = ctx.measureText(tenchi[i]).width;
        charPositions.push({ x: bx + xAccum, w });
        xAccum += w;
      }
      const tenchiTotalW = xAccum;

      for (let i = 0; i < tenchi.length; i++) {
        const rawP = (progress - i * charDelay) / charDuration;
        const cp = Math.max(0, Math.min(1, rawP));
        if (cp <= 0) continue;

        const revealP = Math.min(1, cp / 0.6);
        const settleP = Math.max(0, (cp - 0.6) / 0.4);
        const epReveal = easeOutCubic(revealP);
        const epSettle = easeOutElastic(settleP);
        const alpha = Math.min(1, epReveal * 1.3);
        const scaleBase = 1 + (1 - epReveal) * 0.35;
        const scaleBounce = settleP > 0 ? 1 + (1 - epSettle) * 0.06 : scaleBase;
        const finalScale = settleP > 0 ? scaleBounce : scaleBase;
        const slideY = (1 - epReveal) * 20 * S;
        const blurAmount = (1 - epReveal) * 8 * S;

        const cx_char = charPositions[i].x + charPositions[i].w / 2;
        const cy_char = by;

        ctx.save();
        ctx.translate(cx_char, cy_char + slideY);
        ctx.scale(finalScale, finalScale);
        ctx.translate(-cx_char, -cy_char);

        if (blurAmount > 0.5) {
          ctx.globalAlpha = alpha * 0.15;
          ctx.fillStyle = '#e4eaf0';
          const offsets = [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1.4], [0, 1.4], [-1.4, 0], [1.4, 0]];
          offsets.forEach(([ox, oy]) => {
            ctx.fillText(tenchi[i], charPositions[i].x + (ox as number) * blurAmount * 0.5, by + (oy as number) * blurAmount * 0.5);
          });
        }

        if (epReveal < 0.9) {
          ctx.globalAlpha = alpha * 0.3 * (1 - epReveal);
          ctx.fillStyle = '#00b8ff';
          ctx.shadowColor = '#00b8ff';
          ctx.shadowBlur = 20 * S;
          ctx.fillText(tenchi[i], charPositions[i].x, by);
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#e4eaf0';
        ctx.shadowColor = 'rgba(255,255,255,0.15)';
        ctx.shadowBlur = 2 * S;
        ctx.fillText(tenchi[i], charPositions[i].x, by);
        ctx.restore();

        if (cp > 0.55 && !letterSparklesSpawned.current.has(i)) {
          letterSparklesSpawned.current.add(i);
          const sx = charPositions[i].x + charPositions[i].w / 2;
          const sy = by - fs * 0.3;
          for (let j = 0; j < 6; j++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * 1.5 + 0.5;
            particlesRef.current.push(new Particle(sx, sy, '#e4eaf0', {
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd - 0.5,
              size: Math.random() * 1.2 + 0.4,
              decay: 0.025
            }));
          }
        }
      }

      const oneDelay = 0.5;
      const oneDuration = 0.4;
      const oneRawP = (progress - oneDelay) / oneDuration;
      const oneP = Math.max(0, Math.min(1, oneRawP));

      if (oneP > 0) {
        ctx.font = `600 ${fs}px 'Outfit',sans-serif`;
        const oneX = bx + tenchiTotalW + 8 * S;
        const oneW = ctx.measureText('One').width;
        const oneCX = oneX + oneW / 2;

        const slamP = Math.min(1, oneP / 0.5);
        const settleOP = Math.max(0, (oneP - 0.5) / 0.5);
        const epSlam = easeOutExpo(slamP);
        const epSettle = easeOutBack(settleOP);
        const slideX = (1 - epSlam) * 60 * S;
        const scaleSlam = 1 + (1 - epSlam) * 0.5;
        const scaleFinal = settleOP > 0 ? 1 + (1 - epSettle) * 0.04 : scaleSlam;
        const oneAlpha = Math.min(1, epSlam * 1.5);
        const glowIntensity = slamP < 1 ? epSlam * 2 : 1 + (1 - settleOP) * 1.5;

        ctx.save();
        ctx.translate(oneCX + slideX, by);
        ctx.scale(scaleFinal, scaleFinal);
        ctx.translate(-oneCX, -by);

        if (glowIntensity > 1) {
          ctx.globalAlpha = oneAlpha * 0.2 * (glowIntensity - 1);
          ctx.fillStyle = '#00b8ff';
          ctx.shadowColor = '#00b8ff';
          ctx.shadowBlur = 50 * S;
          ctx.fillText('One', oneX + slideX, by);
          ctx.shadowBlur = 35 * S;
          ctx.fillText('One', oneX + slideX, by);
        }

        const continuousGlow = 0.4 + 0.2 * Math.sin(t * 0.003);
        ctx.globalAlpha = oneAlpha;
        ctx.shadowColor = 'rgba(0,184,255,0.75)';
        ctx.shadowBlur = (12 + continuousGlow * 14) * S;
        ctx.fillStyle = '#00b8ff';
        ctx.fillText('One', oneX + slideX, by);

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#50e0ff';
        ctx.globalAlpha = oneAlpha * 0.3;
        ctx.fillText('One', oneX + slideX, by);
        ctx.restore();

        if (slamP > 0.85 && !oneBurstSpawned.current) {
          oneBurstSpawned.current = true;
          const bx2 = oneX + oneW / 2;
          const by2 = by - fs * 0.3;
          spawnRing(bx2, by2, '#00b8ff');
          spawnBurst(bx2, by2, '#00d8ff', 14);
          spawnBurst(bx2, by2, '#ffffff', 8);
        }
      }

      const sweepStart = 0.82;
      const sweepP = Math.max(0, (progress - sweepStart) / 0.18);
      const elapsed = t;
      const continuousSweepCycle = 5000;
      const continuousSweepP = elapsed > 4000 ? ((elapsed - 4000) % continuousSweepCycle) / 800 : -1;
      const activeSweep = sweepP > 0 && sweepP < 1 ? sweepP : (continuousSweepP >= 0 && continuousSweepP < 1 ? continuousSweepP : -1);

      if (activeSweep >= 0) {
        const totalTextW = tenchiTotalW + 8 * S + (oneP > 0 ? ctx.measureText('One').width : 0);
        const sweepX = bx - 40 * S + (totalTextW + 80 * S) * easeInOutCubic(activeSweep);
        const sweepW = 35 * S;

        ctx.save();
        const sg = ctx.createLinearGradient(sweepX - sweepW, 0, sweepX + sweepW, 0);
        sg.addColorStop(0, 'rgba(255,255,255,0)');
        sg.addColorStop(0.3, 'rgba(255,255,255,0.08)');
        sg.addColorStop(0.5, 'rgba(200,230,255,0.18)');
        sg.addColorStop(0.7, 'rgba(255,255,255,0.08)');
        sg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sg;
        ctx.globalAlpha = 1;
        ctx.fillRect(bx - 10 * S, by - fs * 1.1, totalTextW + 20 * S, fs * 1.5);

        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1 * S;
        ctx.beginPath();
        ctx.moveTo(sweepX, by - fs * 1.1);
        ctx.lineTo(sweepX, by + fs * 0.35);
        ctx.stroke();
        ctx.restore();
      }
    };

    const drawUnderline = (progress: number) => {
      if (progress <= 0) return;
      const ep = easeOutCubic(progress);
      const x0 = logoCX + 160 * S;
      const y0 = logoCY + 22 * S;
      const len = 320 * S * ep;

      const g = ctx.createLinearGradient(x0, 0, x0 + len, 0);
      g.addColorStop(0, 'rgba(0,184,255,0.5)');
      g.addColorStop(0.4, 'rgba(0,184,255,0.2)');
      g.addColorStop(0.7, 'rgba(0,184,255,0.06)');
      g.addColorStop(1, 'rgba(0,184,255,0)');
      ctx.save();
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.2 * S;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + len, y0);
      ctx.stroke();

      if (ep < 0.95) {
        const tipX = x0 + len;
        ctx.fillStyle = '#00d8ff';
        ctx.shadowColor = '#00d8ff';
        ctx.shadowBlur = 12 * S;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(tipX, y0, 2 * S, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const emitAmbient = () => {
      if (Math.random() > 0.35) {
        const t = Math.random();
        const p = loopPoint(blueMain, t);
        particlesRef.current.push(new Particle(logoCX + p.x * S, logoCY + p.y * S, '#00d8ff', {
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          size: Math.random() * 1.4 + 0.3,
          decay: 0.011
        }));
      }
      if (Math.random() > 0.35) {
        const t = Math.random();
        const p = loopPoint(goldMain, t);
        particlesRef.current.push(new Particle(logoCX + p.x * S, logoCY + p.y * S, '#f0b840', {
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          size: Math.random() * 1.4 + 0.3,
          decay: 0.011
        }));
      }
      if (Math.random() > 0.75) {
        particlesRef.current.push(new Particle(logoCX + (Math.random() - 0.5) * 15 * S, logoCY + (Math.random() - 0.5) * 15 * S, '#3ddc84', {
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() + 0.3,
          decay: 0.014
        }));
      }
    };

    const drawBreathing = (t: number) => {
      const b = 0.025 + 0.018 * Math.sin(t * 0.0015);
      ctx.save();
      ctx.globalAlpha = b;
      ctx.strokeStyle = '#00d8ff';
      ctx.lineWidth = 5 * S;
      ctx.shadowColor = '#00d8ff';
      ctx.shadowBlur = 28 * S;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i <= 180; i++) {
        const t2 = i / 180;
        const p = loopPoint(blueMain, t2);
        const x = logoCX + p.x * S;
        const y = logoCY + p.y * S;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = '#f0b840';
      ctx.shadowColor = '#f0b840';
      ctx.beginPath();
      for (let i = 0; i <= 180; i++) {
        const t2 = i / 180;
        const p = loopPoint(goldMain, t2);
        const x = logoCX + p.x * S;
        const y = logoCY + p.y * S;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    };

    const T = (elapsed: number) => ({
      bg: Math.min(1, elapsed / 500),
      blueMain: Math.max(0, Math.min(1, (elapsed - 400) / 1300)),
      blueOuter: Math.max(0, Math.min(1, (elapsed - 300) / 1500)),
      goldMain: Math.max(0, Math.min(1, (elapsed - 650) / 1300)),
      goldOuter: Math.max(0, Math.min(1, (elapsed - 550) / 1500)),
      goldR3: Math.max(0, Math.min(1, (elapsed - 750) / 1200)),
      goldR4: Math.max(0, Math.min(1, (elapsed - 800) / 1200)),
      cross: Math.max(0, Math.min(1, (elapsed - 1500) / 700)),
      dots: Math.max(0, Math.min(1, (elapsed - 1700) / 1000)),
      text: Math.max(0, Math.min(1, (elapsed - 2100) / 1800)),
      underline: Math.max(0, Math.min(1, (elapsed - 3400) / 700)),
      orbFade: Math.max(0, Math.min(1, (elapsed - 2800) / 500)),
      ambient: elapsed > 2300,
      breathing: elapsed > 3300,
    });

    const draw = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const tl = T(elapsed);

      ctx.clearRect(0, 0, W, H);

      ctx.globalAlpha = tl.bg;
      drawBG();
      drawStars(elapsed);
      ctx.globalAlpha = 1;

      const af = Math.max(0, Math.min(1, (elapsed - 1200) / 1200));
      if (af > 0) {
        ctx.globalAlpha = af;
        drawAmbientGlow(elapsed);
        ctx.globalAlpha = 1;
      }

      drawRing(blueOuter, tl.blueOuter, 'rgba(0,184,255,0.2)', 1.3, 'rgba(0,184,255,0.12)', 5);
      drawRing(blueMain, tl.blueMain, '#00b8ff', 2.3, 'rgba(0,184,255,0.55)', 12);
      drawRing(goldOuter, tl.goldOuter, 'rgba(212,148,26,0.2)', 1.3, 'rgba(240,184,64,0.12)', 5);
      drawRing(goldMain, tl.goldMain, '#d4941a', 2.3, 'rgba(240,184,64,0.55)', 12);
      drawRing(goldRing3, tl.goldR3, 'rgba(240,200,80,0.35)', 1, 'rgba(240,184,64,0.18)', 6);
      drawRing(goldRing4, tl.goldR4, 'rgba(240,200,80,0.22)', 0.7, 'rgba(240,184,64,0.1)', 4);

      drawCrossing(tl.cross);

      if (tl.cross > 0.85 && !burstDoneRef.current) {
        burstDoneRef.current = true;
        spawnRing(logoCX, logoCY, '#3ddc84');
        spawnBurst(logoCX, logoCY, '#3ddc84', 20);
        spawnBurst(logoCX, logoCY, '#00d8ff', 10);
        spawnBurst(logoCX, logoCY, '#f0b840', 10);
      }

      drawGlowDots(tl.dots, elapsed);

      if (tl.orbFade > 0) {
        if (!orbsReadyRef.current) {
          initOrbs();
          orbsReadyRef.current = true;
        }
        ctx.globalAlpha = easeOutCubic(tl.orbFade);
        orbsRef.current.forEach(o => {
          o.update(16, logoCX, logoCY, S);
          if (o.trail.length < 2) return;
          for (let i = 1; i < o.trail.length; i++) {
            const a = (1 - i / o.trail.length) * 0.4;
            const sz = o.size * (1 - i / o.trail.length) * S;
            ctx.save();
            ctx.globalAlpha = a;
            ctx.fillStyle = o.color;
            ctx.shadowColor = o.color;
            ctx.shadowBlur = 5 * S;
            ctx.beginPath();
            ctx.arc(o.trail[i].x, o.trail[i].y, sz, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          const h = o.trail[0];
          ctx.save();
          ctx.fillStyle = '#fff';
          ctx.shadowColor = o.color;
          ctx.shadowBlur = 16 * S;
          ctx.beginPath();
          ctx.arc(h.x, h.y, o.size * S, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.6;
          ctx.fillStyle = o.color;
          ctx.beginPath();
          ctx.arc(h.x, h.y, o.size * 1.6 * S, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        ctx.globalAlpha = 1;
      }

      if (tl.text > 0) drawText(tl.text, elapsed);
      if (tl.underline > 0) drawUnderline(tl.underline);
      if (tl.breathing) drawBreathing(elapsed);
      if (tl.ambient) emitAmbient();

      energyRingsRef.current = energyRingsRef.current.filter(r => r.life > 0);
      energyRingsRef.current.forEach(r => {
        r.r += 2.5 * S;
        r.life -= 0.022;
        ctx.save();
        ctx.globalAlpha = r.life * 0.4;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2 * S * r.life;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 18 * S;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
        p.update();
        ctx.save();
        ctx.globalAlpha = p.life * 0.65;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6 * S;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (elapsed >= minDuration && !isComplete) {
        setIsComplete(true);
        setTimeout(() => {
          setShowContent(false);
          onComplete?.();
        }, 500);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [minDuration, onComplete, initStars, initOrbs]);

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: '#0a1628' }}
        >
          <canvas ref={canvasRef} className="absolute inset-0" />
          
          {showReplay && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4 }}
              onClick={restartAnimation}
              className="fixed bottom-6 right-6 flex items-center gap-2 px-6 py-3 bg-[rgba(0,184,255,0.08)] backdrop-blur-xl border border-[rgba(0,184,255,0.2)] text-[#00b8ff] rounded-full text-sm font-medium hover:bg-[rgba(0,184,255,0.16)] hover:border-[rgba(0,184,255,0.5)] transition-all duration-300 hover:-translate-y-0.5"
              style={{ boxShadow: '0 0 30px rgba(0,184,255,0.15)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-180">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
              Replay
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
