"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BaziForm from '@/components/BaziForm';
import FiveElementsBalance from '@/components/FiveElementsBalance';
import TraditionalBaziChart from '@/components/TraditionalBaziChart';
import StickyHeader from '@/components/StickyHeader';
import { BaziChart as BaziChartType, BaziInput } from '@/types/bazi';
import { useAtom } from 'jotai';
import { chartAtom, originalInputAtom } from '@/store/jotai';

export default function HomePage() {
  const [chart, setChart] = useAtom(chartAtom);
  const [originalInput, setOriginalInput] = useAtom(originalInputAtom);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
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
    scrollToTop();
  };

  const handleEdit = () => {
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
      </div>
      {/* Traditional Chinese Seal/Stamp in corner */}
      <div className="fixed top-6 left-6 z-10 opacity-20">
        <div className="w-16 h-16 bg-red-600 rounded-sm rotate-12 flex items-center justify-center chinese-text text-white text-xs font-bold">
          <span>八字</span>
        </div>
      </div>

      {/* Sticky Header - only show when chart is calculated */}
      <AnimatePresence>
        {originalInput && (
          <StickyHeader input={originalInput} onEdit={handleEdit} />
        )}
      </AnimatePresence>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto px-1 md:px-4 py-8 relative z-10"
      >
        {/* Header Section */}
        <AnimatePresence mode="wait">
          {!chart && (
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
          {!chart && (
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
          {chart && (
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      {/* Traditional Chinese footer elements */}
      {!chart && (
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
