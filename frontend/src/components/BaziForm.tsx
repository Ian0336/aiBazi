"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BaziInput, BaziChart } from '@/types/bazi';

interface BaziFormProps {
  onCalculate: (chart: BaziChart, input: BaziInput) => void;
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
  const [internalLoading, setInternalLoading] = useState(false);

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
    return years.sort((a, b) => b - a);
  };

  const generateMonthOptions = () => {
    const months = [
      { value: 1, label: '正月', chinese: '一月' },
      { value: 2, label: '二月', chinese: '二月' },
      { value: 3, label: '三月', chinese: '三月' },
      { value: 4, label: '四月', chinese: '四月' },
      { value: 5, label: '五月', chinese: '五月' },
      { value: 6, label: '六月', chinese: '六月' },
      { value: 7, label: '七月', chinese: '七月' },
      { value: 8, label: '八月', chinese: '八月' },
      { value: 9, label: '九月', chinese: '九月' },
      { value: 10, label: '十月', chinese: '十月' },
      { value: 11, label: '十一月', chinese: '十一月' },
      { value: 12, label: '十二月', chinese: '十二月' },
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
      { name: '子時', time: '23:00-01:00', animal: '🐭' },
      { name: '丑時', time: '01:00-03:00', animal: '🐂' },
      { name: '寅時', time: '03:00-05:00', animal: '🐅' },
      { name: '卯時', time: '05:00-07:00', animal: '🐰' },
      { name: '辰時', time: '07:00-09:00', animal: '🐲' },
      { name: '巳時', time: '09:00-11:00', animal: '🐍' },
      { name: '午時', time: '11:00-13:00', animal: '🐴' },
      { name: '未時', time: '13:00-15:00', animal: '🐑' },
      { name: '申時', time: '15:00-17:00', animal: '🐒' },
      { name: '酉時', time: '17:00-19:00', animal: '🐓' },
      { name: '戌時', time: '19:00-21:00', animal: '🐕' },
      { name: '亥時', time: '21:00-23:00', animal: '🐷' }
    ];
    
    for (let hour = 0; hour < 24; hour++) {
      const hourInfo = hourNames[Math.floor(hour / 2)];
      hours.push({
        value: hour,
        label: `${hour.toString().padStart(2, '0')}:00`,
        chinese: `${hourInfo.name} (${hourInfo.time})`,
        animal: hourInfo.animal
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

    setInternalLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bazi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      if (response.ok) {
        const chart = await response.json();
        console.log("chart", chart);
        onCalculate(chart, input);
      } else {
        console.error('Failed to calculate Bazi');
      }
    } catch (error) {
      console.error('Error calculating Bazi:', error);
    } finally {
      setInternalLoading(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const loading = isLoading || internalLoading;

  return (
    <motion.form
      variants={itemVariants}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Form Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Year Selection */}
        <motion.div variants={itemVariants} className="space-y-3">
          <label className="block text-sm font-medium chinese-text text-gray-700 flex items-center gap-2">
            <span className="text-lg">📅</span>
            <span>出生年份</span>
            <span className="text-xs text-gray-500">(西元)</span>
          </label>
          <select
            value={input.year}
            onChange={(e) => setInput(prev => ({ ...prev, year: parseInt(e.target.value) }))}
            className={`input-chinese ${errors.year ? 'border-red-500' : ''}`}
            disabled={loading}
          >
            {generateYearOptions().map(year => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
        </motion.div>

        {/* Month Selection */}
        <motion.div variants={itemVariants} className="space-y-3">
          <label className="block text-sm font-medium chinese-text text-gray-700 flex items-center gap-2">
            <span className="text-lg">🗓️</span>
            <span>出生月份</span>
          </label>
          <select
            value={input.month}
            onChange={(e) => setInput(prev => ({ ...prev, month: parseInt(e.target.value) }))}
            className={`input-chinese ${errors.month ? 'border-red-500' : ''}`}
            disabled={loading}
          >
            {generateMonthOptions().map(month => (
              <option key={month.value} value={month.value}>
                {month.chinese}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Day Selection */}
        <motion.div variants={itemVariants} className="space-y-3">
          <label className="block text-sm font-medium chinese-text text-gray-700 flex items-center gap-2">
            <span className="text-lg">📆</span>
            <span>出生日期</span>
          </label>
          <select
            value={input.day}
            onChange={(e) => setInput(prev => ({ ...prev, day: parseInt(e.target.value) }))}
            className={`input-chinese ${errors.day ? 'border-red-500' : ''}`}
            disabled={loading}
          >
            {generateDayOptions().map(day => (
              <option key={day} value={day}>
                {day}日
              </option>
            ))}
          </select>
        </motion.div>

        {/* Hour Selection */}
        <motion.div variants={itemVariants} className="space-y-3">
          <label className="block text-sm font-medium chinese-text text-gray-700 flex items-center gap-2">
            <span className="text-lg">🕐</span>
            <span>出生時辰</span>
            <span className="text-xs text-gray-500">(24小時制)</span>
          </label>
          <select
            value={input.hour}
            onChange={(e) => setInput(prev => ({ ...prev, hour: parseInt(e.target.value) }))}
            className={`input-chinese ${errors.hour ? 'border-red-500' : ''}`}
            disabled={loading}
          >
            {generateHourOptions().map(hour => (
              <option key={hour.value} value={hour.value}>
                {hour.animal} {hour.label} - {hour.chinese}
              </option>
            ))}
          </select>
        </motion.div>
      </div>

      {/* Current Selection Display */}
      <motion.div 
        variants={itemVariants}
        className="chinese-card p-4 bg-gradient-to-r from-red-50 to-yellow-50"
      >
        <div className="text-center chinese-text">
          <p className="text-sm text-gray-600 mb-2">您選擇的出生時間：</p>
          <p className="text-lg font-semibold text-gray-800">
            西元 {input.year}年 {input.month}月 {input.day}日 {input.hour}時
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {generateHourOptions().find(h => h.value === input.hour)?.chinese}
          </p>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.div variants={itemVariants} className="text-center">
        <button
          type="submit"
          disabled={loading}
          className={`btn-chinese w-full md:w-auto min-w-[200px] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>正在推算命盤...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span>🔮</span>
              <span>開始推算八字</span>
              <span>🔮</span>
            </div>
          )}
        </button>
      </motion.div>

      {/* Additional Information */}
      <motion.div 
        variants={itemVariants}
        className="text-center chinese-text text-sm text-gray-500 space-y-2"
      >
        <div className="flex justify-center items-center gap-2">
          <span>⭐</span>
          <span>時間越準確，分析結果越精確</span>
          <span>⭐</span>
        </div>
        <p>八字命理以出生時間的天干地支為基礎進行分析</p>
      </motion.div>
    </motion.form>
  );
};

export default BaziForm; 