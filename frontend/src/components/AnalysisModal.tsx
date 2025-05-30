"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: string;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, analysis }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      rotateX: -15
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        duration: 0.5,
        bounce: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      rotateX: 15,
      transition: {
        duration: 0.3
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.4
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.4,
        duration: 0.6,
        staggerChildren: 0.01
      }
    }
  };

  const charVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.05
      }
    }
  };

  // Split analysis text into characters for typewriter effect
  const analysisChars = analysis.split('');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Enhanced Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-32 h-32 rounded-full opacity-10"
                  style={{
                    background: `linear-gradient(135deg, ${
                      ['#00f3ff', '#8b5cf6', '#f97316'][i % 3]
                    }, transparent)`,
                    left: `${10 + i * 15}%`,
                    top: `${5 + i * 12}%`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                    opacity: [0.05, 0.15, 0.05],
                  }}
                  transition={{
                    duration: 10 + i * 2,
                    repeat: Infinity,
                    delay: i,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Enhanced Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-5xl max-h-[85vh] overflow-hidden z-10"
            style={{ perspective: 1000 }}
          >
            <div className="neon-border">
              <div className="neon-border-content bg-gray-900/95 rounded-xl backdrop-blur-xl">
                {/* Enhanced Header */}
                <motion.div 
                  className="flex items-center justify-between p-6 md:p-8 border-b border-slate-700/50"
                  variants={contentVariants}
                >
                  <motion.div className="flex items-center space-x-4">
                    <motion.div
                      className="text-4xl"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                    >
                      🤖
                    </motion.div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold gradient-text glow-text font-cyber">
                        AI 深度命理分析
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        基於您的八字命盤生成的個人化解讀
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.button
                    onClick={onClose}
                    className="p-3 hover:bg-slate-800/50 rounded-lg transition-colors duration-200 group relative"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.div
                      className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors duration-200"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </motion.div>
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-red-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10 blur"></div>
                  </motion.button>
                </motion.div>

                {/* Enhanced Content */}
                <motion.div 
                  className="p-6 md:p-8 overflow-y-auto max-h-[60vh]"
                  variants={contentVariants}
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#8b5cf6 #1e293b'
                  }}
                >
                  <motion.div
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                  >
                    {/* Analysis content with enhanced typography */}
                    <div className="prose prose-invert max-w-none">
                      <div className="text-slate-200 leading-relaxed text-base md:text-lg">
                        {analysisChars.map((char, index) => (
                          <motion.span
                            key={index}
                            variants={charVariants}
                            className={char === '\n' ? 'block h-4' : ''}
                          >
                            {char === '\n' ? '' : char}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced decorative elements */}
                    <motion.div 
                      className="flex justify-center mt-10"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 2, duration: 0.5 }}
                    >
                      <div className="flex space-x-3">
                        {[...Array(7)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{
                              background: `linear-gradient(45deg, ${
                                ['#00f3ff', '#8b5cf6', '#f97316', '#00ff88'][i % 4]
                              }, ${
                                ['#8b5cf6', '#f97316', '#00ff88', '#00f3ff'][i % 4]
                              })`
                            }}
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.4, 1, 0.4],
                              rotate: [0, 180, 360]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.1,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>

                    {/* Wisdom quote section */}
                    <motion.div 
                      className="mt-8 p-6 rounded-xl bg-slate-800/30 border border-slate-600/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.5, duration: 0.5 }}
                    >
                      <div className="text-center">
                        <motion.div 
                          className="text-2xl mb-3"
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          🌟
                        </motion.div>
                        <p className="text-sm text-slate-400 italic">
                          "命運如星辰，智慧如明燈。AI 助您解讀天機，但真正的選擇權仍在您手中。"
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Enhanced Footer */}
                <motion.div 
                  className="flex flex-col sm:flex-row items-center justify-between p-6 md:p-8 border-t border-slate-700/50 bg-slate-800/20"
                  variants={contentVariants}
                >
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <div className="flex space-x-2">
                      {['🔮', '⭐', '✨'].map((emoji, i) => (
                        <motion.span
                          key={i}
                          className="text-lg"
                          animate={{
                            y: [0, -5, 0],
                            rotate: [0, 10, -10, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeInOut"
                          }}
                        >
                          {emoji}
                        </motion.span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">
                      感謝您使用 AI 八字算命系統
                    </p>
                  </div>
                  
                  <motion.button
                    onClick={onClose}
                    className="cyber-button px-8 py-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center space-x-2">
                      <span>✨</span>
                      <span>瞭解了</span>
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            </div>

            {/* Modal glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-pink-400/10 rounded-xl opacity-50 blur-xl -z-10"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnalysisModal; 