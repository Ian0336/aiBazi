"use client";

import { motion } from 'framer-motion';
import { BaziChart } from '@/types/bazi';

interface FiveElementsBalanceProps {
  chart: BaziChart;
}

const FiveElementsBalance: React.FC<FiveElementsBalanceProps> = ({ chart }) => {
  const elements = [
    { 
      name: '木', 
      icon: '🌳', 
      class: 'element-wood',
      description: '東方青龍，主春生發',
      trait: '仁慈溫和'
    },
    { 
      name: '火', 
      icon: '🔥', 
      class: 'element-fire',
      description: '南方朱雀，主夏炎熱',
      trait: '熱情活躍'
    },
    { 
      name: '土', 
      icon: '🏔️', 
      class: 'element-earth',
      description: '中央黃龍，主長夏',
      trait: '穩重踏實'
    },
    { 
      name: '金', 
      icon: '⚡', 
      class: 'element-metal',
      description: '西方白虎，主秋收斂',
      trait: '果斷堅毅'
    },
    { 
      name: '水', 
      icon: '💧', 
      class: 'element-water',
      description: '北方玄武，主冬藏收',
      trait: '智慧靈活'
    },
  ];

  // Get element counts from analysis
  const wuxingCount = chart.analysis?.wuxing_analysis?.wuxing_scores || {};
  const totalCount = Object.values(wuxingCount).reduce((sum, count) => sum + count, 0);

  // Find strongest and weakest elements
  const strongestElement = chart.analysis?.wuxing_analysis?.strongest_element || '';
  const weakestElement = chart.analysis?.wuxing_analysis?.weakest_element || '';

  // Calculate percentages
  const elementData = elements.map(element => {
    const count = wuxingCount[element.name] || 0;
    const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
    const isStrongest = element.name === strongestElement;
    const isWeakest = element.name === weakestElement && count > 0;
    
    return {
      ...element,
      count,
      percentage: Math.round(percentage),
      isStrongest,
      isWeakest
    };
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30, rotate: -2 },
    visible: {
      opacity: 1,
      x: 0,
      rotate: 0,
      transition: { duration: 0.6, type: "spring", stiffness: 100 }
    }
  };

  const progressVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: (percentage: number) => ({
      width: `${percentage}%`,
      opacity: 1,
      transition: { duration: 1.2, delay: 0.8, ease: "easeOut" }
    })
  };

  return (
    <div className="chinese-card p-8 brush-border lotus-pattern">
      <div className="text-center mb-10">
        <h3 className="text-3xl chinese-title mb-4">
          五行平衡
        </h3>
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
          <span className="text-xl">☯️</span>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-yellow-600 to-transparent"></div>
        </div>
        <p className="chinese-text text-gray-600 text-lg leading-relaxed">
          陰陽五行 · 天地造化 · 觀您命中元素分布
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 mb-8"
      >
        {elementData.map((element, index) => (
          <motion.div
            key={element.name}
            variants={itemVariants}
            className="chinese-card p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="text-3xl drop-shadow-sm">{element.icon}</span>
                  {element.isStrongest && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">強</span>
                    </div>
                  )}
                  {element.isWeakest && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">弱</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl font-bold chinese-text text-gray-800">
                      {element.name}
                    </span>
                    <span className="text-sm chinese-text text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {element.trait}
                    </span>
                  </div>
                  <div className="text-sm chinese-text text-gray-600 leading-relaxed">
                    {element.description}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold chinese-text text-gray-800 mb-1">
                  {element.percentage}%
                </div>
                <div className="text-sm chinese-text text-gray-600">
                  {element.count} 個
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className={`h-full ${element.class} rounded-full relative`}
                  variants={progressVariants}
                  custom={element.percentage}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </motion.div>
              </div>
              <div className="absolute top-0 left-0 w-full h-4 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow chinese-text">
                  {element.percentage > 10 ? `${element.percentage}%` : ''}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Analysis Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="chinese-card p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 brush-border"
      >
        <div className="text-center mb-6">
          <h4 className="text-2xl chinese-title flex items-center justify-center gap-3">
            <span>📊</span>
            <span>五行總析</span>
            <span>📊</span>
          </h4>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="chinese-card p-4 bg-white/50">
              <div className="flex items-center justify-between">
                <span className="chinese-text text-gray-600 flex items-center gap-2">
                  <span>☀️</span>
                  <span>日主：</span>
                </span>
                <span className="font-bold chinese-text text-gray-800">
                  {chart.analysis?.day_master_nature?.gan} ({chart.analysis?.day_master_nature?.element})
                </span>
              </div>
            </div>
            
            <div className="chinese-card p-4 bg-white/50">
              <div className="flex items-center justify-between">
                <span className="chinese-text text-gray-600 flex items-center gap-2">
                  <span>⚖️</span>
                  <span>強弱：</span>
                </span>
                <span className={`font-bold chinese-text ${chart.analysis?.day_master_strength?.is_strong ? 'text-red-600' : 'text-blue-600'}`}>
                  {chart.analysis?.day_master_strength?.is_strong ? '身強' : '身弱'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="chinese-card p-4 bg-white/50">
              <div className="flex items-center justify-between">
                <span className="chinese-text text-gray-600 flex items-center gap-2">
                  <span>💪</span>
                  <span>最強：</span>
                </span>
                <span className="font-bold chinese-text text-red-700">
                  {strongestElement || '無'}
                </span>
              </div>
            </div>
            
            <div className="chinese-card p-4 bg-white/50">
              <div className="flex items-center justify-between">
                <span className="chinese-text text-gray-600 flex items-center gap-2">
                  <span>🌱</span>
                  <span>最弱：</span>
                </span>
                <span className="font-bold chinese-text text-blue-700">
                  {weakestElement || '無'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {chart.analysis?.recommendations && (
          <div className="mt-6 chinese-card p-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <h5 className="text-lg chinese-title mb-3 flex items-center gap-2">
              <span>💡</span>
              <span>建議指引</span>
            </h5>
            <div className="space-y-2 chinese-text text-gray-700 leading-relaxed">
              {chart.analysis.recommendations.lacking_element && (
                <p>
                  <span className="font-semibold">補強元素：</span>
                  {chart.analysis.recommendations.lacking_element}
                </p>
              )}
              {chart.analysis.recommendations.advice && (
                <p className="italic">
                  "{chart.analysis.recommendations.advice}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* Traditional wisdom quote */}
        <div className="mt-6 text-center chinese-card p-4 bg-gradient-to-r from-gray-50 to-blue-50">
          <p className="chinese-text text-gray-800 italic text-lg">
            "五行相生相剋，平衡和諧為貴"
          </p>
          <p className="chinese-text text-sm text-gray-600 mt-2">
            ——傳統命理智慧
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default FiveElementsBalance; 