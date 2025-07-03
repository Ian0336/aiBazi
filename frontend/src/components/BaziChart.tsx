"use client";

import { motion } from 'framer-motion';
import { BaziChart as BaziChartType } from '@/types/bazi';

interface BaziChartProps {
  chart: BaziChartType;
}

const BaziChart: React.FC<BaziChartProps> = ({ chart }) => {
  const pillars = [
    { label: '年柱', pillar: chart.year_pillar, description: '祖上根基' },
    { label: '月柱', pillar: chart.month_pillar, description: '青年發展' },
    { label: '日柱', pillar: chart.day_pillar, description: '自身本命' },
    { label: '時柱', pillar: chart.hour_pillar, description: '子女後代' },
  ];

  const getElementColor = (element: string) => {
    const colors = {
      '木': 'element-wood',
      '火': 'element-fire',
      '土': 'element-earth',
      '金': 'element-metal',
      '水': 'element-water',
    };
    return colors[element as keyof typeof colors] || 'bg-gray-500';
  };

  const getElementIcon = (element: string) => {
    const icons = {
      '木': '🌳',
      '火': '🔥',
      '土': '🏔️',
      '金': '⚡',
      '水': '💧',
    };
    return icons[element as keyof typeof icons] || '⭐';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const pillarVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold title-gradient mb-4">
          八字命盤
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          您的四柱八字排盤結果
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bazi-grid"
      >
        {pillars.map((item, index) => (
          <motion.div
            key={item.label}
            variants={pillarVariants}
            className="bazi-pillar"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Pillar Label */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                {item.label}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            </div>

            {/* Heavenly Stem */}
            <div className="space-y-3">
                             <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                 <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                   天干
                 </div>
                 <div className="flex items-center justify-center space-x-2">
                   <span className="text-2xl mono-font font-bold text-gray-800 dark:text-gray-200">
                     {item.pillar.gan}
                   </span>
                   <div className={`w-3 h-3 rounded-full ${getElementColor(item.pillar.gan_wuxing)}`}></div>
                 </div>
                 <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                   {getElementIcon(item.pillar.gan_wuxing)} {item.pillar.gan_wuxing}
                 </div>
               </div>

               {/* Earthly Branch */}
               <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                 <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                   地支
                 </div>
                 <div className="flex items-center justify-center space-x-2">
                   <span className="text-2xl mono-font font-bold text-gray-800 dark:text-gray-200">
                     {item.pillar.zhi}
                   </span>
                   <div className={`w-3 h-3 rounded-full ${getElementColor(item.pillar.zhi_wuxing)}`}></div>
                 </div>
                 <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                   {getElementIcon(item.pillar.zhi_wuxing)} {item.pillar.zhi_wuxing}
                 </div>
               </div>

              {/* Ganzhi */}
              <div className="text-center p-3 rounded-xl bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  干支
                </div>
                <div className="text-xl mono-font font-bold title-gradient">
                  {item.pillar.ganzhi}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="glass-card p-6 mt-8"
      >
        <h3 className="text-xl font-semibold title-gradient mb-4">
          命盤基本信息
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
                     <div className="flex justify-between">
             <span className="text-gray-600 dark:text-gray-400">日主：</span>
             <span className="font-medium text-gray-800 dark:text-gray-200">
               {chart.day_pillar.gan} ({chart.day_pillar.gan_wuxing})
             </span>
           </div>
           <div className="flex justify-between">
             <span className="text-gray-600 dark:text-gray-400">命宮：</span>
             <span className="font-medium text-gray-800 dark:text-gray-200">
               {chart.day_pillar.ganzhi}
             </span>
           </div>
           <div className="flex justify-between">
             <span className="text-gray-600 dark:text-gray-400">年柱納音：</span>
             <span className="font-medium text-gray-800 dark:text-gray-200">
               {chart.year_pillar.ganzhi}
             </span>
           </div>
           <div className="flex justify-between">
             <span className="text-gray-600 dark:text-gray-400">生肖：</span>
             <span className="font-medium text-gray-800 dark:text-gray-200">
               {chart.year_pillar.zhi}
             </span>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BaziChart; 