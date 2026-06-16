import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBookmarkStore } from '../store/bookmarkStore';
import { Zap, Globe, Bookmark, ArrowRight, Code, Terminal, Sparkles, Brain, Bot, Target } from 'lucide-react';

export default function Landing() {
  const { user } = useAuthStore();
  const { savedEventIds } = useBookmarkStore();

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand-500/20 dark:bg-brand-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-40 -left-40 w-[500px] h-[500px] bg-purple-500/20 dark:bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-40 -right-40 w-[500px] h-[500px] bg-blue-500/20 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-40 relative z-10 text-center">
          <div data-aos="fade-down" className="inline-flex items-center px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-semibold text-sm mb-8 border border-brand-100 dark:border-brand-800/50 shadow-sm animate-fade-in-up">
            <Sparkles className="w-4 h-4 mr-2" />
            The Ultimate Event Aggregator
          </div>
          
          <h1 data-aos="fade-up" data-aos-delay="100" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
            Find Your Next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400">
              Tech Hackathon
            </span>
          </h1>
          
          <p data-aos="fade-up" data-aos-delay="200" className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-300 mx-auto mb-2 leading-relaxed">
            NexusEvents aggressively scrapes Unstop, Devfolio, HackerEarth, and HackerRank to bring you every global tech event, instantly scored by AI to match your personal interests.
          </p>
          <p data-aos="fade-up" data-aos-delay="300" className="max-w-2xl text-sm font-medium text-brand-600 dark:text-brand-400 mx-auto mb-10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 mr-1.5" /> 
            We are constantly adding more platforms to ensure you never miss an opportunity!
          </p>
          
          <div data-aos="fade-up" data-aos-delay="400" className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Link 
                to="/discover" 
                className="px-8 py-4 text-lg font-bold rounded-full text-white bg-brand-600 hover:bg-brand-500 shadow-xl shadow-brand-600/30 transition-all transform hover:-translate-y-1 flex items-center justify-center"
              >
                Continue Discovering <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/signup" 
                  className="px-8 py-4 text-lg font-bold rounded-full text-white bg-brand-600 hover:bg-brand-500 shadow-xl shadow-brand-600/30 transition-all transform hover:-translate-y-1 flex items-center justify-center"
                >
                  Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link 
                  to="/login" 
                  className="px-8 py-4 text-lg font-bold rounded-full text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all transform hover:-translate-y-1 flex items-center justify-center"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
          
          {user && (
            <p className="mt-6 text-sm font-medium text-gray-500 dark:text-gray-400">
              Welcome back! You have <span className="text-brand-600 dark:text-brand-400 font-bold">{savedEventIds.size}</span> saved events.
            </p>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-gray-50 dark:bg-gray-800/50 py-24 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-aos="fade-up" className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why use NexusEvents?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div data-aos="fade-up" data-aos-delay="100" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Global Aggregation</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We scrape the top platforms globally so you never have to check 5 different websites to find the perfect competition.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div data-aos="fade-up" data-aos-delay="200" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">AI Recommendations</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Our engine cross-references your skills with event requirements to bubble up the best matching opportunities just for you.
              </p>
            </div>

            {/* Feature 3 */}
            <div data-aos="fade-up" data-aos-delay="300" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center mb-6">
                <Bookmark className="w-7 h-7 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Instant Bookmarking</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Save events with one click and access them beautifully formatted in your personalized dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Features Coming Soon */}
      <div className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div data-aos="fade-up" className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-semibold text-sm mb-4 border border-amber-100 dark:border-amber-800/50 shadow-sm">
              <Brain className="w-4 h-4 mr-2" />
              The Future of Discovery
            </span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Powerful AI Features <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Coming Soon</span></h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* AI Feature 1 */}
            <div data-aos="fade-right" className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center mb-6 shadow-sm z-10 relative">
                <Target className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 relative z-10">One-Click AI Registration</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed relative z-10">
                Tired of filling out the same forms on different platforms? We are building an AI auto-fill engine that completes your hackathon registrations across the web with a single click.
              </p>
            </div>

            {/* AI Feature 2 */}
            <div data-aos="fade-left" className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center mb-6 shadow-sm z-10 relative">
                <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 relative z-10">Personalized Email Digests</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed relative z-10">
                Get automated weekly roundups delivered straight to your inbox, containing the top 5 upcoming hackathons specifically curated by our AI engine based on your activity and saved tags.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
