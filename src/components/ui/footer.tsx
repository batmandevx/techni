'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Mail, 
  ArrowRight, 
  Twitter, 
  Linkedin, 
  Github,
  MapPin,
  Phone,
  ChevronRight
} from 'lucide-react';

interface FooterProps {
  brandName?: string;
  tagline?: string;
  showNewsletter?: boolean;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const footerLinks = {
  product: [
    { label: 'Dashboard', href: '/auth?mode=sign-in' },
    { label: 'Forecasting', href: '/auth?mode=sign-in' },
    { label: 'Inventory', href: '/auth?mode=sign-in' },
    { label: 'Shipment Tracking', href: '/auth?mode=sign-in' },
    { label: 'AI Assistant', href: '/ai-assistant' },
  ],
  company: [
    { label: 'About', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Community', href: '#' },
    { label: 'Status', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Security', href: '#' },
  ]
};

export function Footer({ 
  brandName = 'TenchiOne',
  tagline = 'AI-powered S&OP platform for modern supply chains. Forecast, optimize, and deliver with precision.',
  showNewsletter = true 
}: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="relative w-full">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      
      {/* Main footer content */}
      <div className="relative bg-[#050810]/80 backdrop-blur-xl border-t border-white/[0.06]">
        {/* Newsletter Section */}
        {showNewsletter && (
          <div className="max-w-7xl mx-auto px-6 py-12 border-b border-white/[0.06]">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="flex flex-col lg:flex-row items-center justify-between gap-8"
            >
              <motion.div variants={fadeInUp} className="text-center lg:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Stay ahead of the curve</h3>
                <p className="text-slate-400 text-sm max-w-md">
                  Get the latest insights on supply chain optimization, AI trends, and product updates delivered to your inbox.
                </p>
              </motion.div>
              
              <motion.form 
                variants={fadeInUp}
                onSubmit={handleSubscribe}
                className="flex items-center gap-3 w-full max-w-md"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="enter@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] whitespace-nowrap"
                >
                  {isSubscribed ? 'Subscribed!' : 'Subscribe'}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.form>
            </motion.div>
          </div>
        )}

        {/* Links Grid */}
        <div className="max-w-7xl mx-auto px-6 py-14">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6"
          >
            {/* Brand Column */}
            <motion.div variants={fadeInUp} className="col-span-2 md:col-span-3 lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-white">{brandName}</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
                {tagline}
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <a href="mailto:hello@tenchione.com" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  hello@tenchione.com
                </a>
                <a href="tel:+1234567890" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  +1 (234) 567-890
                </a>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  San Francisco, CA
                </div>
              </div>
            </motion.div>

            {/* Product Links */}
            <motion.div variants={fadeInUp}>
              <h4 className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-4">Product</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="group flex items-center text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-indigo-400" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company Links */}
            <motion.div variants={fadeInUp}>
              <h4 className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-4">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="group flex items-center text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-indigo-400" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Resources Links */}
            <motion.div variants={fadeInUp}>
              <h4 className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-4">Resources</h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="group flex items-center text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-indigo-400" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal Links */}
            <motion.div variants={fadeInUp}>
              <h4 className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-4">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="group flex items-center text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-indigo-400" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-xs">
              © {new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-2">
              {[
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
                { icon: Github, href: '#', label: 'GitHub' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-indigo-500/30 transition-all group"
                >
                  <social.icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
