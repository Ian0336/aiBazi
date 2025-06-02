"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BaziForm from '@/components/BaziForm';
import BaziResult from '@/components/BaziResult';
import AnalysisModal from '@/components/AnalysisModal';
import ClientOnly from '@/components/ClientOnly';
import { BaziChart, BaziInput } from '@/types/bazi';

export default function HomePage() {
  const [chart, setChart] = useState<BaziChart | null>(null);
  const [originalInput, setOriginalInput] = useState<BaziInput | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [particles, setParticles] = useState<React.ReactElement[]>([]);

  // Generate particles on client side only
  useEffect(() => {
    const generateParticles = () => {      
      return Array.from({ length: 20 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-40"
          initial={{
            x: Math.random() * 1200,
            y: Math.random() * 800,
          }}
          animate={{
            x: Math.random() * 1200,
            y: Math.random() * 800,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
          style={{
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
          }}
        />
      ));
    };

    setParticles(generateParticles());
  }, []);

  const handleCalculate = (newChart: BaziChart, input: BaziInput) => {
    setChart(newChart);
    setOriginalInput(input);
    setAnalysis(''); // Clear previous analysis
  };

  const handleAnalyze = async () => {
    if (!chart) return;

    setIsAnalyzing(true);
    try {
      console.log("chart", chart);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year_ganzhi: chart.year_pillar.ganzhi,
          month_ganzhi: chart.month_pillar.ganzhi,
          day_ganzhi: chart.day_pillar.ganzhi, 
          hour_ganzhi: chart.hour_pillar.ganzhi
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysis(result.analysis || '分析結果暫時無法取得，請稍後再試。');
        setIsModalOpen(true);
      } else if (response.status === 429) {
        setAnalysis('您已達到每小時分析次數上限，請下個小時再來試試看。😊');
        setIsModalOpen(true);
      } else {
        setAnalysis('AI 分析服務暫時無法使用，請稍後再試。');
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error analyzing Bazi:', error);
      setAnalysis('連線錯誤，請檢查網路連線後再試。');
      setIsModalOpen(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  const titleVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.3
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <ClientOnly>
          {particles}
        </ClientOnly>
      </div>

      {/* Main content */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header with enhanced styling */}
          <motion.header 
            className="text-center mb-16"
            variants={titleVariants}
          >
            {/* Glowing orb behind title */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-purple-600/20 rounded-full blur-3xl -z-10"></div>
            
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-6 relative"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <span className="gradient-text glow-text font-cyber">
                AI 八字算命
              </span>
              
              {/* Floating symbols around title */}
              <motion.div 
                className="absolute -top-8 -left-8 text-3xl opacity-60"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                ✨
              </motion.div>
              <motion.div 
                className="absolute -top-4 -right-12 text-2xl opacity-40"
                animate={{ 
                  rotate: -360,
                  y: [-10, 10, -10]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🔮
              </motion.div>
              <motion.div 
                className="absolute -bottom-6 left-4 text-xl opacity-50"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🌟
              </motion.div>
            </motion.h1>
            
            <motion.div
              variants={subtitleVariants}
              className="space-y-6"
            >
              <p className="text-2xl md:text-3xl text-slate-200 mb-8 font-light">
                融合古老智慧與現代 <span className="text-cyan-400 font-semibold">AI 技術</span>的命理分析
              </p>
              
              {/* Enhanced feature badges */}
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                {[
                  { icon: '🔮', text: '準確計算', color: 'from-cyan-400 to-blue-500' },
                  { icon: '🤖', text: 'AI 分析', color: 'from-purple-400 to-pink-500' },
                  { icon: '⚡', text: '即時結果', color: 'from-orange-400 to-red-500' },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    className="relative group"
                  >
                    <div className={`bg-gradient-to-r ${feature.color} p-px rounded-full`}>
                      <div className="bg-gray-900 rounded-full px-6 py-3 flex items-center space-x-2 hover:bg-gray-800 transition-colors">
                        <span className="text-lg">{feature.icon}</span>
                        <span className="text-white font-medium">{feature.text}</span>
                      </div>
                    </div>
                    
                    {/* Hover glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.header>

          {/* Main Content with enhanced spacing */}
          <div className="space-y-12">
            {/* Form Section */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <BaziForm 
                onCalculate={handleCalculate}
                isLoading={isCalculating}
              />
            </motion.section>

            {/* Results Section */}
            {chart && originalInput && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <BaziResult 
                  chart={chart}
                  originalInput={originalInput}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                />
              </motion.section>
            )}
          </div>

          {/* Enhanced Footer */}
          <motion.footer 
            className="mt-24 text-center text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <div className="relative">
              {/* Decorative line */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
              
              <div className="pt-12 pb-8">
                <motion.p 
                  className="text-lg mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                >
                  © 2024 AI 八字算命系統 | 結合傳統命理與人工智慧技術
                </motion.p>
                
                <motion.div 
                  className="flex flex-wrap justify-center gap-8 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4, duration: 0.4 }}
                >
                  {[
                    { icon: '⚡', text: '極速計算' },
                    { icon: '🎯', text: '精準分析' },
                    { icon: '🔒', text: '隱私保護' },
                    { icon: '🌐', text: '雲端服務' },
                  ].map((item, index) => (
                    <motion.span 
                      key={item.text}
                      className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors cursor-default"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span>{item.icon}</span>
                      <span>{item.text}</span>
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.footer>
        </div>

        {/* Analysis Modal */}
        <AnalysisModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          analysis={analysis}
        />
      </motion.main>

      {/* Enhanced background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <ClientOnly>
          {/* Large floating orbs */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute rounded-full opacity-5"
              style={{
                width: `${200 + i * 50}px`,
                height: `${200 + i * 50}px`,
                background: `linear-gradient(135deg, ${
                  ['#00f3ff', '#8b5cf6', '#f97316', '#00ff88'][i]
                }, transparent)`,
                left: `${20 + i * 20}%`,
                top: `${10 + i * 15}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
                opacity: [0.03, 0.08, 0.03],
              }}
              transition={{
                duration: 15 + i * 3,
                repeat: Infinity,
                delay: i * 2,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Scanning line effect */}
          <motion.div
            className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"
            animate={{
              y: [0, 800],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </ClientOnly>

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
    </div>
  );
}
