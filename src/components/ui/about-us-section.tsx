"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  BarChart2, Brain, Globe, Package,
  ShieldCheck, Zap, Award, Users, Calendar,
  TrendingUp, ArrowRight, CheckCircle, Star, Sparkles
} from "lucide-react"
import { motion, useScroll, useTransform, useInView, useSpring } from "framer-motion"
import Link from "next/link"

const services = [
  {
    icon: <Brain className="w-6 h-6" />,
    secondaryIcon: <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-indigo-400" />,
    title: "AI Forecasting",
    description: "Our Gemini-powered demand engine learns from your historical data, seasonality patterns, and market signals to produce highly accurate multi-period forecasts.",
    position: "left",
  },
  {
    icon: <Package className="w-6 h-6" />,
    secondaryIcon: <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-indigo-400" />,
    title: "Inventory Intelligence",
    description: "Automated ABC analysis, stock coverage calculations, and aging reports transform your uploaded Excel data into actionable inventory strategies.",
    position: "left",
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    secondaryIcon: <Star className="w-4 h-4 absolute -top-1 -right-1 text-indigo-400" />,
    title: "KPI Dashboards",
    description: "Real-time S&OP metric dashboards visualize Stock Coverage, Forecast Accuracy, Stock-Out Gap, and inventory class distribution across your entire portfolio.",
    position: "left",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    secondaryIcon: <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-indigo-400" />,
    title: "Shipment Tracking",
    description: "Interactive Leaflet maps with satellite view, heatmap layers, and dotted polyline routes provide full end-to-end visibility of your global container movements.",
    position: "right",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    secondaryIcon: <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-indigo-400" />,
    title: "Secure & Compliant",
    description: "Enterprise-grade Clerk authentication, encrypted data pipelines, and role-based access controls ensure your supply chain data stays protected at every layer.",
    position: "right",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    secondaryIcon: <Star className="w-4 h-4 absolute -top-1 -right-1 text-indigo-400" />,
    title: "Instant Deployment",
    description: "Upload your Excel or CSV file and TenchiOne automatically parses, validates, and visualizes your data within seconds — no IT setup or coding required.",
    position: "right",
  },
]

const stats = [
  { icon: <Award className="w-6 h-6" />, value: 98, label: "Forecast Accuracy", suffix: "%" },
  { icon: <Users className="w-6 h-6" />, value: 500, label: "Enterprise Clients", suffix: "+" },
  { icon: <Calendar className="w-6 h-6" />, value: 3, label: "Years of Innovation", suffix: "" },
  { icon: <TrendingUp className="w-6 h-6" />, value: 2, label: "Billion $ Optimized", suffix: "B+" },
]

export default function AboutUsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 })
  const isStatsInView = useInView(statsRef, { once: false, amount: 0.3 })

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] })
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -40])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 40])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  }

  return (
    <section ref={sectionRef} id="about" className="w-full py-24 px-4 bg-[#070b14] text-white overflow-hidden relative border-t border-white/[0.06]">
      {/* Background decorations */}
      <div className="absolute top-1/4 -left-40 w-80 h-80 bg-indigo-600/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-violet-600/8 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        className="container mx-auto max-w-6xl relative z-10"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        {/* Heading */}
        <motion.div className="flex flex-col items-center mb-6 text-center" variants={itemVariants}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold tracking-wider text-indigo-300 mb-5">
            <Zap className="w-3.5 h-3.5" /> DISCOVER OUR PLATFORM
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Who We Are</h2>
          <motion.div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" initial={{ width: 0 }} animate={{ width: 64 }} transition={{ duration: 0.8, delay: 0.4 }} />
        </motion.div>

        <motion.p className="text-center max-w-2xl mx-auto mb-16 text-slate-400 leading-relaxed" variants={itemVariants}>
          TenchiOne is an AI-powered Sales & Operations Planning platform designed for modern supply chains. We combine
          Gemini AI, real-time data visualization, and deep logistics intelligence to help teams forecast, optimize,
          and deliver with precision — across any industry, in any language.
        </motion.p>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {/* Left */}
          <div className="space-y-12">
            {services.filter(s => s.position === "left").map((s, i) => (
              <ServiceItem key={`l-${i}`} {...s} variants={itemVariants} delay={i * 0.15} direction="left" />
            ))}
          </div>

          {/* Center Image */}
          <div className="flex justify-center items-center order-first md:order-none mb-8 md:mb-0">
            <motion.div className="relative w-full max-w-xs" variants={itemVariants}>
              <motion.div
                className="rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/20 border border-white/10"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop"
                  alt="Supply Chain Analytics Dashboard"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent flex items-end justify-center p-5">
                  <Link href="/auth?mode=sign-up">
                    <motion.button
                      className="bg-white/90 text-slate-900 px-5 py-2 rounded-full flex items-center gap-2 text-sm font-semibold backdrop-blur-sm hover:bg-white transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Try Platform <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
              {/* Decorative border */}
              <motion.div
                className="absolute inset-0 border-2 border-indigo-500/30 rounded-2xl -m-2 z-[-1]"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />
              {/* Floating orbs */}
              <motion.div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-indigo-500/10 blur-sm pointer-events-none" style={{ y: y1 }} />
              <motion.div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-violet-500/10 blur-sm pointer-events-none" style={{ y: y2 }} />
            </motion.div>
          </div>

          {/* Right */}
          <div className="space-y-12">
            {services.filter(s => s.position === "right").map((s, i) => (
              <ServiceItem key={`r-${i}`} {...s} variants={itemVariants} delay={i * 0.15} direction="right" />
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          ref={statsRef}
          className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-5"
          initial="hidden"
          animate={isStatsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {stats.map((stat, i) => <StatCounter key={i} {...stat} delay={i * 0.1} />)}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-16 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 text-white p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 30 }}
          animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div>
            <h3 className="text-2xl font-bold mb-1">Ready to optimize your supply chain?</h3>
            <p className="text-slate-400 text-sm">Join 500+ teams running on TenchiOne today.</p>
          </div>
          <Link href="/auth?mode=sign-up">
            <motion.button
              className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-7 py-3 rounded-full flex items-center gap-2 font-semibold text-sm shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

interface ServiceItemProps {
  icon: React.ReactNode
  secondaryIcon?: React.ReactNode
  title: string
  description: string
  variants: any
  delay: number
  direction: "left" | "right"
}

function ServiceItem({ icon, secondaryIcon, title, description, variants, delay, direction }: ServiceItemProps) {
  return (
    <motion.div className="flex flex-col group" variants={variants} transition={{ delay }} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
      <motion.div className="flex items-center gap-3 mb-3" initial={{ x: direction === "left" ? -15 : 15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: delay + 0.2 }}>
        <motion.div
          className="text-indigo-400 bg-indigo-500/10 p-3 rounded-xl transition-colors duration-300 group-hover:bg-indigo-500/20 relative flex-shrink-0"
          whileHover={{ rotate: [0, -8, 8, -4, 0], transition: { duration: 0.4 } }}
        >
          {icon}
          {secondaryIcon}
        </motion.div>
        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors duration-300">{title}</h3>
      </motion.div>
      <p className="text-sm text-slate-400 leading-relaxed pl-14">{description}</p>
      <span className="mt-2 pl-14 flex items-center gap-1 text-indigo-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Learn more <ArrowRight className="w-3 h-3" />
      </span>
    </motion.div>
  )
}

interface StatCounterProps {
  icon: React.ReactNode
  value: number
  label: string
  suffix: string
  delay: number
}

function StatCounter({ icon, value, label, suffix, delay }: StatCounterProps) {
  const countRef = useRef(null)
  const isInView = useInView(countRef, { once: false })
  const [hasAnimated, setHasAnimated] = useState(false)
  const springValue = useSpring(0, { stiffness: 50, damping: 10 })

  useEffect(() => {
    if (isInView && !hasAnimated) { springValue.set(value); setHasAnimated(true); }
    else if (!isInView && hasAnimated) { springValue.set(0); setHasAnimated(false); }
  }, [isInView, value, springValue, hasAnimated])

  const displayValue = useTransform(springValue, (latest) => Math.floor(latest))

  return (
    <motion.div
      className="bg-white/[0.03] border border-white/[0.07] hover:border-indigo-500/30 p-6 rounded-2xl flex flex-col items-center text-center group transition-all duration-300"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } } }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <motion.div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors duration-300" whileHover={{ rotate: 360, transition: { duration: 0.6 } }}>
        {icon}
      </motion.div>
      <motion.div ref={countRef} className="text-3xl font-black text-white flex items-center gap-0.5">
        <motion.span>{displayValue}</motion.span>
        <span>{suffix}</span>
      </motion.div>
      <p className="text-slate-500 text-xs mt-1">{label}</p>
      <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 mt-3 group-hover:w-14 transition-all duration-300 rounded-full" />
    </motion.div>
  )
}
