"use client";

import { motion } from 'framer-motion';
import { BaziChart, BaziInput } from '@/types/bazi';
import TraditionalBaziChart from './TraditionalBaziChart';

interface BaziResultProps {
  chart: BaziChart;
  originalInput: BaziInput;
  onAnalyze: () => void;
  isAnalyzing?: boolean;
}

const BaziResult: React.FC<BaziResultProps> = ({ chart, originalInput, onAnalyze, isAnalyzing = false }) => {
  const pillars = [
    { label: '年柱', value: chart.year_pillar.ganzhi, icon: '🐲', color: 'from-red-500 to-orange-500', element: chart.year_pillar.shi_shen },
    { label: '月柱', value: chart.month_pillar.ganzhi, icon: '🌙', color: 'from-blue-500 to-cyan-500', element: chart.month_pillar.shi_shen },
    { label: '日柱', value: chart.day_pillar.ganzhi, icon: '☀️', color: 'from-yellow-500 to-orange-500', element: chart.day_pillar.shi_shen },
    { label: '時柱', value: chart.hour_pillar.ganzhi, icon: '⭐', color: 'from-purple-500 to-pink-500', element: chart.hour_pillar.shi_shen },
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
      className="w-full max-w-7xl mx-auto mt-12"
    >
      {/* Modern Header */}
      <motion.div 
        className="text-center mb-8"
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

      {/* Traditional Bazi Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mb-8"
      >
        <TraditionalBaziChart chart={chart} originalInput={originalInput} />
      </motion.div>

      {/* Modern Style Quick View */}
      <div className="neon-border mb-8">
        <div className="neon-border-content p-6">
          <h4 className="text-xl font-bold text-center mb-6 text-cyan-400">四柱概覽</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.label}
                variants={pillarVariants}
                whileHover="hover"
                className="relative group"
              >
                <div className="cyber-card p-4 h-full relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-10 rounded-xl`}></div>
                  
                  <div className="relative z-10 text-center">
                    <motion.div 
                      className="text-3xl mb-2 relative inline-block"
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
                    </motion.div>
                    
                    <h4 className="text-sm font-semibold text-white mb-1">
                      {pillar.label}
                    </h4>
                    
                    <p className="text-xs text-slate-400 mb-2">
                      {pillar.element}
                    </p>
                    
                    <div className={`bg-gradient-to-r ${pillar.color} p-px rounded-lg`}>
                      <div className="bg-gray-900 rounded-lg py-2 px-3">
                        <span className="text-lg font-bold text-white font-cyber">
                          {pillar.value}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Action Section */}
      <motion.div 
        className="text-center relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="neon-border">
          <div className="neon-border-content p-8">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent rounded-3xl"></div>
            
            <div className="relative z-10">
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
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BaziResult; 