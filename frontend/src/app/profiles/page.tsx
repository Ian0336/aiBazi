"use client";

import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { currentUserAtom, authLoadingAtom, startGoogleLogin } from '@/store/auth';
import { listProfiles, deleteProfile } from '@/lib/profiles';
import type { Profile } from '@/types/profile';
import ProfileCard from '@/components/ProfileCard';

export default function ProfilesPage() {
  const router = useRouter();
  const user = useAtomValue(currentUserAtom);
  const authLoading = useAtomValue(authLoadingAtom);
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    listProfiles()
      .then(setProfiles)
      .catch((err) => setError(err.message ?? '載入失敗'));
  }, [authLoading, user]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProfile(id);
      setProfiles((prev) => (prev ?? []).filter((p) => p.id !== id));
      toast.success('已刪除');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '刪除失敗');
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="chinese-text">載入中…</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="chinese-text text-center max-w-sm">
          <div className="text-2xl font-bold mb-3">請先登入</div>
          <p className="text-sm text-gray-600 mb-6">命盤儲存功能僅限登入用戶。</p>
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

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 chinese-text">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">我的命盤</h1>
        <Link
          href="/profiles/new"
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
        >
          + 新增命盤
        </Link>
      </header>

      {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

      {profiles === null ? (
        <div>載入中…</div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          尚未儲存任何命盤。
          <div className="mt-4">
            <Link href="/profiles/new" className="underline">
              新增第一個命盤
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {profiles.map((p) => (
            <ProfileCard key={p.id} profile={p} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </main>
  );
}
