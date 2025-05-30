"use client";

import { motion } from 'framer-motion';
import { BaziChart } from '@/types/bazi';

interface BaziResultProps {
  chart: BaziChart;
  onAnalyze: () => void;
  isAnalyzing?: boolean;
}

const BaziResult: React.FC<BaziResultProps> = ({ chart, onAnalyze, isAnalyzing = false }) => {
  const pillars = [
    { label: '年柱', value: chart.year_ganzhi, icon: '🐲', color: 'from-red-500 to-orange-500', element: '天干地支' },
    { label: '月柱', value: chart.month_ganzhi, icon: '🌙', color: 'from-blue-500 to-cyan-500', element: '月令' },
    { label: '日柱', value: chart.day_ganzhi, icon: '☀️', color: 'from-yellow-500 to-orange-500', element: '日主' },
    { label: '時柱', value: chart.hour_ganzhi, icon: '⭐', color: 'from-purple-500 to-pink-500', element: '時支' },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const pillarVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: -15 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.08,
      rotateY: 8,
      transition: { duration: 0.3 }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-6xl mx-auto mt-12"
    >
      <div className="neon-border">
        <div className="neon-border-content p-8 md:p-12">
          {/* Enhanced Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4 relative">
              <span className="gradient-text glow-text font-cyber">
                您的八字命盤
              </span>
              
              {/* Decorative elements around title */}
              <motion.div 
                className="absolute -top-2 -left-8 text-xl opacity-60"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                ✨
              </motion.div>
              <motion.div 
                className="absolute -top-2 -right-8 text-xl opacity-60"
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              >
                🔮
              </motion.div>
            </h3>
            
            <p className="text-slate-300 text-lg">
              基於您的出生時間計算的命理架構
            </p>
          </motion.div>

          {/* Enhanced Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.label}
                variants={pillarVariants}
                whileHover="hover"
                className="relative group"
              >
                {/* Card with enhanced styling */}
                <div className="cyber-card p-6 h-full relative overflow-hidden">
                  {/* Gradient border effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-10 rounded-xl`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10 text-center">
                    {/* Animated icon */}
                    <motion.div 
                      className="text-5xl mb-4 relative inline-block"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        repeatDelay: 2,
                        delay: index * 0.5
                      }}
                    >
                      {pillar.icon}
                      
                      {/* Glow effect behind icon */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${pillar.color} blur-xl opacity-30 scale-150`}></div>
                    </motion.div>
                    
                    {/* Label */}
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {pillar.label}
                    </h4>
                    
                    {/* Element description */}
                    <p className="text-xs text-slate-400 mb-3">
                      {pillar.element}
                    </p>
                    
                    {/* Ganzhi value with enhanced styling */}
                    <motion.div 
                      className="relative"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    >
                      <div className={`bg-gradient-to-r ${pillar.color} p-px rounded-lg mb-4`}>
                        <div className="bg-gray-900 rounded-lg py-3 px-4">
                          <span className="text-2xl font-bold text-white font-cyber">
                            {pillar.value}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Floating particles effect */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute w-1 h-1 bg-gradient-to-r ${pillar.color} rounded-full`}
                        style={{
                          left: `${20 + i * 30}%`,
                          top: `${10 + i * 20}%`,
                        }}
                        animate={{
                          y: [-10, 10, -10],
                          opacity: [0.3, 0.8, 0.3],
                        }}
                        transition={{
                          duration: 3 + i,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Corner decorations */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full opacity-60 animate-pulse" />
                  <div className="absolute bottom-2 left-2 w-1 h-1 bg-purple-400 rounded-full opacity-40 animate-ping" />
                </div>

                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${pillar.color} rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`}></div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Action Section */}
          <motion.div 
            className="text-center relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent rounded-3xl"></div>
            
            <div className="relative z-10 py-8">
              <motion.h4 
                className="text-xl text-slate-300 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                準備好探索您的命運密碼了嗎？
              </motion.h4>
              
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="cyber-button text-lg px-8 py-4 relative group overflow-hidden"
              >
                <motion.div
                  className="flex items-center justify-center space-x-3 relative z-10"
                  animate={isAnalyzing ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                  transition={isAnalyzing ? { repeat: Infinity, duration: 1.5 } : {}}
                >
                  {isAnalyzing ? (
                    <>
                      <motion.div 
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="loading-dots">AI 分析中</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">🤖</span>
                      <span className="font-semibold">獲取 AI 深度分析</span>
                      <span className="text-xl">✨</span>
                    </>
                  )}
                </motion.div>

                {/* Enhanced background animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20"
                  animate={{
                    x: isAnalyzing ? [-100, 100] : 0,
                    opacity: isAnalyzing ? [0.2, 0.5, 0.2] : 0,
                  }}
                  transition={{
                    x: { duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" },
                    opacity: { duration: 1.5, repeat: isAnalyzing ? Infinity : 0 }
                  }}
                />
                
                {/* Pulse effect when not analyzing */}
                {!isAnalyzing && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-400/30 rounded-lg"
                    animate={{ scale: [1, 1.05, 1], opacity: [0, 0.3, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}
              </motion.button>
              
              {/* Hint text */}
              <motion.p 
                className="text-sm text-slate-500 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                AI 將為您提供個人化的命理解讀與人生指引
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default BaziResult; 