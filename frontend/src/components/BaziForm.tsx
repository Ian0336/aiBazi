"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
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
    gender: 'male',
    is_lunar: false,
    is_leap_month: false,
  });

  interface FormErrors {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
  }

  const [errors, setErrors] = useState<FormErrors>({});
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
    
    // Helper function to get correct hour index
    const getHourIndex = (hour: number): number => {
      if (hour === 23) return 0; // 子時 (23:00)
      if (hour === 0) return 0;  // 子時 (00:00)
      return Math.floor((hour + 1) / 2);
    };
    
    for (let hour = 0; hour < 24; hour++) {
      const hourInfo = hourNames[getHourIndex(hour)];
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
    const newErrors: FormErrors = {};
    let hasErrors = false;

    if (input.year < 1900 || input.year > 2100) {
      newErrors.year = 1;
      toast.error('出生年份必須在 1900 年至 2100 年之間');
      hasErrors = true;
    }
    if (input.month < 1 || input.month > 12) {
      newErrors.month = 1;
      toast.error('請選擇正確的月份');
      hasErrors = true;
    }
    if (input.day < 1 || input.day > getDaysInMonth(input.year, input.month)) {
      newErrors.day = 1;
      toast.error('請選擇正確的日期');
      hasErrors = true;
    }
    if (input.hour < 0 || input.hour > 23) {
      newErrors.hour = 1;
      toast.error('請選擇正確的時辰');
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInput()) {
      return;
    }

    setInternalLoading(true);
    

    try {
      const apiUrl = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_API_BASE_URL_PROD : process.env.NEXT_PUBLIC_API_BASE_URL_DEV;
      if (!apiUrl) {
        throw new Error('API 配置錯誤，請聯繫管理員');
      }

      const response = await fetch(`${apiUrl}/bazi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        switch (response.status) {
          case 400:
            throw new Error(errorData.error || '輸入資料格式錯誤，請檢查填寫內容');
          case 404:
            throw new Error('服務暫時無法使用，請稍後再試');
          case 500:
            throw new Error('伺服器內部錯誤，請稍後再試');
          default:
            throw new Error(errorData.error || `請求失敗 (${response.status})`);
        }
      }

      const chart = await response.json();
      
      onCalculate(chart, input);
      
    } catch (error) {
      console.error('Error calculating Bazi:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('網路連接失敗，請檢查網路連線後重試');
      } else if (error instanceof Error) {
        if (error.message.includes('Invalid')) {
          toast.error('輸入資料錯誤，請檢查填寫內容');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('未知錯誤，請稍後再試');
      }
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
        {/* Gender Selection */}
        <motion.div variants={itemVariants} className="space-y-3">
          <label className="block text-sm font-medium chinese-text text-gray-700 flex items-center gap-2">
            <span className="text-lg">👤</span>
            <span>性別</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="male"
                checked={input.gender === 'male'}
                onChange={(e) => setInput(prev => ({ ...prev, gender: e.target.value }))}
                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                disabled={loading}
              />
              <span className="chinese-text text-gray-700">👨 男性</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="female"
                checked={input.gender === 'female'}
                onChange={(e) => setInput(prev => ({ ...prev, gender: e.target.value }))}
                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                disabled={loading}
              />
              <span className="chinese-text text-gray-700">👩 女性</span>
            </label>
          </div>
        </motion.div>

        {/* Calendar Type Selection */}
        <motion.div variants={itemVariants} className="space-y-3">
          <label className="block text-sm font-medium chinese-text text-gray-700 flex items-center gap-2">
            <span className="text-lg">📅</span>
            <span>曆法選擇</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="false"
                checked={!input.is_lunar}
                onChange={(e) => setInput(prev => ({ 
                  ...prev, 
                  is_lunar: false,
                  is_leap_month: false // Reset leap month when switching to solar
                }))}
                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                disabled={loading}
              />
              <span className="chinese-text text-gray-700">🗓️ 國曆</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="true"
                checked={input.is_lunar}
                onChange={(e) => setInput(prev => ({ 
                  ...prev, 
                  is_lunar: true,
                  is_leap_month: false // Reset leap month when switching to lunar
                }))}
                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                disabled={loading}
              />
              <span className="chinese-text text-gray-700">🌙 農曆</span>
            </label>
          </div>
        </motion.div>

        {/* Year Selection */}
        <motion.div variants={itemVariants} className="space-y-3">
          <label className="block text-sm font-medium chinese-text text-gray-700 flex items-center gap-2">
            <span className="text-lg">📅</span>
            <span>出生年份</span>
            <span className="text-xs text-gray-500">({input.is_lunar ? '農曆' : '西元'})</span>
          </label>
          <select
            value={input.year}
            onChange={(e) => setInput(prev => ({ ...prev, year: parseInt(e.target.value) }))}
            className={`input-chinese ${errors.year ? 'border-red-500' : ''}`}
            disabled={loading}
          >
            {generateYearOptions().map(year => (
              <option key={year} value={year}>
                {year}年 {year > 1911 ? `民國${year - 1911}年` : ''}
              </option>
            ))}
          </select>
        </motion.div>

                {/* Month Selection */}
        <motion.div variants={itemVariants} className="space-y-3">
          <div className={`flex gap-4 ${input.is_lunar ? 'items-start' : ''}`}>
            {/* Month Selection */}
            <div className={`space-y-3 ${input.is_lunar ? 'flex-1' : 'w-full'}`}>
              <label className="block text-sm font-medium chinese-text text-gray-700 flex items-center gap-2">
                <span className="text-lg">🗓️</span>
                <span>出生月份</span>
                {input.is_lunar && (
                  <span className="text-xs text-gray-500">(農曆)</span>
                )}
              </label>
              <select
                value={input.month}
                onChange={(e) => setInput(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                className={`input-chinese ${errors.month ? 'border-red-500' : ''}`}
                disabled={loading}
              >
                {generateMonthOptions().map(month => (
                  <option key={month.value} value={month.value}>
                    {input.is_lunar ? month.label : month.chinese}
                  </option>
                ))}
              </select>
            </div>

            {/* Leap Month Selection - Only show when lunar calendar is selected */}
            {input.is_lunar && (
              <div className="space-y-3 flex-1">
                <label className="block text-sm font-medium chinese-text text-gray-700 flex items-center gap-2">
                  <span className="text-lg">🌙</span>
                  <span>閏月</span>
                  <span className="text-xs text-gray-500">(如果該年該月有閏月)</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="false"
                      checked={!input.is_leap_month}
                      onChange={(e) => setInput(prev => ({ ...prev, is_leap_month: false }))}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      disabled={loading}
                    />
                    <span className="chinese-text text-gray-700">平月</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="true"
                      checked={input.is_leap_month}
                      onChange={(e) => setInput(prev => ({ ...prev, is_leap_month: true }))}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      disabled={loading}
                    />
                    <span className="chinese-text text-gray-700">閏月</span>
                  </label>
                </div>
              </div>
            )}
          </div>
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
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-lg font-semibold text-gray-800">
                {input.is_lunar ? '農曆' : '西元'} {input.year}年 {input.month}月{input.is_leap_month ? '(閏)' : ''} {input.day}日 {input.hour}時
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {generateHourOptions().find(h => h.value === input.hour)?.chinese}
              </p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {input.gender === 'male' ? '👨 男性' : '👩 女性'}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                {input.is_lunar ? '🌙 農曆' : '🗓️ 國曆'}
              </span>
            </div>
          </div>
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
        <div className="grid md:grid-cols-2 gap-4 mt-3 text-xs">
          <p>🌙 支援農曆與國曆日期轉換</p>
          <p>👥 性別會影響大運順逆排列</p>
        </div>
      </motion.div>
    </motion.form>
  );
};

export default BaziForm; 