"use client";

import Link from 'next/link';
import type { Profile } from '@/types/profile';

interface Props {
  profile: Profile;
  onDelete?: (id: string) => void;
}

export default function ProfileCard({ profile, onDelete }: Props) {
  const { id, label, gender, birth_year, birth_month, birth_day, birth_hour, is_lunar } = profile;
  return (
    <div className="chinese-card p-5 flex flex-col gap-3 chinese-text">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">{label}</h3>
        <span className="text-xs text-gray-500">{gender === 'male' ? '男' : '女'}</span>
      </div>
      <div className="text-sm text-gray-600">
        {is_lunar ? '農曆' : '國曆'} {birth_year} 年 {birth_month} 月 {birth_day} 日 ·{' '}
        {birth_hour.toString().padStart(2, '0')}:00
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <Link
          href={`/profiles/${id}/analyze`}
          className="px-3 py-1.5 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
        >
          AI 分析
        </Link>
        <Link
          href={`/profiles/${id}/edit`}
          className="px-3 py-1.5 text-xs rounded-md border border-gray-300 hover:bg-gray-50"
        >
          編輯
        </Link>
        {onDelete && (
          <button
            onClick={() => {
              if (confirm(`確定刪除「${label}」？此動作無法復原。`)) onDelete(id);
            }}
            className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            刪除
          </button>
        )}
      </div>
    </div>
  );
}
