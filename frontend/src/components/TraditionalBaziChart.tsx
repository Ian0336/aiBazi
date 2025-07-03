"use client";

import { motion } from 'framer-motion';
import { BaziChart } from '@/types/bazi';

interface TraditionalBaziChartProps {
  chart: BaziChart;
}

const TraditionalBaziChart: React.FC<TraditionalBaziChartProps> = ({ chart }) => {
  // 计算年龄（简化版）
  const currentYear = new Date().getFullYear();
  const birthYear = parseInt(chart.solar_date.split('年')[0]);
  const age = currentYear - birthYear;

  // 获取生肖信息和图标
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

  // 获取五行样式类
  const getElementClass = (element: string) => {
    const classMap: Record<string, string> = {
      '木': 'element-wood',
      '火': 'element-fire', 
      '土': 'element-earth',
      '金': 'element-metal',
      '水': 'element-water'
    };
    return classMap[element] || 'bg-gray-300 text-black';
  };

  // 获取五行图标
  const getElementIcon = (element: string) => {
    const iconMap: Record<string, string> = {
      '木': '🌳', '火': '🔥', '土': '🏔️', '金': '⚡', '水': '💧'
    };
    return iconMap[element] || '⭐';
  };

  // 获取柱的传统名称和图标
  const getPillarInfo = (pillarType: string) => {
    const pillarMap: Record<string, { name: string; icon: string; desc: string }> = {
      'hour': { name: '時柱', icon: '🌙', desc: '晚景' },
      'day': { name: '日柱', icon: '☀️', desc: '命主' },
      'month': { name: '月柱', icon: '🌸', desc: '青春' },
      'year': { name: '年柱', icon: '🏛️', desc: '根基' }
    };
    return pillarMap[pillarType] || { name: '未知', icon: '❓', desc: '' };
  };

  const zodiacInfo = getZodiac(chart.year_pillar.zhi);

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
    hidden: { opacity: 0, y: 30, rotate: -1 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: { duration: 0.6, type: "spring", stiffness: 100 }
    }
  };

  const pillarVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    },
    hover: {
      scale: 1.05,
      y: -8,
      transition: { duration: 0.3 }
    }
  };

  const renderPillar = (pillar: any, pillarType: string, index: number) => {
    const pillarInfo = getPillarInfo(pillarType);
    
    return (
      <motion.div
        key={pillarType}
        variants={pillarVariants}
        whileHover="hover"
        className="bazi-pillar lotus-pattern"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="text-center space-y-4">
          {/* 柱名 */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xl">{pillarInfo.icon}</span>
            <div>
              <div className="text-lg font-bold chinese-text text-gray-800">
                {pillarInfo.name}
              </div>
              <div className="text-xs chinese-text text-gray-600">
                {pillarInfo.desc}
              </div>
            </div>
          </div>
          
          {/* 天干 */}
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-xs chinese-text text-gray-500 mb-1">天干</div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-lg font-bold ${getElementClass(pillar.gan_wuxing)}`}>
                <span>{getElementIcon(pillar.gan_wuxing)}</span>
                <span className="text-2xl font-bold">{pillar.gan}</span>
              </div>
            </div>
            
            {/* 地支 */}
            <div className="text-center">
              <div className="text-xs chinese-text text-gray-500 mb-1">地支</div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-lg font-bold ${getElementClass(pillar.zhi_wuxing)}`}>
                <span>{getElementIcon(pillar.zhi_wuxing)}</span>
                <span className="text-2xl font-bold">{pillar.zhi}</span>
              </div>
            </div>
          </div>

          {/* 十神 */}
          {pillar.ten_deity && (
            <div className="chinese-card p-2 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="text-xs chinese-text text-gray-500">十神</div>
              <div className="text-sm font-semibold chinese-text text-purple-700">
                {pillar.ten_deity}
              </div>
            </div>
          )}

          {/* 藏干 */}
          {pillar.hidden_stems && pillar.hidden_stems.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs chinese-text text-gray-500">藏干</div>
              <div className="grid grid-cols-2 gap-2">
                {pillar.hidden_stems.slice(0, 4).map((stem: any, idx: number) => (
                  <div key={idx} className="chinese-card p-2 bg-gray-50">
                    <div className="text-xs font-bold chinese-text text-gray-700">
                      {stem.gan}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-7xl mx-auto space-y-8"
    >
      {/* 标题区域 */}
      <motion.div 
        variants={itemVariants}
        className="chinese-card p-8 text-center brush-border"
      >
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold chinese-title mb-4">
            八字命盤
          </h1>
          
          {/* 生肖和基本信息徽章 */}
          <div className="flex flex-wrap justify-center items-center gap-4">
            <div className="chinese-card px-4 py-2 bg-gradient-to-r from-red-100 to-yellow-100 flex items-center gap-2">
              <span className="text-2xl">{zodiacInfo.icon}</span>
              <span className="chinese-text font-semibold text-red-700">
                {zodiacInfo.name}年生
              </span>
            </div>
            <div className="chinese-card px-4 py-2 bg-gradient-to-r from-blue-100 to-green-100 flex items-center gap-2">
              <span className="text-lg">🎂</span>
              <span className="chinese-text font-semibold text-blue-700">
                {birthYear}年 · {age}歲
              </span>
            </div>
            <div className="chinese-card px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 flex items-center gap-2">
              <span className="text-lg">{chart.analysis?.gender === 'male' ? '👨' : '👩'}</span>
              <span className="chinese-text font-semibold text-purple-700">
                {chart.analysis?.gender === 'male' ? '男命' : '女命'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 基本信息 */}
      <motion.div 
        variants={itemVariants}
        className="chinese-card p-6 brush-border"
      >
        <div className="text-center mb-4">
          <h3 className="text-2xl chinese-title">生辰資訊</h3>
          <div className="flex justify-center items-center gap-4 mt-2">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
            <span className="text-lg">📅</span>
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-yellow-600 to-transparent"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="chinese-card p-4 bg-gradient-to-br from-red-50 to-orange-50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🗓️</span>
              <div>
                <div className="text-sm chinese-text text-gray-600">西元日期</div>
                <div className="text-lg font-bold chinese-text text-gray-800">
                  {chart.solar_date}
                </div>
              </div>
            </div>
          </div>
          
          <div className="chinese-card p-4 bg-gradient-to-br from-yellow-50 to-green-50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌙</span>
              <div>
                <div className="text-sm chinese-text text-gray-600">農曆日期</div>
                <div className="text-lg font-bold chinese-text text-gray-800">
                  {chart.lunar_date}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 四柱主体 */}
      <motion.div 
        variants={itemVariants}
        className="chinese-card p-8 brush-border lotus-pattern"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl chinese-title mb-4">
            四柱八字
          </h2>
          <div className="flex justify-center items-center gap-4">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
            <span className="text-xl">🎋</span>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-yellow-600 to-transparent"></div>
          </div>
          <p className="chinese-text text-gray-600 mt-4 text-lg">
            天干地支 · 命理根基
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {renderPillar(chart.hour_pillar, 'hour', 0)}
          {renderPillar(chart.day_pillar, 'day', 1)}
          {renderPillar(chart.month_pillar, 'month', 2)}
          {renderPillar(chart.year_pillar, 'year', 3)}
        </div>
      </motion.div>

      {/* 纳音和空亡信息 */}
      <motion.div 
        variants={itemVariants}
        className="grid md:grid-cols-2 gap-6"
      >
        {/* 纳音 */}
        {chart.nayin && (
          <div className="chinese-card p-6 brush-border">
            <div className="text-center mb-4">
              <h3 className="text-xl chinese-title flex items-center justify-center gap-2">
                <span>🎵</span>
                <span>納音五行</span>
              </h3>
            </div>
            <div className="space-y-3">
              {Object.entries(chart.nayin).map(([pillar, sound]) => (
                <div key={pillar} className="chinese-card p-3 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex justify-between items-center chinese-text">
                    <span className="font-semibold text-gray-700">
                      {pillar === 'year' ? '年柱' : pillar === 'month' ? '月柱' : pillar === 'day' ? '日柱' : '時柱'}
                    </span>
                    <span className="font-bold text-blue-700">{sound}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

                 {/* 空亡 */}
         {chart.empty_positions && (
           <div className="chinese-card p-6 brush-border">
             <div className="text-center mb-4">
               <h3 className="text-xl chinese-title flex items-center justify-center gap-2">
                 <span>🕳️</span>
                 <span>空亡信息</span>
               </h3>
             </div>
             <div className="chinese-card p-4 bg-gradient-to-r from-gray-50 to-blue-50">
               <div className="text-center chinese-text">
                 <div className="text-sm text-gray-600 mb-2">當前空亡</div>
                 <div className="text-lg font-bold text-gray-800">
                   {chart.empty_positions.empty_pair.join('、')}
                 </div>
                 {chart.empty_positions.empty_in_chart.length > 0 && (
                   <div className="text-sm text-gray-600 mt-2">
                     命中空亡：{chart.empty_positions.empty_in_chart.join('、')}
                   </div>
                 )}
               </div>
             </div>
           </div>
         )}
      </motion.div>

      {/* 日主强弱分析 */}
      {chart.analysis?.day_master_strength && (
        <motion.div 
          variants={itemVariants}
          className="chinese-card p-6 brush-border lotus-pattern"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl chinese-title flex items-center justify-center gap-3">
              <span>⚖️</span>
              <span>日主強弱</span>
              <span>⚖️</span>
            </h3>
          </div>
          
          <div className="chinese-card p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
            <div className="text-center space-y-4">
              <div className="flex justify-center items-center gap-4">
                <span className="text-3xl">
                  {chart.analysis.day_master_strength.is_strong ? '💪' : '🌱'}
                </span>
                <div>
                  <div className="text-lg chinese-text font-bold text-gray-800">
                    日主{chart.analysis.day_master_strength.is_strong ? '偏強' : '偏弱'}
                  </div>
                  <div className="text-sm chinese-text text-gray-600">
                    {chart.analysis.day_master_strength.is_strong ? '命格較為強勢' : '命格相對溫和'}
                  </div>
                </div>
              </div>
              
              <div className="chinese-text text-gray-700 leading-relaxed">
                {chart.analysis.day_master_strength.description}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 传统底部装饰 */}
      <motion.div 
        variants={itemVariants}
        className="text-center chinese-text text-gray-500 py-6"
      >
        <div className="flex justify-center items-center gap-4 mb-3">
          <span>🪷</span>
          <span>命由天定 · 運靠自己</span>
          <span>🪷</span>
        </div>
        <div className="text-sm">
          八字命理僅供參考，人生路上仍需自己努力前行
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TraditionalBaziChart; 