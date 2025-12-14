"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { BaziChart } from '@/types/bazi';
import { convertToROCDate } from '@/util/bazi';

interface FloatingToolMenuProps {
  chart: BaziChart;
}

const FloatingToolMenu: React.FC<FloatingToolMenuProps> = ({ chart }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCopy = () => {
    try {
      const formatHiddenStems = (stems: { gan: string, ten_deity: string }[]) => {
        return stems.map(s => `${s.gan}(${s.ten_deity})`).join(' ');
      };

      const formatShensha = (shensha?: string[]) => {
        return shensha && shensha.length > 0 ? shensha.join(' ') : '-';
      };

      // Format chart data for clipboard (LLM-friendly Markdown format)
      const text = [
        '# 八字命盤分析資料',
        '',
        '## 基本資料',
        `- 生辰：${chart.solar_date}`,
        `- 農曆：${convertToROCDate(chart.lunar_date)}`,
        '',
        '## 四柱詳細資料',
        '| 項目 | 時柱 | 日柱 | 月柱 | 年柱 |',
        '| :-: | :-: | :-: | :-: | :-: |',
        `| **天干** | ${chart.hour_pillar.gan} | ${chart.day_pillar.gan} | ${chart.month_pillar.gan} | ${chart.year_pillar.gan} |`,
        `| **地支** | ${chart.hour_pillar.zhi} | ${chart.day_pillar.zhi} | ${chart.month_pillar.zhi} | ${chart.year_pillar.zhi} |`,
        `| **十神(主星)** | ${chart.hour_pillar.ten_deity} | ${chart.day_pillar.ten_deity} | ${chart.month_pillar.ten_deity} | ${chart.year_pillar.ten_deity} |`,
        `| **星運(副星)** | ${chart.hour_pillar.zhi_ten_deity} | ${chart.day_pillar.zhi_ten_deity} | ${chart.month_pillar.zhi_ten_deity} | ${chart.year_pillar.zhi_ten_deity} |`,
        `| **藏干** | ${formatHiddenStems(chart.hour_pillar.hidden_stems)} | ${formatHiddenStems(chart.day_pillar.hidden_stems)} | ${formatHiddenStems(chart.month_pillar.hidden_stems)} | ${formatHiddenStems(chart.year_pillar.hidden_stems)} |`,
        `| **納音** | ${chart.hour_pillar.nayin} | ${chart.day_pillar.nayin} | ${chart.month_pillar.nayin} | ${chart.year_pillar.nayin} |`,
        `| **神煞** | ${formatShensha(chart.hour_pillar.shensha)} | ${formatShensha(chart.day_pillar.shensha)} | ${formatShensha(chart.month_pillar.shensha)} | ${formatShensha(chart.year_pillar.shensha)} |`,
        ''
      ].join('\n');

      navigator.clipboard.writeText(text).then(() => {
        toast.success("已複製詳細命盤資訊！", {
          position: "bottom-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      });
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error("複製失敗");
    }
    setIsMenuOpen(false);
  };

  const handlePrint = () => {
    router.push('/print');
    setIsMenuOpen(false);
  };

  return (
    <div ref={menuRef} className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 print:hidden">
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3 items-end mb-2"
          >
            {/* Copy Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="btn-chinese flex items-center gap-2 shadow-lg !py-2 !px-4 min-w-[100px] justify-center text-sm"
              title="複製連結"
            >
              <span className="text-xl">📋</span>
              <span className="font-medium">複製</span>
            </motion.button>

            {/* Print Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handlePrint();
              }}
              className="btn-chinese flex items-center gap-2 shadow-lg !py-2 !px-4 min-w-[100px] justify-center text-sm"
              title="列印八字命盤"
            >
              <span className="text-xl">🖨️</span>
              <span className="font-medium">列印</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="btn-chinese !rounded-full !w-16 !h-16 !p-0 flex items-center justify-center shadow-xl overflow-hidden relative border-2 border-[#B22222]"
        title="更多工具"
      >
        <motion.div
          animate={{ rotate: isMenuOpen ? 360 : 0 }}
          transition={isMenuOpen ? { duration: 4, repeat: Infinity, ease: "linear" } : { duration: 0.5 }}
          className="w-full h-full relative"
        >
           <div className="w-full h-full rounded-full bg-[linear-gradient(90deg,white_50%,black_50%)] relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-full" />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-black rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
           </div>
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingToolMenu;
