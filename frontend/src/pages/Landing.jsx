import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBookmarkStore } from '../store/bookmarkStore';
import { Zap, Globe, Bookmark, ArrowRight, Target, Brain, Bot, Sparkles, Database, Cpu, Mail, Code, TrendingUp, Layers, CheckCircle2, MessageSquare, Star } from 'lucide-react';
import { motion } from 'framer-motion';

// Animation variants for Staggered text
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.25, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15, mass: 1 }
  }
};

export default function Landing() {
  const { user } = useAuthStore();
  const { savedEventIds } = useBookmarkStore();

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent">
      
      {/* Animated Floating Orbs Background */}
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4],
          x: [0, 80, -20, 0],
          y: [0, -60, 20, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 -left-20 w-[500px] h-[500px] bg-purple-500/30 blur-[100px] rounded-full pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, -70, 30, 0],
          y: [0, 60, -20, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-40 -right-20 w-[600px] h-[600px] bg-cyan-500/30 blur-[100px] rounded-full pointer-events-none"
      />

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-40 text-center">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center px-4 py-2 rounded-full bg-brand-500/10 text-brand-600 dark:text-cyan-400 font-semibold text-sm mb-8 border border-brand-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-md">
            <Sparkles className="w-4 h-4 mr-2" />
            The Ultimate Event Aggregator
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
            Find Your Next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500 filter drop-shadow-[0_0_25px_rgba(6,182,212,0.3)]">
              Tech Hackathon
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="mt-4 max-w-2xl text-xl text-slate-600 dark:text-slate-300 mx-auto mb-2 leading-relaxed">
            NexusEvents aggressively scrapes top platforms to bring you every global tech event, instantly scored by AI to match your personal interests.
          </motion.p>
          
          <motion.p variants={itemVariants} className="max-w-2xl text-sm font-medium text-brand-600 dark:text-cyan-400 mx-auto mb-10 flex items-center justify-center">
            <Target className="w-4 h-4 mr-1.5" /> 
            Continuously discovering new opportunities just for you.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Link to="/discover" className="group relative px-8 py-4 text-lg font-bold rounded-full text-white bg-brand-600 hover:bg-brand-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center overflow-hidden">
                <span className="relative z-10 flex items-center">Continue Discovering <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="group relative px-8 py-4 text-lg font-bold rounded-full text-white bg-brand-600 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center overflow-hidden">
                  <span className="relative z-10 flex items-center">Get Started for Free <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link to="/login" className="px-8 py-4 text-lg font-bold rounded-full text-slate-900 dark:text-white bg-white/10 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:bg-white/20 dark:hover:bg-slate-700/50 shadow-sm transition-all flex items-center justify-center">
                  Sign In
                </Link>
              </>
            )}
          </motion.div>
          
          {user && (
            <motion.p variants={itemVariants} className="mt-6 text-sm font-medium text-slate-500 dark:text-slate-400">
              Welcome back! You have <span className="text-brand-600 dark:text-cyan-400 font-bold">{savedEventIds.size}</span> saved events.
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Supported Platforms Marquee */}
      <div className="relative z-10 py-10 border-t border-b border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-black/40 backdrop-blur-md overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center mb-6">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Integrating Opportunities From</p>
        </div>
        <div className="flex justify-center flex-wrap gap-8 md:gap-16 opacity-70">
          {/* Mock Logos - using styled text for now */}
          {['Devpost', 'Devfolio', 'MLH', 'Luma', 'Unstop', 'Eventbrite'].map((platform, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center text-xl md:text-2xl font-extrabold text-slate-400 dark:text-slate-500 grayscale hover:grayscale-0 hover:text-cyan-500 transition-all duration-300"
            >
              <Code className="w-6 h-6 mr-2 opacity-50" /> {platform}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why use NexusEvents?</h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Globe, title: "Global Aggregation", desc: "We scrape the top platforms globally so you never have to check 5 different websites to find the perfect competition.", color: "text-blue-500", bg: "bg-blue-500/10" },
              { icon: Zap, title: "AI Recommendations", desc: "Our engine cross-references your skills with event requirements to bubble up the best matching opportunities just for you.", color: "text-purple-500", bg: "bg-purple-500/10" },
              { icon: Bookmark, title: "Instant Bookmarking", desc: "Save events with one click and access them beautifully formatted in your personalized dashboard.", color: "text-cyan-500", bg: "bg-cyan-500/10" }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.2, type: "spring", stiffness: 120, damping: 15 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300"
              >
                <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Developer Experience Highlight */}
      <div className="relative z-10 py-24 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                No more noise.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">Just signal.</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                NexusEvents is designed to get out of your way. Instead of browsing endless pages of irrelevant events, your personalized dashboard only shows opportunities that match your specific tech stack.
              </p>
              <ul className="space-y-4">
                {[
                  "Set your preferred languages and frameworks",
                  "Instantly filter out events that don't match your skills",
                  "Keep all your bookmarked hackathons in one clean dashboard"
                ].map((item, idx) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (idx * 0.1) }}
                    className="flex items-center text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-5 h-5 text-cyan-500 mr-3 flex-shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 100 }}
              className="relative"
            >
              {/* Abstract UI Representation */}
              <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-2xl relative z-10">
                <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/50"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400/50"></div>
                  </div>
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-cyan-500/20 flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
                      <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800/50 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex gap-4 opacity-50">
                    <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
                      <div className="h-3 w-1/3 bg-slate-100 dark:bg-slate-800/50 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative background blur behind the abstract UI */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-[60px] rounded-full z-0 pointer-events-none"></div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="relative z-10 py-16 bg-gradient-to-r from-brand-600/10 to-purple-600/10 border-y border-brand-500/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "5+", label: "Platforms Monitored" },
              { num: "24/7", label: "Automated Scraping" },
              { num: "100%", label: "Free for Developers" },
              { num: "∞", label: "Opportunities" }
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
              >
                <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
                  {stat.num}
                </div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Features Coming Soon */}
      <div className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-sm mb-4 border border-purple-500/20"
          >
            <Brain className="w-4 h-4 mr-2" />
            The Future of Discovery
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-slate-900 dark:text-white mb-16"
          >
            Powerful AI Features <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">Coming Soon</span>
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-lg p-8 rounded-3xl border border-slate-200 dark:border-white/10 relative overflow-hidden group text-left"
            >
              <div className="w-12 h-12 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-white/10">
                <Target className="w-6 h-6 text-brand-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">One-Click AI Registration</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Tired of filling out the same forms? We are building an AI auto-fill engine that completes your hackathon registrations with a single click.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-lg p-8 rounded-3xl border border-slate-200 dark:border-white/10 relative overflow-hidden group text-left"
            >
              <div className="w-12 h-12 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-white/10">
                <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Personalized Email Digests</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Get automated weekly roundups delivered straight to your inbox, containing the top upcoming hackathons specifically curated by our AI engine.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Massive CTA Footer */}
      <div className="relative z-10 py-32 border-t border-slate-200/50 dark:border-white/5 bg-slate-900 dark:bg-black overflow-hidden">
        {/* Glowing background behind CTA */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-black text-white mb-8 leading-tight"
          >
            Stop hunting for events.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Let them find you.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto"
          >
            Join thousands of developers instantly discovering their next big opportunity.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {user ? (
              <Link to="/discover" className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold rounded-full text-slate-900 bg-white hover:bg-cyan-50 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] transition-all transform hover:-translate-y-1">
                Go to Dashboard <ArrowRight className="ml-2 w-6 h-6" />
              </Link>
            ) : (
              <Link to="/signup" className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold rounded-full text-slate-900 bg-white hover:bg-cyan-50 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] transition-all transform hover:-translate-y-1">
                Create Free Account <ArrowRight className="ml-2 w-6 h-6" />
              </Link>
            )}
            <div className="mt-6 flex items-center justify-center text-slate-500 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-cyan-500 mr-2" /> No credit card required. Free forever for developers.
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
