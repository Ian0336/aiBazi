"use client";

import { motion } from 'framer-motion';
import { BaziChart, BaziInput } from '@/types/bazi';

interface TraditionalBaziChartProps {
  chart: BaziChart;
  originalInput: BaziInput;
}

const TraditionalBaziChart: React.FC<TraditionalBaziChartProps> = ({ chart, originalInput }) => {
  // Generate sample dayun data (大運) - in a real app, this would come from the backend
  const generateDayun = () => {
    // This is placeholder data - in reality this would be calculated properly
    const dayunPillars = ['甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'];
    return dayunPillars;
  };

  const pillars = [
    { label: '年柱', pillar: chart.year_pillar },
    { label: '月柱', pillar: chart.month_pillar },
    { label: '日柱', pillar: chart.day_pillar },
    { label: '時柱', pillar: chart.hour_pillar }
  ];

  const dayunData = generateDayun();

  return (
    <motion.div 
      className="text-black traditional-bazi-chart bg-gradient-to-br from-amber-50 to-yellow-100 p-6 rounded-lg shadow-xl border-2 border-amber-300"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center border-b-2 border-amber-400 pb-4 mb-4">
        <h2 className="text-2xl font-bold text-amber-900 mb-2">八字命盤</h2>
      </div>

      {/* Basic Info Row */}
      <div className="text-center border-b border-amber-300 pb-2 mb-2">
        <span className="text-amber-800 font-medium">
          出生時間：西元 {originalInput.year} 年 {originalInput.month} 月 {originalInput.day} 日 {originalInput.hour} 時
        </span>
      </div>

      {/* Date Info Grid */}
      <div className="grid grid-cols-11 gap-1 mb-4 text-center">
        {/* 民國 row */}
        <div className="text-sm bg-amber-200 p-1 border border-amber-400">民</div>
        <div className="text-sm bg-amber-200 p-1 border border-amber-400">國</div>
        <div className="text-sm bg-amber-200 p-1 border border-amber-400">{originalInput.year - 1911}</div>
        <div className="text-sm bg-amber-200 p-1 border border-amber-400">年</div>
        <div className="text-sm bg-amber-200 p-1 border border-amber-400">{originalInput.month}</div>
        <div className="text-sm bg-amber-200 p-1 border border-amber-400">月</div>
        <div className="text-sm bg-amber-200 p-1 border border-amber-400">{originalInput.day}</div>
        <div className="text-sm bg-amber-200 p-1 border border-amber-400">日</div>
        <div className="text-sm bg-amber-200 p-1 border border-amber-400">{originalInput.hour}</div>
        <div className="text-sm bg-amber-200 p-1 border border-amber-400">時</div>
        <div className="text-sm bg-amber-200 p-1 border border-amber-400">生</div>
      </div>

      {/* Lunar Date */}
      <div className="grid grid-cols-11 gap-1 mb-4 text-center">
        <div className="text-sm bg-amber-200 p-1 border border-amber-400">農</div>
        <div className="text-sm bg-amber-200 p-1 border border-amber-400">曆</div>
        <div className="text-sm bg-amber-200 p-1 border border-amber-400 col-span-9">
          {chart.lunar_date}
        </div>
      </div>

      {/* Additional Info Section */}
      {/* <div className="grid grid-cols-7 gap-2 mb-4">
        <div className="text-center">
          <div className="text-xs bg-amber-100 p-1 border border-amber-300">星座</div>
          <div className="text-xs bg-white p-1 border border-amber-300">雙魚</div>
        </div>
        <div className="text-center">
          <div className="text-xs bg-amber-100 p-1 border border-amber-300">日空</div>
          <div className="text-xs bg-white p-1 border border-amber-300">申酉</div>
        </div>
        <div className="text-center">
          <div className="text-xs bg-amber-100 p-1 border border-amber-300">年空</div>
          <div className="text-xs bg-white p-1 border border-amber-300">申酉</div>
        </div>
        <div className="text-center">
          <div className="text-xs bg-amber-100 p-1 border border-amber-300">胎息</div>
          <div className="text-xs bg-white p-1 border border-amber-300">癸亥</div>
        </div>
        <div className="text-center">
          <div className="text-xs bg-amber-100 p-1 border border-amber-300">命宮</div>
          <div className="text-xs bg-white p-1 border border-amber-300">庚申</div>
        </div>
        <div className="text-center">
          <div className="text-xs bg-amber-100 p-1 border border-amber-300">胎元</div>
          <div className="text-xs bg-white p-1 border border-amber-300">丙午</div>
        </div>
        <div className="text-center">
          <div className="text-xs bg-amber-100 p-1 border border-amber-300">身宮</div>
          <div className="text-xs bg-white p-1 border border-amber-300">壬戌</div>
        </div>
      </div> */}

      {/* Main Chart Section */}
      <div className="border-2 border-amber-400 rounded">
        {/* Main Stars Row */}
        <div className="grid grid-cols-5 border-b border-amber-300">
          <div className="text-center bg-amber-200 p-2 border-r border-amber-300 font-bold">主星</div>
          {pillars.map((pillar, index) => (
            <div key={index} className="text-center bg-amber-100 p-2 border-r border-amber-300 last:border-r-0">
              <span className="text-sm font-medium text-amber-800">{pillar.pillar.ten_deity}</span>
            </div>
          ))}
        </div>

        {/* Ganzhi Row */}
        <div className="grid grid-cols-5 border-b border-amber-300">
          <div className="text-center bg-amber-200 p-3 border-r border-amber-300 font-bold text-lg">八字</div>
          {pillars.map((pillar, index) => (
            <div key={index} className="text-center bg-white p-3 border-r border-amber-300 last:border-r-0">
              <span className="text-xl font-bold text-amber-900">{pillar.pillar.ganzhi}</span>
            </div>
          ))}
        </div>

        {/* Cang Gan (Hidden Stems) Row */}
        <div className="grid grid-cols-5 border-b border-amber-300">
          <div className="text-center bg-amber-200 p-2 border-r border-amber-300 font-bold">藏</div>
          {pillars.map((pillar, index) => {
            const hiddenStems = pillar.pillar.hidden_stems || [];
            return (
              <div key={index} className="text-center bg-amber-50 p-2 border-r border-amber-300 last:border-r-0">
                <div className="grid grid-cols-3 gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="text-xs">
                      {hiddenStems[i]?.gan || '　'}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Shi Shen (Ten Gods) Row */}
        <div className="grid grid-cols-5">
          <div className="text-center bg-amber-200 p-2 border-r border-amber-300 font-bold">副星</div>
          {pillars.map((pillar, index) => {
            const hiddenStems = pillar.pillar.hidden_stems || [];
            return (
              <div key={index} className="text-center bg-amber-50 p-2 border-r border-amber-300 last:border-r-0">
                <div className="grid grid-cols-3 gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="text-xs">
                      {hiddenStems[i]?.ten_deity || '　'}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dayun (Major Periods) Section */}
      <div className="mt-4 border-2 border-amber-400 rounded">
        <div className="grid grid-cols-11 border-b border-amber-300">
          <div className="text-center bg-amber-200 p-2 border-r border-amber-300 font-bold">大運</div>
          {dayunData.slice(0, 10).map((dayun, index) => (
            <div key={index} className="text-center bg-amber-100 p-2 border-r border-amber-300 last:border-r-0">
              <div className="text-xs mb-1">{11 + index * 10}</div>
              <hr className="border-amber-400 my-1" />
              <div className="text-xs font-medium">{dayun}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center mt-4 p-2 bg-amber-100 rounded border border-amber-300">
        <span className="text-sm text-amber-800">出生後10年0個月又9天上大運</span>
      </div>
    </motion.div>
  );
};

export default TraditionalBaziChart; 