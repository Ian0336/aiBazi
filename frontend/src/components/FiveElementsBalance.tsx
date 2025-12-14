"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BaziChart } from '@/types/bazi';

interface FiveElementsBalanceProps {
  chart: BaziChart;
}

const FiveElementsBalance: React.FC<FiveElementsBalanceProps> = ({ chart }) => {
  const [showHealthDetails, setShowHealthDetails] = useState(false);
  const [expandedElement, setExpandedElement] = useState<string | null>(null);
  const elements = [
    { 
      name: '木', 
      icon: '🌳', 
      class: 'element-wood',
      description: '東方青龍，主春生發',
      trait: '仁慈溫和',
      organ: '肝膽',
      meridian: '肝經、膽經',
      related_parts: '頭項、眼目、筋膜、四肢',
      excess_symptoms: '肝火旺盛、急躁易怒、頭痛眩暈、眼部疾患、胸脅脹痛、情緒波動大',
      deficiency_symptoms: '肝血不足、視力下降、筋膜拘攣、月經不調、情緒抑鬱、疲勞無力',
      health_advice: '保持心情舒暢，適度運動，避免過度勞累，注意眼部保健'
    },
    { 
      name: '火', 
      icon: '🔥', 
      class: 'element-fire',
      description: '南方朱雀，主夏炎熱',
      trait: '熱情活躍',
      organ: '心小腸',
      meridian: '心經、小腸經',
      related_parts: '心臟、血管、舌、面部',
      excess_symptoms: '心火亢盛、失眠多夢、口舌生瘡、心悸胸悶、面部潮紅、情緒躁動',
      deficiency_symptoms: '心陽不足、畏寒肢冷、心悸乏力、面色蒼白、記憶力減退、精神萎靡',
      health_advice: '規律作息，控制情緒，避免過度興奮，注意心血管保健'
    },
    { 
      name: '土', 
      icon: '🏔️', 
      class: 'element-earth',
      description: '中央黃龍，主長夏',
      trait: '穩重踏實',
      organ: '脾胃',
      meridian: '脾經、胃經',
      related_parts: '消化系統、肌肉、四肢',
      excess_symptoms: '脾胃濕熱、消化不良、腹脹便秘、肥胖、痰濕體質、口腔潰瘍',
      deficiency_symptoms: '脾胃虛弱、食欲不振、腹瀉便溏、消瘦、四肢無力、面色萎黃',
      health_advice: '規律飲食，細嚼慢嚥，避免生冷食物，適度運動，保持心情愉悅'
    },
    { 
      name: '金', 
      icon: '⚡', 
      class: 'element-metal',
      description: '西方白虎，主秋收斂',
      trait: '果斷堅毅',
      organ: '肺大腸',
      meridian: '肺經、大腸經',
      related_parts: '呼吸系統、皮膚、鼻咽',
      excess_symptoms: '肺熱咳嗽、呼吸急促、皮膚乾燥、便秘、鼻炎、咽喉腫痛、氣管炎',
      deficiency_symptoms: '肺氣虛弱、容易感冒、聲音低微、皮膚無光澤、腹瀉、免疫力低下',
      health_advice: '注意呼吸道保健，避免菸塵刺激，保持室內空氣清新，適度鍛煉肺功能'
    },
    { 
      name: '水', 
      icon: '💧', 
      class: 'element-water',
      description: '北方玄武，主冬藏收',
      trait: '智慧靈活',
      organ: '腎膀胱',
      meridian: '腎經、膀胱經',
      related_parts: '泌尿生殖系統、骨骼、腰膝',
      excess_symptoms: '腎陰虛火旺、頭暈耳鳴、腰膝酸軟、夜間盜汗、心煩失眠、性功能亢進',
      deficiency_symptoms: '腎陽虛衰、畏寒怕冷、腰膝冷痛、夜尿頻多、性功能減退、精神疲憊',
      health_advice: '注意腰腎保暖，避免過度勞累，規律作息，適度進補，保持良好心態'
    },
  ];

  // Get element counts from analysis
  const wuxingCount: Record<string, number> = chart.analysis?.wuxing_analysis?.wuxing_scores || {};
  const totalCount = Object.values(wuxingCount).reduce((sum: number, count: number) => sum + count, 0);

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
    <div className="chinese-card p-8 brush-border lotus-pattern w-full max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h3 className="text-3xl chinese-title mb-4">
          五行平衡
        </h3>
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="w-16 h-0.5 bg-gray-400 opacity-40"></div>
          <span className="text-xl opacity-70">☯️</span>
          <div className="w-16 h-0.5 bg-gray-400 opacity-40"></div>
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

            {/* Health Details Toggle */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm chinese-text text-gray-600">
                對應臟腑：{element.organ}
              </div>
              <button
                onClick={() => setExpandedElement(expandedElement === element.name ? null : element.name)}
                className="text-sm chinese-text text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-1"
              >
                🏥 健康詳情
                <span className={`transform transition-transform ${expandedElement === element.name ? 'rotate-180' : ''}`}>
                  ⌄
                </span>
              </button>
            </div>

            {/* Expanded Health Details */}
            <motion.div
              initial={false}
              animate={{
                height: expandedElement === element.name ? 'auto' : 0,
                opacity: expandedElement === element.name ? 1 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {expandedElement === element.name && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="chinese-card p-3 bg-blue-50">
                      <h6 className="text-sm font-semibold text-blue-800 mb-2">📍 對應部位</h6>
                      <p className="text-sm chinese-text text-blue-700">{element.related_parts}</p>
                    </div>
                    <div className="chinese-card p-3 bg-purple-50">
                      <h6 className="text-sm font-semibold text-purple-800 mb-2">🔄 經絡系統</h6>
                      <p className="text-sm chinese-text text-purple-700">{element.meridian}</p>
                    </div>
                  </div>

                  {/* Health Symptoms */}
                  <div className="space-y-3">
                    {element.isStrongest && (
                      <div className="chinese-card p-3 bg-red-50 border-l-4 border-red-500">
                        <h6 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                          🔥 過旺症狀 <span className="text-xs bg-red-200 px-2 py-1 rounded">當前狀態</span>
                        </h6>
                        <p className="text-sm chinese-text text-red-700 leading-relaxed">{element.excess_symptoms}</p>
                      </div>
                    )}
                    
                    {element.isWeakest && (
                      <div className="chinese-card p-3 bg-blue-50 border-l-4 border-blue-500">
                        <h6 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          ❄️ 過衰症狀 <span className="text-xs bg-blue-200 px-2 py-1 rounded">當前狀態</span>
                        </h6>
                        <p className="text-sm chinese-text text-blue-700 leading-relaxed">{element.deficiency_symptoms}</p>
                      </div>
                    )}
                    
                    {!element.isStrongest && !element.isWeakest && (
                      <>
                        <div className="chinese-card p-3 bg-red-50 border-l-4 border-red-300">
                          <h6 className="text-sm font-semibold text-red-700 mb-2">🔥 過旺時症狀</h6>
                          <p className="text-sm chinese-text text-red-600 leading-relaxed">{element.excess_symptoms}</p>
                        </div>
                        <div className="chinese-card p-3 bg-blue-50 border-l-4 border-blue-300">
                          <h6 className="text-sm font-semibold text-blue-700 mb-2">❄️ 過衰時症狀</h6>
                          <p className="text-sm chinese-text text-blue-600 leading-relaxed">{element.deficiency_symptoms}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Health Advice */}
                  <div className="chinese-card p-3 bg-green-50 border-l-4 border-green-500">
                    <h6 className="text-sm font-semibold text-green-800 mb-2">💡 養生建議</h6>
                    <p className="text-sm chinese-text text-green-700 leading-relaxed">{element.health_advice}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>


      {/* Five Elements Health Relationships */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="chinese-card p-6 bg-gray-50 brush-border"
      >
        <div className="text-center mb-6">
          <h4 className="text-2xl chinese-title flex items-center justify-center gap-3 mb-4">
            <span>🏥</span>
            <span>五行養生智慧</span>
            <span>🏥</span>
          </h4>
          <button
            onClick={() => setShowHealthDetails(!showHealthDetails)}
            className="chinese-text text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-2 mx-auto px-4 py-2 bg-blue-100 rounded-lg hover:bg-blue-200"
          >
            🔍 {showHealthDetails ? '收起' : '展開'}詳細養生指引
            <span className={`transform transition-transform ${showHealthDetails ? 'rotate-180' : ''}`}>
              ⌄
            </span>
          </button>
        </div>

        <motion.div
          initial={false}
          animate={{
            height: showHealthDetails ? 'auto' : 0,
            opacity: showHealthDetails ? 1 : 0
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          {showHealthDetails && (
            <div className="space-y-6">
              {/* Five Elements Relationships */}
              <div className="chinese-card p-5 bg-white">
                <h5 className="text-lg chinese-title mb-4 flex items-center gap-2">
                  <span>🔄</span>
                  <span>五行相生相剋</span>
                </h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="chinese-card p-4 bg-green-50">
                    <h6 className="font-semibold text-green-800 mb-3">💚 相生關係（滋養）</h6>
                    <div className="space-y-2 text-sm chinese-text text-green-700">
                      <p>• 木生火：肝木調達，心火得養</p>
                      <p>• 火生土：心陽溫煦，脾土運化</p>
                      <p>• 土生金：脾胃健運，肺金充實</p>
                      <p>• 金生水：肺氣清肅，腎水得源</p>
                      <p>• 水生木：腎水滋養，肝木條達</p>
                    </div>
                  </div>
                  <div className="chinese-card p-4 bg-red-50">
                    <h6 className="font-semibold text-red-800 mb-3">❤️ 相剋關係（制約）</h6>
                    <div className="space-y-2 text-sm chinese-text text-red-700">
                      <p>• 木剋土：肝鬱犯脾，消化不良</p>
                      <p>• 火剋金：心火亢盛，肺金受損</p>
                      <p>• 土剋水：脾濕困腎，水液代謝失調</p>
                      <p>• 金剋木：肺氣鬱結，肝氣不舒</p>
                      <p>• 水剋火：腎陽不足，心火衰微</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personalized Health Advice */}
              <div className="chinese-card p-5 bg-white">
                <h5 className="text-lg chinese-title mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  <span>個人化養生建議</span>
                </h5>
                <div className="grid md:grid-cols-3 gap-4">
                  {elementData.filter(e => e.isStrongest || e.isWeakest).map(element => (
                    <div key={element.name} className={`chinese-card p-4 ${element.isStrongest ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{element.icon}</span>
                        <span className="font-semibold chinese-text">
                          {element.name}行{element.isStrongest ? '過旺' : '不足'}
                        </span>
                      </div>
                      <div className="text-sm chinese-text text-gray-700 space-y-2">
                        <p><strong>重點關注：</strong>{element.organ}功能</p>
                        <p><strong>養生方向：</strong>{element.health_advice}</p>
                        {element.isStrongest && (
                          <p className="text-red-600"><strong>注意事項：</strong>避免過度刺激該元素</p>
                        )}
                        {element.isWeakest && (
                          <p className="text-blue-600"><strong>調理重點：</strong>溫和滋養該元素</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Health Tips */}
              <div className="chinese-card p-5 bg-orange-50">
                <h5 className="text-lg chinese-title mb-4 flex items-center gap-2">
                  <span>🌟</span>
                  <span>通用養生原則</span>
                </h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">⏰</span>
                      <div>
                        <h6 className="font-semibold chinese-text mb-1">順應自然節律</h6>
                        <p className="text-sm chinese-text text-gray-700">依據四季變化調整作息，春養肝、夏養心、長夏養脾、秋養肺、冬養腎</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🍃</span>
                      <div>
                        <h6 className="font-semibold chinese-text mb-1">情志調節</h6>
                        <p className="text-sm chinese-text text-gray-700">保持心情平和，避免過度情緒波動，情志與臟腑密切相關</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🥗</span>
                      <div>
                        <h6 className="font-semibold chinese-text mb-1">飲食調理</h6>
                        <p className="text-sm chinese-text text-gray-700">根據體質選擇食物，避免偏食，注重五行食療的搭配</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🧘</span>
                      <div>
                        <h6 className="font-semibold chinese-text mb-1">適度運動</h6>
                        <p className="text-sm chinese-text text-gray-700">選擇適合體質的運動方式，動靜結合，內外兼修</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="chinese-card p-4 bg-gray-50 border-l-4 border-gray-400">
                <p className="text-sm chinese-text text-gray-600 italic">
                  ⚠️ 以上內容僅為傳統命理參考，如有健康問題請諮詢專業醫師，切勿僅憑命理分析自行診斷或治療。
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FiveElementsBalance; 