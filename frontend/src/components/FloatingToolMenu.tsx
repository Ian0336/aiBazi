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
      const formatHiddenStems = (stems: { gan: string, ten_deity: string }[] = []) => {
        return stems.length > 0
          ? stems.map((stem) => `${stem.gan}(${stem.ten_deity})`).join(', ')
          : '-';
      };

      const formatShensha = (shensha?: string[]) => {
        return shensha && shensha.length > 0 ? shensha.join(', ') : '-';
      };

      const formatList = (items?: string[]) => {
        return items && items.length > 0 ? items.join(', ') : '-';
      };

      const formatPillarLine = (
        label: string,
        pillar: BaziChart['hour_pillar']
      ) => {
        return `- ${label} | 干支=${pillar.ganzhi} | 天干=${pillar.gan} | 地支=${pillar.zhi} | 天干十神=${pillar.ten_deity} | 地支十神=${pillar.zhi_ten_deity} | 藏干=${formatHiddenStems(pillar.hidden_stems)} | 納音=${pillar.nayin} | 神煞=${formatShensha(pillar.shensha)}`;
      };

      const formatDayunPillarLine = (pillar?: BaziChart['dayun_pillar']) => {
        if (!pillar) {
          return '- 目前大運 | -';
        }

        return `- 目前大運 | 干支=${pillar.ganzhi} | 天干=${pillar.gan} | 地支=${pillar.zhi} | 天干十神=${pillar.gan_ten_deity} | 地支十神=${pillar.zhi_ten_deity} | 藏干=${formatHiddenStems(pillar.hidden_stems)} | 納音=${pillar.nayin} | 神煞=${formatShensha(pillar.shensha)}`;
      };

      const formatLiunianPillarLine = (pillar?: BaziChart['liunian_pillar']) => {
        if (!pillar) {
          return '- 目前流年 | -';
        }

        return `- 目前流年 | 年份=${pillar.year} | 歲數=${pillar.age} | 干支=${pillar.ganzhi} | 天干=${pillar.gan} | 地支=${pillar.zhi} | 天干十神=${pillar.gan_ten_deity} | 地支十神=${pillar.zhi_ten_deity} | 藏干=${formatHiddenStems(pillar.hidden_stems)} | 納音=${pillar.nayin} | 神煞=${formatShensha(pillar.shensha)}`;
      };

      const currentDayunEntry = chart.dayun_pillar
        ? chart.dayun.find((dayun) => dayun.ganzhi === chart.dayun_pillar?.ganzhi)
        : undefined;

      const dayunTimeline = chart.dayun.map((dayun, index) => {
        const startYear = dayun.liunian[0]?.year;
        const endYear = dayun.liunian[dayun.liunian.length - 1]?.year;
        const yearRange = startYear && endYear ? `${startYear}-${endYear}` : '-';

        return `- 大運_${index + 1} | 起始歲數=${dayun.start_age} | 年份區間=${yearRange} | 干支=${dayun.ganzhi} | 天干=${dayun.gan} | 地支=${dayun.zhi} | 天干十神=${dayun.gan_ten_deity} | 地支十神=${dayun.zhi_ten_deity} | 藏干=${formatHiddenStems(dayun.hidden_stems)} | 地支關係=${formatList(dayun.zhi_relationships)} | 納音=${dayun.nayin} | 特殊組合=${formatList(dayun.special_combinations)} | 是否空亡=${dayun.is_empty} | 是否重複=${dayun.is_repeated}`;
      });

      const currentDayunLiunianTimeline = currentDayunEntry?.liunian?.length
        ? currentDayunEntry.liunian.map((liunian, index) => {
            return `- 流年_${index + 1} | 年份=${liunian.year} | 歲數=${liunian.age} | 干支=${liunian.ganzhi} | 天干=${liunian.gan} | 地支=${liunian.zhi} | 天干十神=${liunian.gan_ten_deity} | 地支十神=${liunian.zhi_ten_deity} | 藏干=${formatHiddenStems(liunian.hidden_stems)} | 地支關係=${formatList(liunian.zhi_relationships)} | 納音=${liunian.nayin} | 特殊組合=${formatList(liunian.special_combinations)} | 特殊格局=${formatList(liunian.special_patterns)} | 是否空亡=${liunian.is_empty} | 是否重複=${liunian.is_repeated}`;
          })
        : ['- 目前大運沒有對應的流年資料'];

      // Format chart data for clipboard in a key/value layout that is easier for AI to parse.
      const text = [
        '# 八字命盤資料',
        '',
        '## 基本資料',
        `- 國曆=${chart.solar_date}`,
        `- 農曆=${convertToROCDate(chart.lunar_date)}`,
        '',
        '## 四柱',
        formatPillarLine('時柱', chart.hour_pillar),
        formatPillarLine('日柱', chart.day_pillar),
        formatPillarLine('月柱', chart.month_pillar),
        formatPillarLine('年柱', chart.year_pillar),
        '',
        '## 目前運勢',
        formatDayunPillarLine(chart.dayun_pillar),
        formatLiunianPillarLine(chart.liunian_pillar),
        '',
        '## 大運列表',
        ...dayunTimeline,
        '',
        '## 目前大運的流年列表',
        ...currentDayunLiunianTimeline,
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
