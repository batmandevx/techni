'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles, Package, TrendingUp, Globe, ArrowRight,
  Activity, BarChart2, Star, Zap, Shield
} from 'lucide-react';
import { Marquee } from '@/components/ui/3d-testimonials';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CreativePricing } from '@/components/ui/creative-pricing';
import type { PricingTier } from '@/components/ui/creative-pricing';

const FloatingLines = dynamic(() => import('@/components/ui/FloatingLines'), { ssr: false, loading: () => null });
const VaporizeTextCycle = dynamic(() => import('@/components/ui/vapour-text-effect'), { ssr: false, loading: () => null });
import AboutUsSection from '@/components/ui/about-us-section';
import { ShipmentTimeline } from '@/components/ui/shipment-timeline';
import { AnimatedText } from '@/components/ui/animated-underline-text-one';
import AnimatedTextCycle from '@/components/ui/animated-text-cycle';
import { Globe as CobeGlobe } from '@/components/ui/cobe-globe';
import { Footer } from '@/components/ui/footer';

const fadeIn = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };

const testimonials = [
  { name: 'Aisha Al-Mansouri', username: '@aisha.ops', body: "TenchiOne's demand forecasting cut our overstock by 35%. The AI insights are genuinely world-class.", img: 'https://randomuser.me/api/portraits/women/32.jpg', country: '🇦🇪 UAE' },
  { name: 'Marco Bianchi', username: '@marco_scm', body: 'The ABC analysis dashboard saved us weeks of manual work. Real-time data integration is seamless.', img: 'https://randomuser.me/api/portraits/men/51.jpg', country: '🇮🇹 Italy' },
  { name: 'Priya Sharma', username: '@priya.supply', body: 'Finally, a platform that speaks our language — literally. Arabic support made adoption effortless.', img: 'https://randomuser.me/api/portraits/women/53.jpg', country: '🇮🇳 India' },
  { name: 'James Okafor', username: '@jamesokafor', body: 'Shipment tracking with satellite view is a game-changer. We can see every container in real-time.', img: 'https://randomuser.me/api/portraits/men/33.jpg', country: '🇳🇬 Nigeria' },
  { name: 'Chen Wei', username: '@chenwei_log', body: 'Stock coverage KPIs and forecast accuracy metrics are exactly what our board needed to see.', img: 'https://randomuser.me/api/portraits/men/85.jpg', country: '🇨🇳 China' },
  { name: 'Sofia Hernandez', username: '@sofia.scm', body: 'The Gemini AI assistant answers supply chain questions in seconds. It replaced two consultant calls.', img: 'https://randomuser.me/api/portraits/women/68.jpg', country: '🇪🇸 Spain' },
  { name: 'Ali Hassan', username: '@ali.ops', body: "Best S&OP platform we've used. The dashboard visualizations make data-driven decisions effortless.", img: 'https://randomuser.me/api/portraits/men/22.jpg', country: '🇸🇦 Saudi Arabia' },
  { name: 'Yuki Tanaka', username: '@yuki_supply', body: 'Inventory aging analysis via Excel upload is brilliant. Setup took under 10 minutes.', img: 'https://randomuser.me/api/portraits/women/45.jpg', country: '🇯🇵 Japan' },
];

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter', icon: <Zap className="w-6 h-6" />, price: 49, description: 'For small teams getting started with S&OP', color: 'amber', href: '/auth?mode=sign-up',
    features: ['Upload up to 5 Excel files/month', 'Demand forecasting dashboard', 'Basic ABC inventory analysis', 'KPI overview (Stock Coverage, Accuracy)', 'Email support'],
  },
  {
    name: 'Growth', icon: <TrendingUp className="w-6 h-6" />, price: 149, description: 'For growing supply chain operations', color: 'blue', popular: true, href: '/auth?mode=sign-up',
    features: ['Unlimited Excel/CSV uploads', 'AI-powered demand prediction', 'Full ABC + inventory aging analysis', 'Shipment tracking with Leaflet maps', 'Gemini AI assistant (multilingual)', 'Priority support'],
  },
  {
    name: 'Enterprise', icon: <Shield className="w-6 h-6" />, price: 'Custom', description: 'For large-scale global supply chains', color: 'purple', href: '/auth?mode=sign-up',
    features: ['All Growth features included', 'BOM / MRP production planning', 'Custom ERP integrations', 'Satellite shipment tracking', 'Dedicated account manager', 'SLA & custom contracts'],
  },
];

const features = [
  { icon: <TrendingUp className="w-6 h-6" />, color: 'text-indigo-400', bg: 'bg-indigo-500/10', title: 'Demand Prediction', desc: 'AI-driven forecasting adapts to seasonality and market trends to ensure you never understock or overstock again.' },
  { icon: <Package className="w-6 h-6" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: 'Smart Inventory', desc: 'Automated ABC analysis and dynamic stock coverage calculations to optimize capital allocation and service levels.' },
  { icon: <Globe className="w-6 h-6" />, color: 'text-amber-400', bg: 'bg-amber-500/10', title: 'Global Tracking', desc: 'Real-time shipment visibility with satellite telemetry and ETA predictions to proactively manage your logistics.' },
];

function TestimonialCard({ img, name, username, body, country }: typeof testimonials[number]) {
  return (
    <div className="w-52 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col gap-3 text-left shrink-0 mb-4">
      <div className="flex items-center gap-2.5">
        <Avatar className="size-8">
          <AvatarImage src={img} alt={name} />
          <AvatarFallback className="bg-indigo-800 text-white text-xs">{name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-white truncate">{name}</span>
          <span className="text-[10px] text-slate-500">{username}</span>
        </div>
      </div>
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
      <span className="text-[10px] text-slate-600">{country}</span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050810] text-white font-sans">

      {/* ── 3D Background — interactive, receives mouse events ── */}
      <div className="fixed inset-0 z-0 opacity-40">
        <FloatingLines enabledWaves={['top', 'middle', 'bottom']} lineCount={6} lineDistance={4} bendRadius={5} bendStrength={-0.7} interactive={true} parallax={true} animationSpeed={0.6} />
      </div>

      {/* ── Static gradient overlays ── */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-600/10 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-[200px] bg-gradient-to-t from-[#050810] to-transparent" />
        <div className="absolute top-1/4 -left-72 w-[600px] h-[600px] bg-indigo-700/12 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-72 w-[600px] h-[600px] bg-violet-700/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* ── Floating KPI badges ── */}
        <div className="fixed top-36 right-8 hidden xl:flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md z-20" style={{ animation: 'float 5s ease-in-out infinite' }}>
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center"><Activity className="w-4 h-4 text-indigo-400" /></div>
          <div><div className="text-[10px] text-slate-400">Forecast Accuracy</div><div className="text-sm font-bold text-white">98.4%</div></div>
        </div>
        <div className="fixed top-56 left-8 hidden xl:flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md z-20" style={{ animation: 'float 6s ease-in-out 1s infinite' }}>
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><BarChart2 className="w-4 h-4 text-emerald-400" /></div>
          <div><div className="text-[10px] text-slate-400">Stock Savings</div><div className="text-sm font-bold text-white">+$2.4M</div></div>
        </div>

        {/* ── Navbar ── */}
        <motion.nav initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <AnimatedText
              text="TenchiOne"
              textClassName="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400"
              underlineClassName="text-indigo-400"
              underlinePath="M 0,12 Q 75,5 150,12 Q 225,18 300,12"
              underlineHoverPath="M 0,12 Q 75,18 150,12 Q 225,5 300,12"
              underlineDuration={1.5}
              className="!items-start !justify-start"
            />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth?mode=sign-in" className="text-sm text-slate-300 hover:text-white transition-colors">Login</Link>
            <Link href="/auth?mode=sign-up" className="text-sm font-semibold bg-white text-slate-900 px-5 py-2 rounded-full hover:bg-slate-100 hover:scale-105 transition-all">Get Started</Link>
          </div>
        </motion.nav>

        {/* ── Hero ── */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col items-center max-w-4xl w-full">

            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold tracking-wider text-indigo-300 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              V2.5 · NEXT-GEN AI SUPPLY CHAIN PLATFORM
            </motion.div>

            {/* Vapor Text - particle animation for subtitle */}
            <motion.div variants={fadeIn} className="w-full mb-6" style={{ height: '90px' }}>
              <VaporizeTextCycle
                texts={['Forecast.', 'Optimize.', 'Deliver.', 'Automate.']}
                font={{ fontFamily: 'Outfit, Inter, sans-serif', fontSize: '60px', fontWeight: 800 }}
                color="rgb(129, 140, 248)"
                spread={6}
                density={7}
                animation={{ vaporizeDuration: 2.5, fadeInDuration: 0.8, waitDuration: 1.5 }}
                direction="left-to-right"
                alignment="center"
              />
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
              Supply Chain Intelligence,{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 text-transparent bg-clip-text inline-flex items-baseline">
                <AnimatedTextCycle
                  words={['Automated.', 'Optimized.', 'Predicted.', 'Streamlined.', 'Enhanced.', 'Analyzed.', 'Forecasted.', 'Maximized.']}
                  interval={2800}
                  className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 text-transparent bg-clip-text"
                />
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed font-light">
              Transform demand forecasting, inventory optimization, and global logistics with AI. Stop guessing — operate with absolute precision.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/auth?mode=sign-up" className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-8 py-3.5 rounded-full font-semibold shadow-[0_0_30px_rgba(99,102,241,0.35)] hover:shadow-[0_0_50px_rgba(99,102,241,0.55)] hover:scale-105 transition-all w-full sm:w-auto">
                Start Optimizing Today <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/auth?mode=sign-in" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto">
                Access Dashboard
              </Link>
            </motion.div>
          </motion.div>

          {/* ── Features ── */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-24 text-left w-full">
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeIn} whileHover={{ y: -6 }} className="p-7 rounded-[1.5rem] bg-white/[0.04] border border-white/[0.07] hover:border-white/15 transition-all">
                <div className={`w-11 h-11 rounded-xl ${f.bg} ${f.color} flex items-center justify-center mb-5`}>{f.icon}</div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm font-light">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Global Reach / Globe ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeIn}
            className="mt-32 w-full"
          >
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center gap-0">
                {/* Text side */}
                <div className="flex-1 p-10 lg:p-16 flex flex-col gap-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-indigo-300 font-semibold tracking-wider w-fit">
                    <Globe className="w-3.5 h-3.5" /> GLOBAL LOGISTICS NETWORK
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                    Your Supply Chain,{' '}
                    <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Everywhere.</span>
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                    Track shipments across 150+ countries in real time. TenchiOne connects your manufacturers, carriers, and customers on a single intelligent map — from Shanghai to San Francisco.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {[
                      { val: '150+', label: 'Countries covered' },
                      { val: '12K+', label: 'Active shipments' },
                      { val: '99.9%', label: 'Uptime SLA' },
                      { val: '<2 min', label: 'Alert latency' },
                    ].map(s => (
                      <div key={s.label} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{s.val}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Globe side */}
                <div className="flex-1 flex items-center justify-center p-6 lg:p-10 w-full max-w-lg">
                  <CobeGlobe
                    markers={[
                      { id: 'shanghai', location: [31.2304, 121.4737], label: 'Shanghai' },
                      { id: 'dubai', location: [25.2048, 55.2708], label: 'Dubai' },
                      { id: 'rotterdam', location: [51.9244, 4.4777], label: 'Rotterdam' },
                      { id: 'singapore', location: [1.3521, 103.8198], label: 'Singapore' },
                      { id: 'la', location: [33.9425, -118.4081], label: 'Los Angeles' },
                      { id: 'mumbai', location: [18.9388, 72.8354], label: 'Mumbai' },
                      { id: 'london', location: [51.5074, -0.1278], label: 'London' },
                      { id: 'newyork', location: [40.7128, -74.006], label: 'New York' },
                      { id: 'tokyo', location: [35.6762, 139.6503], label: 'Tokyo' },
                    ]}
                    arcs={[
                      { id: 'sh-dxb', from: [31.2304, 121.4737], to: [25.2048, 55.2708] },
                      { id: 'sh-la', from: [31.2304, 121.4737], to: [33.9425, -118.4081] },
                      { id: 'dxb-rot', from: [25.2048, 55.2708], to: [51.9244, 4.4777] },
                      { id: 'sg-mum', from: [1.3521, 103.8198], to: [18.9388, 72.8354] },
                      { id: 'rot-nyc', from: [51.9244, 4.4777], to: [40.7128, -74.006] },
                      { id: 'tok-la', from: [35.6762, 139.6503], to: [33.9425, -118.4081] },
                    ]}
                    markerColor={[0.39, 0.4, 1]}
                    baseColor={[0.12, 0.1, 0.22]}
                    arcColor={[0.55, 0.45, 1]}
                    glowColor={[0.3, 0.25, 0.7]}
                    dark={1}
                    mapBrightness={4}
                    speed={0.004}
                    className="w-full max-w-[420px]"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Pricing ── */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeIn} className="mt-32 w-full">
            <CreativePricing tag="Transparent Pricing" title="Plans for Every Scale" description="From lean teams to global enterprises — grow on your own terms." tiers={pricingTiers} />
          </motion.div>

          {/* ── Shipment Timeline ── */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeIn} className="mt-8 w-full">
            <ShipmentTimeline />
          </motion.div>

          {/* ── Testimonials ── */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeIn} className="mt-32 w-full">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold tracking-wider text-amber-300 mb-4">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> TRUSTED BY GLOBAL TEAMS
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">What our customers say</h2>
              <p className="text-slate-400 font-light max-w-md mx-auto text-sm">From Dubai to Tokyo — supply chain teams around the world run on TenchiOne.</p>
            </div>

            {/* Marquee container — explicit height + perspective */}
            <div className="relative h-[480px] w-full overflow-hidden" style={{ perspective: '300px' }}>
              <div
                className="absolute inset-0 flex flex-row items-start justify-center gap-4 pt-4"
                style={{ transform: 'rotateX(18deg) rotateY(-7deg) rotateZ(18deg) translateX(-60px) translateZ(-80px)' }}
              >
                {/* Column 1 — down */}
                <div className="flex flex-col gap-4 animate-[marquee-vertical-a_38s_linear_infinite]">
                  {[...testimonials, ...testimonials, ...testimonials].map((t, i) => <TestimonialCard key={`a-${i}`} {...t} />)}
                </div>
                {/* Column 2 — up */}
                <div className="flex flex-col gap-4 animate-[marquee-vertical-b_42s_linear_infinite]">
                  {[...testimonials, ...testimonials, ...testimonials].map((t, i) => <TestimonialCard key={`b-${i}`} {...t} />)}
                </div>
                {/* Column 3 — down (hidden on mobile) */}
                <div className="flex-col gap-4 animate-[marquee-vertical-a_36s_linear_infinite] hidden md:flex">
                  {[...testimonials, ...testimonials, ...testimonials].map((t, i) => <TestimonialCard key={`c-${i}`} {...t} />)}
                </div>
                {/* Column 4 — up (hidden on small screens) */}
                <div className="flex-col gap-4 animate-[marquee-vertical-b_44s_linear_infinite] hidden lg:flex">
                  {[...testimonials, ...testimonials, ...testimonials].map((t, i) => <TestimonialCard key={`d-${i}`} {...t} />)}
                </div>
              </div>
              {/* Edge fades */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#050810] z-10" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#050810] z-10" />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#050810] z-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#050810] z-10" />
            </div>
          </motion.div>
        </section>

        {/* ── About Us ── */}
        <AboutUsSection />

        {/* ── Footer ── */}
        <Footer 
          brandName="TenchiOne"
          tagline="AI-powered S&OP platform for modern supply chains. Forecast, optimize, and deliver with precision."
          showNewsletter={true}
        />
      </div>

      {/* ── Custom keyframes (marquee-vertical without CSS var dependency) ── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes marquee-vertical-a {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes marquee-vertical-b {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
