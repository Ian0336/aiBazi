"use client";

import { motion } from 'framer-motion';
import { BaziInput } from '@/types/bazi';

interface StickyHeaderProps {
  input: BaziInput;
  onEdit: () => void;
}

const StickyHeader: React.FC<StickyHeaderProps> = ({ input, onEdit }) => {
  const formatDate = (input: BaziInput) => {
    const { year, month, day, hour } = input;
    const date = `${year}年${month}月${day}日`;
    
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

    const currentHourInfo = hourNames[getHourIndex(hour)];
    const time = `${hour.toString().padStart(2, '0')}:00`;
    
    return { date, time, hourInfo: currentHourInfo };
  };

  const { date, time, hourInfo } = formatDate(input);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 backdrop-blur-md bg-transparentshadow-lg fixed-header"
    >
      <div className="max-w-7xl mx-auto px-1 md:px-4 py-4">
        <div className="chinese-card p-4 bg-gradient-to-r from-red-50/30 via-yellow-50/30 to-orange-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* 日期信息 */}
              <div className="flex items-center gap-3">
                <div className="hidden md:flex w-12 h-12 chinese-card bg-gradient-to-br from-red-100 to-yellow-100 rounded-lg items-center justify-center">
                  <span className="text-xl">📅</span>
                </div>
                <div>
                  <div className="hidden md:block text-xs chinese-text text-gray-500 mb-1">
                    出生日期
                  </div>
                  <div className="text-lg font-bold chinese-text text-gray-800">
                    {date}
                  </div>
                </div>
              </div>
              
              {/* 時辰信息 */}
              <div className="flex items-center gap-3">
                <div className="hidden md:flex w-12 h-12 chinese-card bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg items-center justify-center">
                  <span className="text-xl">{hourInfo.animal}</span>
                </div>
                <div>
                  <div className="hidden md:block text-xs chinese-text text-gray-500 mb-1">
                    出生時辰
                  </div>
                  <div className="text-lg font-bold chinese-text text-gray-800">
                    {time} · {hourInfo.name}
                  </div>
                  <div className="hidden md:block text-xs chinese-text text-gray-600">
                    {hourInfo.time}
                  </div>
                </div>
              </div>

              {/* 裝飾元素 */}
              <div className="hidden md:flex items-center gap-2">
                <div className="w-1 h-8 bg-gradient-to-b from-red-400 to-yellow-500 rounded-full"></div>
                <div className="chinese-text text-sm text-gray-600 italic">
                  命由天定 · 運在人為
                </div>
              </div>
            </div>

            {/* 編輯按鈕 */}
            <motion.button
              onClick={onEdit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-chinese flex items-center px-2 py-1 gap-2 text-sm md:px-6 md:py-3"
            >
              <span className="text-lg">✏️</span>
              <span className="hidden md:block">重新計算</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StickyHeader; 