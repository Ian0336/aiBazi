"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { toast } from 'react-toastify';
import ProfileForm from '@/components/ProfileForm';
import { getProfile, updateProfile } from '@/lib/profiles';
import { currentUserAtom, authLoadingAtom } from '@/store/auth';
import type { Profile } from '@/types/profile';

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const user = useAtomValue(currentUserAtom);
  const loading = useAtomValue(authLoadingAtom);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    getProfile(id)
      .then(setProfile)
      .catch((err) => setError(err.message ?? '載入失敗'));
  }, [id, loading, user]);

  if (loading || (!user && !error)) {
    return (
      <main className="min-h-screen flex items-center justify-center chinese-text">
        載入中…
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center chinese-text">
        請先登入
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
      <main className="min-h-screen flex items-center justify-center chinese-text">
        載入中…
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6 chinese-text">編輯命盤</h1>
      <div className="chinese-card p-6">
        <ProfileForm
          initial={profile}
          submitLabel="儲存修改"
          onSubmit={async (data) => {
            await updateProfile(id, data);
            toast.success('已更新');
            router.push('/profiles');
          }}
        />
      </div>
    </main>
  );
}
