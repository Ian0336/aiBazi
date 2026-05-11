"use client";

import { useRouter } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { toast } from 'react-toastify';
import ProfileForm from '@/components/ProfileForm';
import { createProfile } from '@/lib/profiles';
import { currentUserAtom, authLoadingAtom, startGoogleLogin } from '@/store/auth';

export default function NewProfilePage() {
  const router = useRouter();
  const user = useAtomValue(currentUserAtom);
  const loading = useAtomValue(authLoadingAtom);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center chinese-text">
        載入中…
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="chinese-text text-center max-w-sm">
          <div className="text-2xl font-bold mb-3">請先登入</div>
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
    <main className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6 chinese-text">新增命盤</h1>
      <div className="chinese-card p-6">
        <ProfileForm
          submitLabel="儲存命盤"
          onSubmit={async (data) => {
            const created = await createProfile(data);
            toast.success(`已新增「${created.label}」`);
            router.push('/profiles');
          }}
        />
      </div>
    </main>
  );
}
