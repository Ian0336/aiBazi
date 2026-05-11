"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { currentUserAtom, authLoadingAtom, startGoogleLogin } from '@/store/auth';
import { getProfile } from '@/lib/profiles';
import { getQuota } from '@/lib/ai';
import type { Profile } from '@/types/profile';
import type { QuotaStatus } from '@/types/auth';
import AIAnalysisStream from '@/components/AIAnalysisStream';

export default function AnalyzePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const user = useAtomValue(currentUserAtom);
  const authLoading = useAtomValue(authLoadingAtom);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshQuota = () => {
    getQuota()
      .then(setQuota)
      .catch(() => {});
  };

  useEffect(() => {
    if (authLoading || !user) return;
    Promise.all([getProfile(id), getQuota()])
      .then(([p, q]) => {
        setProfile(p);
        setQuota(q);
      })
      .catch((err) => setError(err.message ?? '載入失敗'));
  }, [authLoading, user, id]);

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center chinese-text">載入中…</main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="chinese-text text-center max-w-sm">
          <div className="text-2xl font-bold mb-3">請先登入</div>
          <p className="text-sm text-gray-600 mb-6">AI 分析功能需要登入帳號。</p>
          <button
            onClick={() => startGoogleLogin().catch(() => {})}
            className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            以 Google 登入
          </button>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-600 chinese-text">
        {error}
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center chinese-text">載入中…</main>
    );
  }

  const exhausted = quota !== null && quota.remaining <= 0;
  const reset = quota ? new Date(quota.resets_at) : null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 chinese-text">
      <nav className="text-sm text-gray-500 mb-2">
        <Link href="/profiles" className="hover:underline">
          ← 我的命盤
        </Link>
      </nav>
      <header className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{profile.label} · AI 分析</h1>
          <p className="text-sm text-gray-600 mt-1">
            {profile.is_lunar ? '農曆' : '國曆'} {profile.birth_year} 年 {profile.birth_month} 月{' '}
            {profile.birth_day} 日 {profile.birth_hour.toString().padStart(2, '0')}:00 ·{' '}
            {profile.gender === 'male' ? '男' : '女'}
          </p>
        </div>
        {quota && (
          <div className="text-right text-sm text-gray-600">
            <div>
              今日剩餘 <span className="font-semibold text-red-600">{quota.remaining}</span> /{' '}
              {quota.limit} 次
            </div>
            {reset && (
              <div className="text-xs text-gray-400">
                重置於 {reset.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
              </div>
            )}
          </div>
        )}
      </header>

      {exhausted ? (
        <div className="p-6 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          今日 AI 分析次數已用完，請明天 00:00 後再試。
        </div>
      ) : (
        <div className="chinese-card p-6">
          <AIAnalysisStream profileId={id} onComplete={refreshQuota} />
        </div>
      )}
    </main>
  );
}
