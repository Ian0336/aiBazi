"use client";

import { motion } from 'framer-motion';
import { BaziChart } from '@/types/bazi';
import { Gan2Wuxing, Zhi2Wuxing } from '@/util/toWuxing';
import { convertToROCDate } from '@/util/bazi';
import React from 'react';
import FloatingToolMenu from './FloatingToolMenu';

interface TraditionalBaziChartProps {
  chart: BaziChart;
}

// Get element styling - Updated to use global CSS classes
const getElementClass = (element: string) => {
  const classMap: Record<string, string> = {
    '木': 'element-wood',
    '火': 'element-fire', 
    '土': 'element-earth',  
    '金': 'element-metal',
    '水': 'element-water'
  };
  return classMap[element] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const TraditionalBaziChart: React.FC<TraditionalBaziChartProps> = ({ chart }) => {
  
  // Calculate current age
  const currentYear = new Date().getFullYear();
  const birthYear = parseInt(chart.solar_date.split('年')[0]);
  const age = currentYear - birthYear + 1;

  // Get zodiac information
  const getZodiac = (yearZhi: string) => {
    const zodiacMap: Record<string, { name: string; icon: string }> = {
      '子': { name: '鼠', icon: '🐭' }, '丑': { name: '牛', icon: '🐂' }, 
      '寅': { name: '虎', icon: '🐅' }, '卯': { name: '兔', icon: '🐰' },
      '辰': { name: '龍', icon: '🐲' }, '巳': { name: '蛇', icon: '🐍' }, 
      '午': { name: '馬', icon: '🐴' }, '未': { name: '羊', icon: '🐑' }, 
      '申': { name: '猴', icon: '🐒' }, '酉': { name: '雞', icon: '🐓' }, 
      '戌': { name: '狗', icon: '🐕' }, '亥': { name: '豬', icon: '🐷' }
    };
    return zodiacMap[yearZhi] || { name: '未知', icon: '❓' };
  };

  const zodiacInfo = getZodiac(chart.year_pillar.zhi);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <>
      <FloatingToolMenu chart={chart} />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <motion.div 
          variants={itemVariants}
          className="chinese-card p-6 text-center brush-border"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold chinese-title mb-4">
              命盤資料
            </h1>
            
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm chinese-text">
              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded border">
                <span>生辰：</span>
                <span className="font-semibold">{chart.solar_date}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded border">
                <span>農曆：</span>
                <span className="font-semibold">{convertToROCDate(chart.lunar_date)}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded border">
                <span className="text-xl">{zodiacInfo.icon}</span>
                <span className="font-semibold">{zodiacInfo.name}年</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded border">
                <span>現年：</span>
                <span className="font-semibold">{age}歲</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Bazi Chart Table */}
        <motion.div 
          variants={itemVariants}
          className="chinese-card p-1 md:p-6 brush-border"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl chinese-title mb-2">八字排盤</h2>
            {/* Simple ink divider */}
            <div className="w-16 h-0.5 bg-gray-400 mx-auto opacity-50"></div>
          </div>

          <div className="chinese-text">
            <div className="bg-white rounded border overflow-hidden">
              <table className="w-full border-collapse text-lg md:text-2xl">
                {/* Header Row */}
                <thead>
                  <tr className="bg-gray-50 border-b text-sm md:text-lg">
                    <th className="p-2 text-center font-bold text-gray-700 ">流年</th>
                    <th className="p-2 text-center font-bold text-gray-700 ">大運</th>
                    <th className="p-2 text-center font-bold text-gray-700 border-l border-gray-300">時柱</th>
                    <th className="p-2 text-center font-bold text-gray-700 ">日柱</th>
                    <th className="p-2 text-center font-bold text-gray-700 ">月柱</th>
                    <th className="p-2 text-center font-bold text-gray-700 ">年柱</th>
                    <th className="p-2 text-left font-bold text-gray-700  w-8 md:w-12"></th>
                  </tr>
                </thead>
                <tbody>
                    {/* Main Stars Row */}
                    <tr className="border-b border-gray-100">
                      <td className="p-1 text-center">
                        <div className="text-gray-600 text-sm font-medium ">
                          {chart.liunian_pillar?.gan_ten_deity || '-'}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="text-gray-600 text-sm font-medium ">
                          {chart.dayun_pillar?.gan_ten_deity || '-'}
                        </div>
                      </td>
                      <td className="p-1 text-center border-l border-gray-300">
                        <div className="text-gray-600 text-sm font-medium ">
                          {chart.hour_pillar.ten_deity}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="text-gray-600 text-sm font-medium ">
                          {chart.day_pillar.ten_deity}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="text-gray-600 text-sm font-medium ">
                          {chart.month_pillar.ten_deity}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="text-gray-600 text-sm font-medium ">
                          {chart.year_pillar.ten_deity}
                        </div>
                      </td>
                      <td className="p-2 font-semibold text-gray-700  bg-gray-50 text-sm">主星</td>
                    </tr>


                    {/* Heavenly Stems Row */}
                    <tr className="border-b border-gray-100 text-3xl">
                      <td className="p-1 text-center">
                        {chart.liunian_pillar && (
                          <div className={`inline-block px-2 py-1 rounded  font-bold ${getElementClass(Gan2Wuxing(chart.liunian_pillar.gan))}`}>
                            {chart.liunian_pillar.gan}
                          </div>
                        )}
                      </td>
                      <td className="p-1 text-center">
                        {chart.dayun_pillar && (
                          <div className={`inline-block px-2 py-1 rounded  font-bold ${getElementClass(Gan2Wuxing(chart.dayun_pillar.gan))}`}>
                            {chart.dayun_pillar.gan}
                          </div>
                        )}
                      </td>
                      <td className="p-1 text-center border-l border-gray-300">
                        <div className={`inline-block px-2 py-1 rounded  font-bold ${getElementClass(chart.hour_pillar.gan_wuxing)}`}>
                          {chart.hour_pillar.gan}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className={`inline-block px-2 py-1 rounded  font-bold ${getElementClass(chart.day_pillar.gan_wuxing)}`}>
                          {chart.day_pillar.gan}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className={`inline-block px-2 py-1 rounded  font-bold ${getElementClass(chart.month_pillar.gan_wuxing)}`}>
                          {chart.month_pillar.gan}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className={`inline-block px-2 py-1 rounded  font-bold ${getElementClass(chart.year_pillar.gan_wuxing)}`}>
                          {chart.year_pillar.gan}
                        </div>
                      </td>
                      <td className="p-2 font-semibold text-gray-700  bg-gray-50 text-base md:text-xl">天干</td>
                    </tr>

                    {/* Earthly Branches Row */}
                    <tr className="border-b border-gray-100 text-3xl">
                      <td className="p-1 text-center">
                        {chart.liunian_pillar && (
                          <div className={`inline-block px-2 py-1 rounded  font-bold ${getElementClass(Zhi2Wuxing(chart.liunian_pillar.zhi))}`}>
                            {chart.liunian_pillar.zhi}
                          </div>
                        )}
                      </td>
                      <td className="p-1 text-center">
                        {chart.dayun_pillar && (
                          <div className={`inline-block px-2 py-1 rounded  font-bold ${getElementClass(Zhi2Wuxing(chart.dayun_pillar.zhi))}`}>
                            {chart.dayun_pillar.zhi}
                          </div>
                        )}
                      </td>
                      <td className="p-1 text-center border-l border-gray-300">
                        <div className={`inline-block px-2 py-1 rounded  font-bold ${getElementClass(chart.hour_pillar.zhi_wuxing)}`}>
                          {chart.hour_pillar.zhi}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className={`inline-block px-2 py-1 rounded  font-bold ${getElementClass(chart.day_pillar.zhi_wuxing)}`}>
                          {chart.day_pillar.zhi}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className={`inline-block px-2 py-1 rounded  font-bold ${getElementClass(chart.month_pillar.zhi_wuxing)}`}>
                          {chart.month_pillar.zhi}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className={`inline-block px-2 py-1 rounded  font-bold ${getElementClass(chart.year_pillar.zhi_wuxing)}`}>
                          {chart.year_pillar.zhi}
                        </div>
                      </td>
                      <td className="p-2 font-semibold text-gray-700  bg-gray-50 text-base md:text-xl">地支</td>
                    </tr>

                    {/* Star Fortune Row */}
                    <tr className="border-b border-gray-100">
                      <td className="p-1 text-center  text-gray-600 text-sm font-medium">
                        {chart.liunian_pillar?.zhi_ten_deity || '-'}
                      </td>
                      <td className="p-1 text-center  text-gray-600 text-sm font-medium">
                        {chart.dayun_pillar?.zhi_ten_deity || '-'}
                      </td>
                      <td className="p-1 text-center  text-gray-600 text-sm font-medium border-l border-gray-300">
                        {chart.hour_pillar.zhi_ten_deity}
                      </td>
                      <td className="p-1 text-center  text-gray-600 text-sm font-medium">
                        {chart.day_pillar.zhi_ten_deity}
                      </td>
                      <td className="p-1 text-center  text-gray-600 text-sm font-medium">
                        {chart.month_pillar.zhi_ten_deity}
                      </td>
                      <td className="p-1 text-center  text-gray-600 text-sm font-medium">
                        {chart.year_pillar.zhi_ten_deity}
                      </td>
                      <td className="p-2 font-semibold text-gray-700  bg-gray-50 text-sm">星運</td>
                    </tr>

                    {/* Hidden Stems Row */}
                    <tr className="border-b border-gray-100 align-top">
                      <td className="p-1 text-center">
                        {chart.liunian_pillar && (
                          <div className="flex flex-col gap-1 items-center">
                            {chart.liunian_pillar.hidden_stems.map((stem, idx) => (
                              <div key={idx} className={`px-1 py-0.5 rounded text-xs ${getElementClass(Gan2Wuxing(stem.gan))}`}>
                                {stem.gan} <span className="text-gray-500 scale-75 inline-block">({stem.ten_deity})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-1 text-center">
                        {chart.dayun_pillar && (
                          <div className="flex flex-col gap-1 items-center">
                            {chart.dayun_pillar.hidden_stems.map((stem, idx) => (
                              <div key={idx} className={`px-1 py-0.5 rounded text-xs ${getElementClass(Gan2Wuxing(stem.gan))}`}>
                                {stem.gan} <span className="text-gray-500 scale-75 inline-block">({stem.ten_deity})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-1 text-center border-l border-gray-300">
                        <div className="flex flex-col gap-1 items-center">
                          {chart.hour_pillar.hidden_stems.map((stem, idx) => (
                            <div key={idx} className={`px-1 py-0.5 rounded text-xs ${getElementClass(Gan2Wuxing(stem.gan))}`}>
                              {stem.gan} <span className="text-gray-500 scale-75 inline-block">({stem.ten_deity})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          {chart.day_pillar.hidden_stems.map((stem, idx) => (
                            <div key={idx} className={`px-1 py-0.5 rounded text-xs ${getElementClass(Gan2Wuxing(stem.gan))}`}>
                              {stem.gan} <span className="text-gray-500 scale-75 inline-block">({stem.ten_deity})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          {chart.month_pillar.hidden_stems.map((stem, idx) => (
                            <div key={idx} className={`px-1 py-0.5 rounded text-xs ${getElementClass(Gan2Wuxing(stem.gan))}`}>
                              {stem.gan} <span className="text-gray-500 scale-75 inline-block">({stem.ten_deity})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          {chart.year_pillar.hidden_stems.map((stem, idx) => (
                            <div key={idx} className={`px-1 py-0.5 rounded text-xs ${getElementClass(Gan2Wuxing(stem.gan))}`}>
                              {stem.gan} <span className="text-gray-500 scale-75 inline-block">({stem.ten_deity})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-2 font-semibold text-gray-700  bg-gray-50 align-middle text-sm">藏干</td>
                    </tr>

                    {/* Nayin Row */}
                    <tr className="border-b border-gray-100">
                      <td className={`p-1 text-center text-sm ${chart.liunian_pillar ? getElementClass(chart.liunian_pillar.nayin[chart.liunian_pillar.nayin.length - 1]) : ''}`}>
                        <div className="">{chart.liunian_pillar?.nayin || '-'}</div>
                      </td>
                      <td className={`p-1 text-center text-sm ${chart.dayun_pillar ? getElementClass(chart.dayun_pillar.nayin[chart.dayun_pillar.nayin.length - 1]) : ''}`}>
                        <div className="">{chart.dayun_pillar?.nayin || '-'}</div>
                      </td>
                      <td className={`p-1 text-center text-sm border-l border-gray-300 ${getElementClass(chart.hour_pillar.nayin[chart.hour_pillar.nayin.length - 1])}`}>
                        <div className="">{chart.hour_pillar.nayin}</div>
                      </td>
                      <td className={`p-1 text-center text-sm ${getElementClass(chart.day_pillar.nayin[chart.day_pillar.nayin.length - 1])}`}>
                        <div className="">{chart.day_pillar.nayin}</div>
                      </td>
                      <td className={`p-1 text-center text-sm ${getElementClass(chart.month_pillar.nayin[chart.month_pillar.nayin.length - 1])}`}>
                        <div className="">{chart.month_pillar.nayin}</div>
                      </td>
                      <td className={`p-1 text-center text-sm ${getElementClass(chart.year_pillar.nayin[chart.year_pillar.nayin.length - 1])}`}>
                        <div className="">{chart.year_pillar.nayin}</div>
                      </td>
                      <td className="p-2 font-semibold text-gray-700  bg-gray-50 text-sm">納音</td>
                    </tr>

                    {/* shensha Row */}
                    <tr className="align-top text-xs">
                      {[chart.liunian_pillar?.shensha, chart.dayun_pillar?.shensha, chart.hour_pillar.shensha, chart.day_pillar.shensha, chart.month_pillar.shensha, chart.year_pillar.shensha].map((shensha, i) => (
                         <td key={i} className={`p-1 text-center ${i === 2 ? 'border-l border-gray-300' : ''}`}>
                           <div className="flex flex-col gap-0.5 items-center">
                             {shensha && shensha.length > 0 ? (
                               shensha.map((star, idx) => (
                                 <div key={idx} className="text-gray-600 px-1 py-0.5 bg-gray-50 border border-gray-200 rounded">
                                   {star}
                                 </div>
                               ))
                             ) : (
                               <div className="text-gray-300">-</div>
                             )}
                           </div>
                         </td>
                      ))}
                      <td className="p-2 font-semibold text-gray-700 bg-gray-50 align-middle text-sm">神煞</td>
                    </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Fortune Periods Section */}
        {chart.dayun && chart.dayun.length > 0 && (
          <motion.div 
            variants={itemVariants}
            className="chinese-card p-1 md:p-6 brush-border"
          >
            <DayunCard chart={chart} />
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

const DayunCard = ({ chart }: { chart: BaziChart }) => {
  const [currentDayunIdx, setCurrentDayunIdx] = React.useState(() => {
    if (chart.dayun_pillar) {
      const idx = chart.dayun.findIndex(du => du.gan === chart.dayun_pillar!.gan && du.zhi === chart.dayun_pillar!.zhi)
      if (idx !== -1) return idx
    }
    return 0
  })

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl chinese-title mb-2">大運流年</h2>
        <div className="w-16 h-0.5 bg-gray-400 mx-auto opacity-50"></div>
      </div>

      {/* Major Fortune Periods */}
      <div className="mb-6">
        <h3 className="text-sm md:text-lg chinese-text font-semibold mb-4 text-gray-700">大運</h3>
        <div className="grid grid-cols-9 md:gap-3">
          {chart.dayun.slice(0, 9).map((dayun, idx) => (
            <div 
              key={idx} 
              className={`
                chinese-card p-1 md:p-3 text-center border cursor-pointer transition-all
                ${currentDayunIdx === idx ? 'border-2 border-red-800 bg-red-50' : 'hover:border-red-300'}
              `}
              onClick={() => {
                setCurrentDayunIdx(idx);
              }}
            >
              <div className="text-xs text-gray-500 mb-1">{dayun.liunian[0].year} </div>
              <div className="text-xs text-gray-500 mb-1">{dayun.start_age}歲</div>
              <div className="space-y-1 md:space-y-2">
                <div className={`px-1 md:px-2 py-1 rounded text-xs md:text-sm font-bold ${getElementClass(Gan2Wuxing(dayun.gan))}`}>
                  {dayun.gan}
                </div>
                <div className={`px-1 md:px-2 py-1 rounded text-xs md:text-sm font-bold ${getElementClass(Zhi2Wuxing(dayun.zhi))}`}>
                  {dayun.zhi}
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-1 font-medium">
                {dayun.gan_ten_deity}
              </div>
              <div className="text-xs text-gray-600 mt-1 font-medium">
                {dayun.zhi_ten_deity}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Year Fortune */}
      <div>
        <h3 className="text-sm md:text-lg chinese-text font-semibold mb-4 text-gray-700">流年</h3>
        <div className="grid grid-cols-10 md:gap-2">
          {chart.dayun[currentDayunIdx]?.liunian?.slice(0, 10).map((liunian, idx) => (
            <div 
              key={idx} 
              className="chinese-card p-1 md:p-2 text-center border text-xs"
            >
              <div className="text-gray-500 mb-1">{liunian.year}</div>
              <div className="text-xs text-gray-500 mb-1">{liunian.age}歲</div>
              <div className={`px-1 py-0.5 rounded text-xs font-bold ${getElementClass(Gan2Wuxing(liunian.gan))}`}>
                {liunian.gan}
              </div>
              <div className={`px-1 py-0.5 rounded text-xs font-bold mt-0.5 ${getElementClass(Zhi2Wuxing(liunian.zhi))}`}>
                {liunian.zhi}
              </div>
              <div className="text-gray-600 mt-0.5 font-medium text-xs">
                {liunian.gan_ten_deity}
              </div>
              <div className="text-gray-600 mt-0.5 font-medium text-xs">
                {liunian.zhi_ten_deity}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
export default TraditionalBaziChart; 