"use client";

import { useState, useEffect } from 'react';
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

  // Helper function to check if a year is a leap year
  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  // Helper function to get days in a month
  const getDaysInMonth = (year: number, month: number): number => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2 && isLeapYear(year)) {
      return 29;
    }
    return daysInMonth[month - 1];
  };

  // Generate options for dropdowns
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year);
    }
    for (let year = currentYear + 1; year <= 2100; year++) {
      years.push(year);
    }
    return years.sort((a, b) => b - a); // Newest first
  };

  const generateMonthOptions = () => {
    const months = [
      { value: 1, label: '1月 (正月)' },
      { value: 2, label: '2月' },
      { value: 3, label: '3月' },
      { value: 4, label: '4月' },
      { value: 5, label: '5月' },
      { value: 6, label: '6月' },
      { value: 7, label: '7月' },
      { value: 8, label: '8月' },
      { value: 9, label: '9月' },
      { value: 10, label: '10月' },
      { value: 11, label: '11月' },
      { value: 12, label: '12月 (臘月)' },
    ];
    return months;
  };

  const generateDayOptions = () => {
    const daysInCurrentMonth = getDaysInMonth(input.year, input.month);
    const days = [];
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const generateHourOptions = () => {
    const hours = [];
    const hourNames = [
      '子時 (23:00-01:00)', '丑時 (01:00-03:00)', '寅時 (03:00-05:00)', '卯時 (05:00-07:00)',
      '辰時 (07:00-09:00)', '巳時 (09:00-11:00)', '午時 (11:00-13:00)', '未時 (13:00-15:00)',
      '申時 (15:00-17:00)', '酉時 (17:00-19:00)', '戌時 (19:00-21:00)', '亥時 (21:00-23:00)'
    ];
    
    for (let hour = 0; hour < 24; hour++) {
      const hourName = hourNames[Math.floor(hour / 2)];
      hours.push({
        value: hour,
        label: `${hour.toString().padStart(2, '0')}:00 (${hourName})`
      });
    }
    return hours;
  };

  // Adjust day if it's invalid for the new month/year
  useEffect(() => {
    const maxDays = getDaysInMonth(input.year, input.month);
    if (input.day > maxDays) {
      setInput(prev => ({ ...prev, day: maxDays }));
    }
  }, [input.year, input.month]);

  const validateInput = (): boolean => {
    const newErrors: Partial<BaziInput> = {};

    if (input.year < 1900 || input.year > 2100) {
      newErrors.year = 1;
    }
    if (input.month < 1 || input.month > 12) {
      newErrors.month = 1;
    }
    if (input.day < 1 || input.day > getDaysInMonth(input.year, input.month)) {
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

  const selectVariants = {
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
    { 
      key: 'year', 
      label: '年份', 
      icon: '📅', 
      description: '出生年份 (1900-2100)',
      options: generateYearOptions().map(year => ({ value: year, label: `${year}年` }))
    },
    { 
      key: 'month', 
      label: '月份', 
      icon: '🗓️', 
      description: '出生月份',
      options: generateMonthOptions()
    },
    { 
      key: 'day', 
      label: '日期', 
      icon: '📆', 
      description: '出生日期',
      options: generateDayOptions().map(day => ({ value: day, label: `${day}日` }))
    },
    { 
      key: 'hour', 
      label: '時辰', 
      icon: '🕐', 
      description: '出生時辰',
      options: generateHourOptions()
    },
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
              請選擇您的出生時間，讓 AI 為您解讀命運密碼
            </p>
            <p className="text-sm text-slate-400">
              我們將使用傳統八字計算方法結合現代 AI 技術為您分析
            </p>
          </motion.div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Enhanced Select Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {formFields.map(({ key, label, icon, description, options }, index) => (
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
                  
                  {/* Enhanced select field */}
                  <div className="relative group">
                    <motion.select
                      variants={selectVariants}
                      whileFocus="focused"
                      initial="unfocused"
                      animate="unfocused"
                      className={`cyber-input w-full p-4 text-lg font-semibold cursor-pointer ${
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
                    >
                      {options.map((option) => (
                        <option 
                          key={option.value} 
                          value={option.value}
                          className="bg-slate-800 text-white py-2"
                        >
                          {option.label}
                        </option>
                      ))}
                    </motion.select>
                    
                    {/* Custom dropdown arrow */}
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <motion.div
                        animate={{ rotate: [0, 180, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="text-cyan-400"
                      >
                        ▼
                      </motion.div>
                    </div>
                    
                    {/* Description */}
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
                        <span>請選擇有效的{label}</span>
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
                { icon: '🎯', title: '智能驗證', desc: '自動防止無效日期' },
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