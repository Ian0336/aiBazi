"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { apiBase } from '@/lib/baseUrl';
import { jotaiStore } from '@/store/jotai';
import { accessTokenAtom, currentUserAtom } from '@/store/auth';
import type { AccessTokenResponse, CurrentUser } from '@/types/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'error'>('pending');

  useEffect(() => {
    const error = params.get('error');
    const ok = params.get('ok');

    if (error) {
      toast.error(`登入失敗：${error}`);
      setStatus('error');
      const t = setTimeout(() => router.replace('/'), 1500);
      return () => clearTimeout(t);
    }
    if (!ok) {
      router.replace('/');
      return;
    }

    (async () => {
      try {
        const refreshResp = await fetch(`${apiBase()}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!refreshResp.ok) throw new Error('refresh failed');
        const tok = (await refreshResp.json()) as AccessTokenResponse;
        jotaiStore.set(accessTokenAtom, tok.access_token);

        const meResp = await fetch(`${apiBase()}/auth/me`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${tok.access_token}` },
        });
        if (meResp.ok) {
          jotaiStore.set(currentUserAtom, (await meResp.json()) as CurrentUser);
        }
        toast.success('登入成功');
        router.replace('/');
      } catch (err) {
        toast.error('登入處理失敗，請重試');
        setStatus('error');
        setTimeout(() => router.replace('/'), 1500);
      }
    })();
  }, [params, router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center chinese-text">
        {status === 'pending' ? (
          <>
            <div className="text-2xl font-bold mb-2">登入中…</div>
            <div className="text-sm text-gray-500">正在驗證身份</div>
          </>
        ) : (
          <div className="text-lg text-red-600">登入失敗，將自動返回首頁</div>
        )}
      </div>
    </main>
  );
}
