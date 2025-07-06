"use client";

import { motion } from 'framer-motion';
import { BaziChart } from '@/types/bazi';
import { Gan2Wuxing, Zhi2Wuxing } from '@/util/toWuxing';
import React from 'react';
interface TraditionalBaziChartProps {
  chart: BaziChart;
}
// Get element styling
const getElementClass = (element: string) => {
  const classMap: Record<string, string> = {
    '木': 'bg-green-100 text-green-800 border-green-200',
    '火': 'bg-red-100 text-red-800 border-red-200', 
    '土': 'bg-[#D7CCC8] text-[#4E342E] border-[#BCAAA4]',  
    '金': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    '水': 'bg-blue-100 text-blue-800 border-blue-200'
  };
  if (!classMap[element]) {
    console.log(element);
  }
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
      '辰': { name: '龙', icon: '🐲' }, '巳': { name: '蛇', icon: '🐍' }, 
      '午': { name: '马', icon: '🐴' }, '未': { name: '羊', icon: '🐑' }, 
      '申': { name: '猴', icon: '🐒' }, '酉': { name: '鸡', icon: '🐓' }, 
      '戌': { name: '狗', icon: '🐕' }, '亥': { name: '猪', icon: '🐷' }
    };
    return zodiacMap[yearZhi] || { name: '未知', icon: '❓' };
  };

  

  const zodiacInfo = getZodiac(chart.year_pillar.zhi);

  // Calculate current Dayun (Major Fortune Period)
  const getCurrentDayun = () => {
    if (!chart.dayun || chart.dayun.length === 0) return 0;
    
    for (let i = 0; i < chart.dayun.length; i++) {
      const dayun = chart.dayun[i];
      const nextDayun = chart.dayun[i + 1];
      
      if (nextDayun) {
        if (age >= dayun.start_age && age < nextDayun.start_age) {
          return i;
        }
      } else {
        // Last dayun period
        if (age >= dayun.start_age) {
          return i;
        }
      }
    }
    
    return 0; // Fallback to first period
  };

  // Calculate current Liunian (Annual Fortune)
  const getCurrentLiunian = () => {
    const currentDayunIdx = getCurrentDayun();
    const currentDayunData = chart.dayun[currentDayunIdx];
    if (!currentDayunData || !currentDayunData.liunian) return 0;
    
    const currentYear = new Date().getFullYear();
    const currentLiunianIdx = currentDayunData.liunian.findIndex(ln => ln.year === currentYear);
    
    return currentLiunianIdx !== -1 ? currentLiunianIdx : 0; // Fallback to first year in period
  };

  // State for selected dayun and liunian
  const [selectedDayunIdx, setSelectedDayunIdx] = React.useState(getCurrentDayun());
  const [selectedLiunianIdx, setSelectedLiunianIdx] = React.useState(getCurrentLiunian());
  
  const selectedDayun = chart.dayun[selectedDayunIdx];
  const selectedLiunian = chart.dayun[selectedDayunIdx]?.liunian[selectedLiunianIdx];

  // Print handler function
  const handlePrint = () => {
    window.print();
  };

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
      {/* Print Button */}
      <button
        onClick={handlePrint}
        className="print-button btn-chinese fixed bottom-4 right-4"
        title="列印八字命盤"
      >
        🖨️ 列印
      </button>

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
              <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-lg border">
                <span>生辰：</span>
                <span className="font-semibold">{chart.solar_date}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg border">
                <span>農曆：</span>
                <span className="font-semibold">{chart.lunar_date}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-lg border">
                <span className="text-xl">{zodiacInfo.icon}</span>
                <span className="font-semibold">{zodiacInfo.name}年</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg border">
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
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto"></div>
          </div>

          <div className="chinese-text">
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full border-collapse text-lg md:text-2xl">
                {/* Header Row */}
                <thead>
                  <tr className="bg-gray-50 border-b text-sm md:text-lg">
                    <th className="p-2 text-center font-bold text-gray-700 ">流年</th>
                    <th className="p-2 text-center font-bold text-gray-700 ">大運</th>
                    <th className="p-2 text-center font-bold text-gray-700 border-l-2 border-gray-400">時柱</th>
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
                        <div className="text-purple-700 font-medium ">
                          {selectedLiunian?.gan_ten_deity || '-'}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="text-purple-700 font-medium ">
                          {selectedDayun?.gan_ten_deity || '-'}
                        </div>
                      </td>
                      <td className="p-1 text-center border-l-2 border-gray-400">
                        <div className="text-purple-700 font-medium ">
                          {chart.hour_pillar.ten_deity}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="text-purple-700 font-medium ">
                          {chart.day_pillar.ten_deity}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="text-purple-700 font-medium ">
                          {chart.month_pillar.ten_deity}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="text-purple-700 font-medium ">
                          {chart.year_pillar.ten_deity}
                        </div>
                      </td>
                      <td className="p-2 font-semibold text-gray-700  bg-gray-50">主星</td>
                    </tr>


                                    {/* Heavenly Stems Row */}
                    <tr className="border-b border-gray-100 text-3xl">
                      <td className="p-1 text-center">
                        {selectedLiunian && (
                          <div className={`inline-block px-2 py-1 rounded  font-bold ${getElementClass(Gan2Wuxing(selectedLiunian.gan))}`}>
                            {selectedLiunian.gan}
                          </div>
                        )}
                      </td>
                      <td className="p-1 text-center">
                        {selectedDayun && (
                          <div className={`inline-block px-2 py-1 rounded  font-bold ${getElementClass(Gan2Wuxing(selectedDayun.gan))}`}>
                            {selectedDayun.gan}
                          </div>
                        )}
                      </td>
                      <td className="p-1 text-center border-l-2 border-gray-400">
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
                      <td className="p-2 font-semibold text-gray-700  bg-gray-50 text-lg md:text-2xl">天干</td>
                    </tr>

                                    {/* Earthly Branches Row */}
                    <tr className="border-b border-gray-100 text-3xl">
                      <td className="p-1 text-center">
                        {selectedLiunian && (
                          <div className={`inline-block px-2 py-1 rounded  font-bold ${getElementClass(Zhi2Wuxing(selectedLiunian.zhi))}`}>
                            {selectedLiunian.zhi}
                          </div>
                        )}
                      </td>
                      <td className="p-1 text-center">
                        {selectedDayun && (
                          <div className={`inline-block px-2 py-1 rounded  font-bold ${getElementClass(Zhi2Wuxing(selectedDayun.zhi))}`}>
                            {selectedDayun.zhi}
                          </div>
                        )}
                      </td>
                      <td className="p-1 text-center border-l-2 border-gray-400">
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
                      <td className="p-2 font-semibold text-gray-700  bg-gray-50 text-lg md:text-2xl">地支</td>
                    </tr>

                                    {/* Star Fortune Row */}
                    <tr className="border-b border-gray-100">
                      <td className="p-1 text-center  text-indigo-600 font-medium">
                        {selectedLiunian?.zhi_ten_deity || '-'}
                      </td>
                      <td className="p-1 text-center  text-indigo-600 font-medium">
                        {selectedDayun?.zhi_ten_deity || '-'}
                      </td>
                      <td className="p-1 text-center  text-indigo-600 font-medium border-l-2 border-gray-400">
                        {chart.hour_pillar.zhi_ten_deity}
                      </td>
                      <td className="p-1 text-center  text-indigo-600 font-medium">
                        {chart.day_pillar.zhi_ten_deity}
                      </td>
                      <td className="p-1 text-center  text-indigo-600 font-medium">
                        {chart.month_pillar.zhi_ten_deity}
                      </td>
                      <td className="p-1 text-center  text-indigo-600 font-medium">
                        {chart.year_pillar.zhi_ten_deity}
                      </td>
                      <td className="p-2 font-semibold text-gray-700  bg-gray-50">星運</td>
                    </tr>

                                    {/* Hidden Stems Row */}
                    <tr className="border-b border-gray-100 align-top">
                      <td className="p-1 text-center">
                        {selectedLiunian && (
                          <div className="flex flex-col gap-0.5">
                            {selectedLiunian.hidden_stems.map((stem, idx) => (
                              <div key={idx} className={` px-1 py-0.5 rounded ${getElementClass(Gan2Wuxing(stem.gan))}`}>
                                <div className="md:hidden">
                                  <div className="font-bold">{stem.gan}</div>
                                  <div className="text-gray-600 text-xs">({stem.ten_deity})</div>
                                </div>
                                <div className="hidden md:block">
                                  {stem.gan}
                                  <span className="text-gray-600 ml-1">({stem.ten_deity})</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-1 text-center">
                        {selectedDayun && (
                          <div className="flex flex-col gap-0.5">
                            {selectedDayun.hidden_stems.map((stem, idx) => (
                              <div key={idx} className={` px-1 py-0.5 rounded ${getElementClass(Gan2Wuxing(stem.gan))}`}>
                                <div className="md:hidden">
                                  <div className="font-bold">{stem.gan}</div>
                                  <div className="text-gray-600 text-xs">({stem.ten_deity})</div>
                                </div>
                                <div className="hidden md:block">
                                  {stem.gan}
                                  <span className="text-gray-600 ml-1">({stem.ten_deity})</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-1 text-center border-l-2 border-gray-400">
                        <div className="flex flex-col gap-0.5">
                          {chart.hour_pillar.hidden_stems.map((stem, idx) => (
                            <div key={idx} className={` px-1 py-0.5 rounded ${getElementClass(Gan2Wuxing(stem.gan))}`}>
                              <div className="md:hidden">
                                <div className="font-bold">{stem.gan}</div>
                                <div className="text-gray-600 text-xs">({stem.ten_deity})</div>
                              </div>
                              <div className="hidden md:block">
                                {stem.gan}
                                <span className="text-gray-600 ml-1">({stem.ten_deity})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="flex flex-col gap-0.5">
                          {chart.day_pillar.hidden_stems.map((stem, idx) => (
                            <div key={idx} className={` px-1 py-0.5 rounded ${getElementClass(Gan2Wuxing(stem.gan))}`}>
                              <div className="md:hidden">
                                <div className="font-bold">{stem.gan}</div>
                                <div className="text-gray-600 text-xs">({stem.ten_deity})</div>
                              </div>
                              <div className="hidden md:block">
                                {stem.gan}
                                <span className="text-gray-600 ml-1">({stem.ten_deity})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="flex flex-col gap-0.5">
                          {chart.month_pillar.hidden_stems.map((stem, idx) => (
                            <div key={idx} className={` px-1 py-0.5 rounded ${getElementClass(Gan2Wuxing(stem.gan))}`}>
                              <div className="md:hidden">
                                <div className="font-bold">{stem.gan}</div>
                                <div className="text-gray-600 text-xs">({stem.ten_deity})</div>
                              </div>
                              <div className="hidden md:block">
                                {stem.gan}
                                <span className="text-gray-600 ml-1">({stem.ten_deity})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="flex flex-col gap-0.5">
                          {chart.year_pillar.hidden_stems.map((stem, idx) => (
                            <div key={idx} className={` px-1 py-0.5 rounded ${getElementClass(Gan2Wuxing(stem.gan))}`}>
                              <div className="md:hidden">
                                <div className="font-bold">{stem.gan}</div>
                                <div className="text-gray-600 text-xs">({stem.ten_deity})</div>
                              </div>
                              <div className="hidden md:block">
                                {stem.gan}
                                <span className="text-gray-600 ml-1">({stem.ten_deity})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-2 font-semibold text-gray-700  bg-gray-50 align-middle">藏干</td>
                    </tr>

                                    {/* Nayin Row */}
                    <tr className="border-b border-gray-100">
                      <td className={`p-1 text-center  ${selectedLiunian ? getElementClass(selectedLiunian.nayin[selectedLiunian.nayin.length - 1]) : ''}`}>
                        <div className="">{selectedLiunian?.nayin || '-'}</div>
                      </td>
                      <td className={`p-1 text-center  ${selectedDayun ? getElementClass(selectedDayun.nayin[selectedDayun.nayin.length - 1]) : ''}`}>
                        <div className="">{selectedDayun?.nayin || '-'}</div>
                      </td>
                      <td className={`p-1 text-center border-l-2 border-gray-400 ${getElementClass(chart.hour_pillar.nayin[chart.hour_pillar.nayin.length - 1])}`}>
                        <div className="">{chart.hour_pillar.nayin}</div>
                      </td>
                      <td className={`p-1 text-center  ${getElementClass(chart.day_pillar.nayin[chart.day_pillar.nayin.length - 1])}`}>
                        <div className="">{chart.day_pillar.nayin}</div>
                      </td>
                      <td className={`p-1 text-center  ${getElementClass(chart.month_pillar.nayin[chart.month_pillar.nayin.length - 1])}`}>
                        <div className="">{chart.month_pillar.nayin}</div>
                      </td>
                      <td className={`p-1 text-center  ${getElementClass(chart.year_pillar.nayin[chart.year_pillar.nayin.length - 1])}`}>
                        <div className="">{chart.year_pillar.nayin}</div>
                      </td>
                      <td className="p-2 font-semibold text-gray-700  bg-gray-50">納音</td>
                    </tr>

                    {/* shensha Row */}
                    <tr className="align-top text-sm">
                      <td className="p-1 text-center">
                        <div className="flex flex-col gap-0.5">
                          {/* 流年神煞暫時顯示為空 */}
                          <div className="text-orange-600">-</div>
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="flex flex-col gap-0.5">
                          {/* 大運神煞暫時顯示為空 */}
                          <div className="text-orange-600">-</div>
                        </div>
                      </td>
                      <td className="p-1 text-center border-l-2 border-gray-400">
                        <div className="flex flex-col gap-0.5">
                          {chart.hour_pillar.shensha && chart.hour_pillar.shensha.length > 0 ? (
                            chart.hour_pillar.shensha.map((star, idx) => (
                              <div key={idx} className="text-orange-600 px-1 py-0.5 bg-orange-50 rounded">
                                {star}
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-400">-</div>
                          )}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="flex flex-col gap-0.5">
                          {chart.day_pillar.shensha && chart.day_pillar.shensha.length > 0 ? (
                            chart.day_pillar.shensha.map((star, idx) => (
                              <div key={idx} className="text-orange-600 px-1 py-0.5 bg-orange-50 rounded">
                                {star}
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-400">-</div>
                          )}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="flex flex-col gap-0.5">
                          {chart.month_pillar.shensha && chart.month_pillar.shensha.length > 0 ? (
                            chart.month_pillar.shensha.map((star, idx) => (
                              <div key={idx} className="text-orange-600 px-1 py-0.5 bg-orange-50 rounded">
                                {star}
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-400">-</div>
                          )}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="flex flex-col gap-0.5">
                          {chart.year_pillar.shensha && chart.year_pillar.shensha.length > 0 ? (
                            chart.year_pillar.shensha.map((star, idx) => (
                              <div key={idx} className="text-orange-600 px-1 py-0.5 bg-orange-50 rounded">
                                {star}
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-400">-</div>
                          )}
                        </div>
                      </td>
                      <td className="p-2 font-semibold text-gray-700  bg-gray-50 align-middle text-lg md:text-2xl">神煞</td>
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
            <DayunCard 
              chart={chart} 
              _currentDayun={selectedDayunIdx} 
              _currentLiunian={selectedLiunianIdx}
              onDayunChange={setSelectedDayunIdx}
              onLiunianChange={setSelectedLiunianIdx}
            />
          </motion.div>
        )}

        {/* Analysis Section */}
        <motion.div 
          variants={itemVariants}
          className="chinese-card p-6 brush-border analysis-section"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl chinese-title mb-2">命理分析</h2>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-green-600 to-transparent mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Five Elements Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg chinese-text font-semibold text-gray-700">五行分布</h3>
              <div className="space-y-2">
                {['木', '火', '土', '金', '水'].map((element) => (
                  <div key={element} className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      element === '木' ? 'bg-green-500' :
                      element === '火' ? 'bg-red-500' :
                      element === '土' ? 'bg-yellow-500' :
                      element === '金' ? 'bg-gray-500' : 'bg-blue-500'
                    }`}>
                      {element}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="chinese-text">{element}行</span>
                        <span className="text-sm text-gray-600">
                          {[chart.year_pillar, chart.month_pillar, chart.day_pillar, chart.hour_pillar]
                            .filter(p => p.gan_wuxing === element || p.zhi_wuxing === element).length}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Notes */}
            <div className="space-y-4">
              <h3 className="text-lg chinese-text font-semibold text-gray-700">特殊格局</h3>
              <div className="space-y-2">
                {chart.year_pillar.is_treasury && (
                  <div className="chinese-card p-3 bg-yellow-50 border border-yellow-200">
                    <span className="text-yellow-700 font-semibold">年支為庫</span>
                  </div>
                )}
                {chart.month_pillar.is_treasury && (
                  <div className="chinese-card p-3 bg-yellow-50 border border-yellow-200">
                    <span className="text-yellow-700 font-semibold">月支為庫</span>
                  </div>
                )}
                {chart.day_pillar.is_treasury && (
                  <div className="chinese-card p-3 bg-yellow-50 border border-yellow-200">
                    <span className="text-yellow-700 font-semibold">日支為庫</span>
                  </div>
                )}
                {chart.hour_pillar.is_treasury && (
                  <div className="chinese-card p-3 bg-yellow-50 border border-yellow-200">
                    <span className="text-yellow-700 font-semibold">時支為庫</span>
                  </div>
                )}
                
                <div className="chinese-card p-3 bg-blue-50 border border-blue-200">
                  <div className="text-blue-700 font-semibold mb-2">重要提示</div>
                  <div className="text-sm chinese-text text-blue-600">
                    日柱為命主本身，其他三柱分別代表祖宮、父母宮、子女宮的運勢影響
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};
const DayunCard = ({ chart, _currentDayun, _currentLiunian, onDayunChange, onLiunianChange }: { chart: BaziChart, _currentDayun: number, _currentLiunian: number, onDayunChange: React.Dispatch<React.SetStateAction<number>>, onLiunianChange: React.Dispatch<React.SetStateAction<number>> }) => {
  const [currentDayunIdx, setCurrentDayunIdx] = React.useState(_currentDayun)
  React.useEffect(() => {
    setCurrentDayunIdx(_currentDayun)
  }, [_currentDayun])
  console.log(currentDayunIdx)
  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl chinese-title mb-2">大運流年</h2>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent mx-auto"></div>
      </div>

      {/* Major Fortune Periods */}
      <div className="mb-6">
        <h3 className="text-sm md:text-lg chinese-text font-semibold mb-4 text-gray-700">大運</h3>
        <div className="grid grid-cols-9  md:gap-3">
          {chart.dayun.slice(0, 9).map((dayun, idx) => (
            <div 
              key={idx} 
              className={`chinese-card p-1 md:p-3 text-center bg-gradient-to-b from-blue-50 to-white border-2 cursor-pointer hover:shadow-md transition-all ${currentDayunIdx === idx ? 'bg-blue/0 border-blue-400' : ''}`}
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
              <div className="text-xs text-purple-600 mt-1 font-medium">
                {dayun.gan_ten_deity}
              </div>
              <div className="text-xs text-purple-600 mt-1 font-medium">
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
              className={`chinese-card p-1 md:p-2 text-center bg-gradient-to-b from-green-50 to-white border-2 text-xs cursor-pointer hover:shadow-md transition-all ${_currentLiunian === idx && _currentDayun === currentDayunIdx ? 'bg-green/0 border-green-400' : ''}`}
            >
              <div className="text-gray-500 mb-1">{liunian.year}</div>
              <div className="text-xs text-gray-500 mb-1">{liunian.age}歲</div>
              <div className={`px-1 py-0.5 rounded text-xs font-bold ${getElementClass(Gan2Wuxing(liunian.gan))}`}>
                {liunian.gan}
              </div>
              <div className={`px-1 py-0.5 rounded text-xs font-bold mt-0.5 ${getElementClass(Zhi2Wuxing(liunian.zhi))}`}>
                {liunian.zhi}
              </div>
              <div className="text-purple-600 mt-0.5 font-medium text-xs">
                {liunian.gan_ten_deity}
              </div>
              <div className="text-purple-600 mt-0.5 font-medium text-xs">
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