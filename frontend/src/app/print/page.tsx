"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { chartAtom } from '@/store/jotai';
import PrintableBaziChart from '@/components/PrintableBaziChart';

export default function PrintPage() {
  const [chart] = useAtom(chartAtom);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // 如果没有 chart 数据，返回主页
    if (isClient && !chart) {
      router.push('/');
      return;
    }

    // 页面加载完成后自动打印
    if (isClient && chart) {
      // 延迟一下确保页面完全渲染
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [chart, router, isClient]);



  if (!isClient || !chart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ lineHeight: 1.3, margin: 0, padding: 0 }}>
      {/* Back to home button - hidden when printing */}
      <div className="no-print p-4 text-center border-b flex justify-between">
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2  text-white rounded  btn-chinese"
        >
          ← 返回
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2  text-white rounded  btn-chinese"
        >
          列印
        </button>
      </div>


      
      <PrintableBaziChart chart={chart} />
      
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
} 