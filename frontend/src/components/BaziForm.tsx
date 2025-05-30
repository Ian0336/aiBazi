"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BaziInput, BaziChart } from '@/types/bazi';

interface BaziFormProps {
  onCalculate: (chart: BaziChart) => void;
  isLoading?: boolean;
}

const BaziForm: React.FC<BaziFormProps> = ({ onCalculate, isLoading = false }) => {
  const [input, setInput] = useState<BaziInput>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    hour: new Date().getHours(),
  });

  const [errors, setErrors] = useState<Partial<BaziInput>>({});

  const validateInput = (): boolean => {
    const newErrors: Partial<BaziInput> = {};

    if (input.year < 1900 || input.year > 2100) {
      newErrors.year = 1;
    }
    if (input.month < 1 || input.month > 12) {
      newErrors.month = 1;
    }
    if (input.day < 1 || input.day > 31) {
      newErrors.day = 1;
    }
    if (input.hour < 0 || input.hour > 23) {
      newErrors.hour = 1;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInput()) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bazi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (response.ok) {
        const chart: BaziChart = await response.json();
        onCalculate(chart);
      } else {
        console.error('Failed to calculate Bazi');
      }
    } catch (error) {
      console.error('Error calculating Bazi:', error);
    }
  };

  const inputVariants = {
    focused: {
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    unfocused: {
      scale: 1,
      transition: { duration: 0.2 }
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

  const formFields = [
    { key: 'year', label: '年份', placeholder: '1990', icon: '📅', description: '出生年份 (1900-2100)' },
    { key: 'month', label: '月份', placeholder: '1-12', icon: '🗓️', description: '出生月份 (1-12)' },
    { key: 'day', label: '日期', placeholder: '1-31', icon: '📆', description: '出生日期 (1-31)' },
    { key: 'hour', label: '小時', placeholder: '0-23', icon: '🕐', description: '出生時辰 (0-23)' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="neon-border">
        <div className="neon-border-content p-8 md:p-10">
          {/* Enhanced Header */}
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 relative">
              <span className="gradient-text glow-text font-cyber">
                AI 八字算命
              </span>
              
              {/* Floating decorative elements */}
              <motion.div 
                className="absolute -top-4 -left-12 text-2xl opacity-50"
                animate={{ rotate: 360, y: [0, -10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                🌟
              </motion.div>
              <motion.div 
                className="absolute -top-4 -right-12 text-2xl opacity-50"
                animate={{ rotate: -360, y: [0, 10, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                🔮
              </motion.div>
            </h2>
            
            <p className="text-lg text-slate-300 mb-2">
              請輸入您的出生時間，讓 AI 為您解讀命運密碼
            </p>
            <p className="text-sm text-slate-400">
              我們將使用傳統八字計算方法結合現代 AI 技術為您分析
            </p>
          </motion.div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Enhanced Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {formFields.map(({ key, label, placeholder, icon, description }, index) => (
                <motion.div 
                  key={key} 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                >
                  {/* Label with icon */}
                  <label className="flex items-center space-x-2 text-sm font-medium text-slate-200">
                    <span className="text-lg">{icon}</span>
                    <span>{label}</span>
                  </label>
                  
                  {/* Enhanced input field */}
                  <div className="relative group">
                    <motion.input
                      variants={inputVariants}
                      whileFocus="focused"
                      initial="unfocused"
                      animate="unfocused"
                      type="number"
                      placeholder={placeholder}
                      className={`cyber-input w-full p-4 text-lg font-semibold ${
                        errors[key as keyof BaziInput] 
                          ? 'border-red-500 ring-red-500/30' 
                          : 'group-hover:border-cyan-400/50'
                      }`}
                      value={input[key as keyof BaziInput]}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          [key]: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    
                    {/* Input description */}
                    <p className="text-xs text-slate-500 mt-1">
                      {description}
                    </p>
                    
                    {/* Error message */}
                    {errors[key as keyof BaziInput] && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-1 flex items-center space-x-1"
                      >
                        <span>⚠️</span>
                        <span>請輸入有效的{label}</span>
                      </motion.p>
                    )}
                    
                    {/* Glow effect on focus */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/20 to-purple-400/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Enhanced Submit Button */}
            <motion.div 
              className="text-center pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                type="submit"
                disabled={isLoading}
                className="cyber-button w-full md:w-auto px-12 py-4 text-xl font-bold relative group overflow-hidden"
              >
                <motion.div
                  className="flex items-center justify-center space-x-3 relative z-10"
                  animate={isLoading ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                  transition={isLoading ? { repeat: Infinity, duration: 1 } : {}}
                >
                  {isLoading ? (
                    <>
                      <motion.div 
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="loading-dots">計算中</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">🔮</span>
                      <span>計算八字命盤</span>
                      <span className="text-xl">✨</span>
                    </>
                  )}
                </motion.div>

                {/* Background animation effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20"
                  animate={{
                    x: isLoading ? [-100, 100] : 0,
                    opacity: isLoading ? [0.2, 0.5, 0.2] : 0,
                  }}
                  transition={{
                    x: { duration: 2, repeat: isLoading ? Infinity : 0, ease: "linear" },
                    opacity: { duration: 1.5, repeat: isLoading ? Infinity : 0 }
                  }}
                />
                
                {/* Pulse effect when not loading */}
                {!isLoading && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-400/30 to-purple-400/30 rounded-lg"
                    animate={{ scale: [1, 1.05, 1], opacity: [0, 0.3, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}
              </motion.button>
              
              {/* Helper text */}
              <motion.p 
                className="text-sm text-slate-500 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                基於傳統干支曆法的精確計算，為您提供準確的八字命盤
              </motion.p>
            </motion.div>
          </form>
          
          {/* Additional info section */}
          <motion.div 
            className="mt-8 pt-6 border-t border-slate-700/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              {[
                { icon: '🎯', title: '精準計算', desc: '傳統干支曆法' },
                { icon: '⚡', title: '即時結果', desc: '秒級響應速度' },
                { icon: '🔒', title: '隱私保護', desc: '數據安全保障' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-cyan-400/30 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
                  <p className="text-xs text-slate-400">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default BaziForm; 