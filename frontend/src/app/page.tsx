"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BaziForm from '@/components/BaziForm';
import FiveElementsBalance from '@/components/FiveElementsBalance';
import TraditionalBaziChart from '@/components/TraditionalBaziChart';
import StickyHeader from '@/components/StickyHeader';
import { BaziChart as BaziChartType, BaziInput } from '@/types/bazi';

export default function HomePage() {
  const [chart, setChart] = useState<BaziChartType | null>(null);
  const [originalInput, setOriginalInput] = useState<BaziInput | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [showChart, setShowChart] = useState<boolean>(false);
  const [sequenceState  , setSequenceState] = useState<'visible' | 'exit'>('visible');

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleCalculate = (newChart: BaziChartType, input: BaziInput) => {
    setChart(newChart);
    setOriginalInput(input);
    setShowChart(true);
    scrollToTop();
  };

  const handleEdit = () => {
    setShowChart(false);
    setChart(null);
    setOriginalInput(null);
    setSequenceState('exit');
    scrollToTop();
  };



  useEffect(() => {
    const sequenceAnimation = () => {
      setTimeout(() => {
        setSequenceState('visible');
        
        setTimeout(() => {
          setSequenceState('exit');
        }, 1000); 
      }, 1000); 
    };

    sequenceAnimation();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
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

  const calligraphyVariants = {
    hidden: { opacity: 0, scale: 0.8, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 1.2, ease: "easeOut" }
    }
  };

  const chartSectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const sequenceVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 1.5, ease: "easeInOut" }
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 1.5, ease: "easeInOut" }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      height: 0,
      padding: 0,
      margin: 0,
      border: 0,
      borderRadius: 0,
      borderColor: 'transparent',
      borderStyle: 'none',
      borderWidth: 0,
      transition: { duration: 3, ease: "easeInOut" }
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300 relative">
      {/* Traditional Chinese Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Ink wash effect corners */}
        <div className="absolute top-0 left-0 w-64 h-64 opacity-10">
          <div className="w-full h-full rounded-full bg-gradient-radial from-black/20 via-transparent to-transparent blur-xl"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-80 h-80 opacity-8">
          <div className="w-full h-full rounded-full bg-gradient-radial from-red-900/15 via-transparent to-transparent blur-2xl"></div>
        </div>
        
        {/* Subtle mountain silhouettes */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-5">
          <svg viewBox="0 0 1200 200" className="w-full h-full">
            <path d="M0,200 C300,50 600,120 900,40 C1000,20 1100,60 1200,30 L1200,200 Z" fill="currentColor"/>
          </svg>
        </div>
      </div>
      {/* Traditional Chinese Seal/Stamp in corner */}
      <div className="fixed top-6 left-6 z-10 opacity-20">
        <div className="w-16 h-16 bg-red-600 rounded-sm rotate-12 flex items-center justify-center chinese-text text-white text-xs font-bold">
          <span>八字</span>
        </div>
      </div>

      {/* Sticky Header - only show when chart is calculated */}
      <AnimatePresence>
        {showChart && originalInput && (
          <StickyHeader input={originalInput} onEdit={handleEdit} />
        )}
      </AnimatePresence>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-1 md:px-4 py-8 relative z-10"
      >
        {/* Header Section */}
        <AnimatePresence mode="wait">
          {!showChart && (
            <motion.header 
              key="header"
              variants={sequenceVariants}
              animate={sequenceState}
              className="text-center mb-16 pt-20"
            >
              {/* Traditional Chinese Title */}
              <motion.div 
                variants={calligraphyVariants}
                className="relative mb-8"
              >
                <h1 className="text-6xl md:text-8xl font-bold chinese-title mb-4">
                  八字命盤
                </h1>
                {/* Decorative elements */}
                <div className="flex justify-center items-center gap-4 mb-6">
                  <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
                  <span className="text-2xl">🪷</span>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-yellow-600 to-transparent"></div>
                </div>
              </motion.div>

              {/* Subtitle with traditional elements */}
              <motion.div
                variants={itemVariants}
                className="max-w-3xl mx-auto"
              >
                <p className="text-xl md:text-2xl chinese-text text-gray-700 leading-relaxed mb-4">
                  千古智慧 · 現代演繹
                </p>
                <p className="text-base md:text-lg chinese-text text-gray-600 leading-relaxed">
                  運用傳統八字命理學，結合現代科技分析
                  <br />
                  為您解讀生命密碼，指引人生方向
                </p>
                
                {/* Five Elements Symbols */}
                <div className="flex justify-center gap-6 mt-8 text-2xl">
                  <span title="木" className="hover:scale-125 transition-transform cursor-help">🌳</span>
                  <span title="火" className="hover:scale-125 transition-transform cursor-help">🔥</span>
                  <span title="土" className="hover:scale-125 transition-transform cursor-help">🏔️</span>
                  <span title="金" className="hover:scale-125 transition-transform cursor-help">⚡</span>
                  <span title="水" className="hover:scale-125 transition-transform cursor-help">💧</span>
                </div>
              </motion.div>
            </motion.header>
          )}
        </AnimatePresence>

        {/* Form Section */}
        <AnimatePresence mode="wait">
          {!showChart && (
            <motion.div
              key="form"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="max-w-2xl mx-auto animate-ink-drop"
            >
              {/* Traditional form wrapper */}
              <div className="chinese-card p-8 brush-border">
                <div className="text-center mb-6">
                  <h3 className="text-2xl chinese-title mb-2">輸入生辰資訊</h3>
                  <p className="chinese-text text-gray-600">請準確填寫您的出生時間</p>
                </div>
                
                <BaziForm 
                  onCalculate={handleCalculate}
                  isLoading={isCalculating}
                />
                
                {/* Decorative border */}
                <div className="mt-6 flex justify-center">
                  <div className="flex items-center gap-2 text-xs chinese-text text-gray-500">
                    <span>✦</span>
                    <span>準確的時間有助於精確分析</span>
                    <span>✦</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chart Section */}
        <AnimatePresence>
          {showChart && chart && (
            <motion.div
              key="chart"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-12"
            >
              {/* Traditional Bazi Chart */}
              <motion.section
                variants={chartSectionVariants}
                initial="hidden"
                animate="visible"
                className="animate-fade-in-brush"
              >
                <TraditionalBaziChart chart={chart} />
              </motion.section>

              {/* Five Elements Balance */}
              <motion.section
                variants={chartSectionVariants}
                initial="hidden"
                animate="visible"
                className="animate-lotus-bloom wuxing-analysis"
                style={{ animationDelay: '0.3s' }}
              >
                <FiveElementsBalance chart={chart} />
              </motion.section>

              {/* Detailed Analysis Section */}
              <motion.section
                variants={chartSectionVariants}
                initial="hidden"
                animate="visible"
                className="animate-ink-drop pattern-analysis"
                style={{ animationDelay: '0.6s' }}
              >
                <div className="chinese-card p-8 brush-border lotus-pattern">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl chinese-title mb-4">命理詳析</h3>
                    <div className="flex justify-center items-center gap-4">
                      <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
                      <span className="text-lg">🔮</span>
                      <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-yellow-600 to-transparent"></div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Four Pillars Analysis */}
                    <div className="space-y-6">
                      <div className="chinese-card p-6">
                        <h4 className="text-xl font-semibold chinese-text text-red-700 mb-3 flex items-center gap-2">
                          <span>🏛️</span>年柱 · 根基
                        </h4>
                        <p className="chinese-text text-gray-700 leading-relaxed">
                          年柱代表祖上根基與早年運勢，奠定一生的基本格局與先天稟賦，影響性格底蘊。
                        </p>
                      </div>
                      
                      <div className="chinese-card p-6">
                        <h4 className="text-xl font-semibold chinese-text text-yellow-700 mb-3 flex items-center gap-2">
                          <span>🌸</span>月柱 · 青春
                        </h4>
                        <p className="chinese-text text-gray-700 leading-relaxed">
                          月柱主管青年時期，關係到事業發展、人際關係與求學運勢，是人生發展的關鍵期。
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="chinese-card p-6">
                        <h4 className="text-xl font-semibold chinese-text text-blue-700 mb-3 flex items-center gap-2">
                          <span>☀️</span>日柱 · 本命
                        </h4>
                        <p className="chinese-text text-gray-700 leading-relaxed">
                          日柱為命主本身，代表個人性格、夫妻關係與中年運勢，是八字分析的核心。
                        </p>
                      </div>
                      
                      <div className="chinese-card p-6">
                        <h4 className="text-xl font-semibold chinese-text text-green-700 mb-3 flex items-center gap-2">
                          <span>🌙</span>時柱 · 晚景
                        </h4>
                        <p className="chinese-text text-gray-700 leading-relaxed">
                          時柱主晚年運勢，也關係到子女緣分與後代發展，影響人生的收穫與歸宿。
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Traditional Chinese wisdom quote */}
                  <div className="mt-8 text-center">
                    <div className="chinese-card p-6 bg-gradient-to-r from-red-50 to-yellow-50">
                      <p className="chinese-text text-lg text-gray-800 italic">
                        "天行健，君子以自強不息；地勢坤，君子以厚德載物"
                      </p>
                      <p className="chinese-text text-sm text-gray-600 mt-2">
                        ——《易經》
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      {/* Traditional Chinese footer elements */}
      {!showChart && (
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-20 pb-8 text-center chinese-text text-gray-500 text-sm"
        >
          <div className="flex justify-center items-center gap-4 mb-4">
            <span>🪷</span>
            <span>傳承千年智慧</span>
            <span>·</span>
            <span>現代科技演繹</span>
            <span>🪷</span>
          </div>
          <p>願您前程似錦，命運亨通</p>
        </motion.footer>
      )}
    </div>
  );
}
