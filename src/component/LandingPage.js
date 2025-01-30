import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, RefreshCw, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden">
      {/* Navigation Bar */}
      <nav className="w-full p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-teal-500 text-xl font-bold"
        >
          TradeXpert
        </motion.div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 p-8 relative z-10">
        {/* Left Section */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:w-1/2 space-y-8"
        >
          <h1 className="text-5xl lg:text-7xl font-bold">
            <span className="text-white">What's New in</span>
            <br />
            <span className="text-teal-500">TradeXpert</span>
          </h1>
          
          <p className="text-slate-400 text-lg max-w-xl">
            Discover the latest updates and improvements in our trading administration platform. 
            Stay ahead with our cutting-edge tools and enhanced features.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/add">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300"
              >
                <Database className="w-5 h-5" />
                Add New Data
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <Link to="/manage">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-medium border border-slate-700 transition-all duration-300"
              >
                <RefreshCw className="w-5 h-5" />
                Manage Database
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Right Section - Feature Cards */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {[
            { title: 'Enhanced Analytics', desc: 'Advanced trading metrics and insights' },
            { title: 'Real-time Updates', desc: 'Live market data integration' },
            { title: 'Smart Automation', desc: 'Automated trading workflows' },
            { title: 'Security Features', desc: 'Advanced encryption and protection' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index }}
              className="bg-slate-800 p-6 rounded-xl border border-slate-700"
            >
              <h3 className="text-teal-500 font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
          className="absolute top-20 right-20 w-96 h-96 bg-teal-500 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
        />
      </div>
    </div>
  );
};

export default LandingPage;