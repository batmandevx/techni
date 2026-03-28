'use client';

import { useEffect, useRef } from 'react';

export function AnimatedLogo({ onComplete }: { onComplete?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W: number, H: number, dpr: number, startTime: number, animFrame: number;
    let logoCX: number, logoCY: number, S: number;

    function resize() {
      if (!canvas || !ctx) return;
      dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = Math.min(W / 1100, H / 600);
      logoCX = W / 2 - 100 * S;
      logoCY = H / 2;
    }
    resize();
    window.addEventListener('resize', () => {
      resize();
    });

    // Easing functions
    function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
    function easeInOutCubic(t: number) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function easeOutExpo(t: number) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
    function easeOutBack(t: number) {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
    function easeOutElastic(t: number) {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
    }

    // Loop builders
    function buildLoop(farX: number, height: number, narrowTop: number, narrowBot: number) {
      return {
        top: {
          p0: { x: 0, y: 0 },
          cp1: { x: narrowTop, y: -height * 0.92 },
          cp2: { x: farX * 0.85, y: -height * 0.95 },
          p1: { x: farX, y: 0 }
        },
        bot: {
          p0: { x: farX, y: 0 },
          cp1: { x: farX * 0.85, y: height * 0.95 },
          cp2: { x: narrowBot, y: height * 0.92 },
          p1: { x: 0, y: 0 }
        }
      };
    }

    const blueMain = buildLoop(-108, 62, -38, -38);
    const blueOuter = buildLoop(-120, 74, -42, -42);
    const goldMain = buildLoop(105, 58, 35, 35);
    const goldOuter = buildLoop(118, 70, 40, 40);
    const goldRing3 = buildLoop(98, 50, 30, 30);
    const goldRing4 = buildLoop(94, 46, 27, 27);

    // Bezier math
    function bezPt(p0: any, cp1: any, cp2: any, p1: any, t: number) {
      const m = 1 - t;
      return {
        x: m * m * m * p0.x + 3 * m * m * t * cp1.x + 3 * m * t * t * cp2.x + t * t * t * p1.x,
        y: m * m * m * p0.y + 3 * m * m * t * cp1.y + 3 * m * t * t * cp2.y + t * t * t * p1.y
      };
    }

    function loopPt(loop: any, t: number) {
      if (t <= 0.5) {
        return bezPt(loop.top.p0, loop.top.cp1, loop.top.cp2, loop.top.p1, t * 2);
      } else {
        return bezPt(loop.bot.p0, loop.bot.cp1, loop.bot.cp2, loop.bot.p1, (t - 0.5) * 2);
      }
    }

    function strokeLoopPartial(loop: any, progress: number, ox: number, oy: number, sc: number) {
      if (progress <= 0) return;
      const N = 180;
      const maxT = progress;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * maxT;
        const p = loopPt(loop, t);
        const x = ox + p.x * sc;
        const y = oy + p.y * sc;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function strokeLoopFull(loop: any, ox: number, oy: number, sc: number) {
      strokeLoopPartial(loop, 1, ox, oy, sc);
    }

    // Drawing functions
    function drawRing(loop: any, progress: number, color: string, lineW: number, glowCol: string, glowSz: number) {
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
    }

    function drawCrossing(progress: number) {
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
    }

    let letterSparklesSpawned = new Set<number>();
    let oneBurstSpawned = false;
    let particles: any[] = [];
    let energyRings: any[] = [];

    class Particle {
      x: number; y: number; color: string; vx: number; vy: number; size: number; life: number; decay: number;
      constructor(x: number, y: number, color: string, opts: any = {}) {
        this.x = x; this.y = y; this.color = color;
        this.vx = (opts.vx || (Math.random() - 0.5) * 1.5) * S;
        this.vy = (opts.vy || (Math.random() - 0.5) * 1.5) * S;
        this.size = (opts.size || Math.random() * 2 + 0.5) * S;
        this.life = 1;
        this.decay = opts.decay || Math.random() * 0.018 + 0.006;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vx *= 0.99;
        this.vy *= 0.99;
      }
      draw() {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.life * 0.65;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 6 * S;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function spawnBurst(x: number, y: number, color: string, n: number) {
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 / n) * i + Math.random() * 0.4;
        const spd = Math.random() * 3 + 1;
        particles.push(new Particle(x, y, color, {
          vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
          size: Math.random() * 2.5 + 0.5, decay: Math.random() * 0.015 + 0.008
        }));
      }
    }

    function drawText(progress: number, t: number) {
      const fs = Math.round(54 * S);
      const bx = logoCX + 160 * S;
      const by = logoCY + 8 * S;
      const tenchi = 'Tenchi';
      const charDelay = 0.065;
      const charDuration = 0.22;

      ctx.font = `300 ${fs}px 'Outfit',sans-serif`;

      let charPositions: { x: number; w: number }[] = [];
      let xAccum = 0;
      for (let i = 0; i < tenchi.length; i++) {
        const w = ctx.measureText(tenchi[i]).width;
        charPositions.push({ x: bx + xAccum, w: w });
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
            ctx.fillText(tenchi[i], charPositions[i].x + ox * blurAmount * 0.5, by + oy * blurAmount * 0.5);
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

        if (cp > 0.55 && !letterSparklesSpawned.has(i)) {
          letterSparklesSpawned.add(i);
          const sx = charPositions[i].x + charPositions[i].w / 2;
          const sy = by - fs * 0.3;
          for (let j = 0; j < 6; j++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * 1.5 + 0.5;
            particles.push(new Particle(sx, sy, '#e4eaf0', {
              vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 0.5,
              size: Math.random() * 1.2 + 0.4, decay: 0.025
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

        if (slamP > 0.85 && !oneBurstSpawned) {
          oneBurstSpawned = true;
          const bx2 = oneX + oneW / 2;
          const by2 = by - fs * 0.3;
          energyRings.push({ x: bx2, y: by2, color: '#00b8ff', r: 0, life: 1 });
          spawnBurst(bx2, by2, '#00d8ff', 14);
          spawnBurst(bx2, by2, '#ffffff', 8);
        }
      }
    }

    function drawUnderline(progress: number) {
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
    }

    function drawBG() {
      const g = ctx.createRadialGradient(logoCX, logoCY, 0, logoCX, logoCY, Math.max(W, H) * 0.7);
      g.addColorStop(0, '#10223a');
      g.addColorStop(0.35, '#0c1a2e');
      g.addColorStop(1, '#060e1a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    let burstDone = false;

    function T(elapsed: number) {
      return {
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
        complete: elapsed > 4500
      };
    }

    function draw(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const tl = T(elapsed);

      ctx.clearRect(0, 0, W, H);

      ctx.globalAlpha = tl.bg;
      drawBG();
      ctx.globalAlpha = 1;

      // Blue rings
      drawRing(blueOuter, tl.blueOuter, 'rgba(0,184,255,0.2)', 1.3, 'rgba(0,184,255,0.12)', 5);
      drawRing(blueMain, tl.blueMain, '#00b8ff', 2.3, 'rgba(0,184,255,0.55)', 12);

      // Gold rings
      drawRing(goldOuter, tl.goldOuter, 'rgba(212,148,26,0.2)', 1.3, 'rgba(240,184,64,0.12)', 5);
      drawRing(goldMain, tl.goldMain, '#d4941a', 2.3, 'rgba(240,184,64,0.55)', 12);
      drawRing(goldRing3, tl.goldR3, 'rgba(240,200,80,0.35)', 1, 'rgba(240,184,64,0.18)', 6);
      drawRing(goldRing4, tl.goldR4, 'rgba(240,200,80,0.22)', 0.7, 'rgba(240,184,64,0.1)', 4);

      // Crossing
      drawCrossing(tl.cross);

      // Burst
      if (tl.cross > 0.85 && !burstDone) {
        burstDone = true;
        energyRings.push({ x: logoCX, y: logoCY, color: '#3ddc84', r: 0, life: 1 });
        spawnBurst(logoCX, logoCY, '#3ddc84', 20);
        spawnBurst(logoCX, logoCY, '#00d8ff', 10);
        spawnBurst(logoCX, logoCY, '#f0b840', 10);
      }

      // Text
      if (tl.text > 0) drawText(tl.text, elapsed);
      if (tl.underline > 0) drawUnderline(tl.underline);

      // Energy rings
      energyRings = energyRings.filter(r => r.life > 0);
      energyRings.forEach(r => {
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

      // Particles
      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => { p.update(); p.draw(); });

      if (tl.complete && onComplete) {
        onComplete();
        return;
      }

      animFrame = requestAnimationFrame(draw);
    }

    animFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, [onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-50"
      style={{ background: '#0a1628' }}
    />
  );
}
