"use client";

import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import type { Profile, ProfileCreate } from '@/types/profile';

interface Props {
  initial?: Profile;
  submitLabel: string;
  onSubmit: (data: ProfileCreate) => Promise<void>;
}

const HOUR_BLOCKS = [
  { name: '子時', range: '23:00-01:00', value: 0 },
  { name: '丑時', range: '01:00-03:00', value: 2 },
  { name: '寅時', range: '03:00-05:00', value: 4 },
  { name: '卯時', range: '05:00-07:00', value: 6 },
  { name: '辰時', range: '07:00-09:00', value: 8 },
  { name: '巳時', range: '09:00-11:00', value: 10 },
  { name: '午時', range: '11:00-13:00', value: 12 },
  { name: '未時', range: '13:00-15:00', value: 14 },
  { name: '申時', range: '15:00-17:00', value: 16 },
  { name: '酉時', range: '17:00-19:00', value: 18 },
  { name: '戌時', range: '19:00-21:00', value: 20 },
  { name: '亥時', range: '21:00-23:00', value: 22 },
];

export default function ProfileForm({ initial, submitLabel, onSubmit }: Props) {
  const today = new Date();
  const [label, setLabel] = useState(initial?.label ?? '');
  const [gender, setGender] = useState<'male' | 'female'>(initial?.gender ?? 'male');
  const [year, setYear] = useState<number>(initial?.birth_year ?? today.getFullYear() - 30);
  const [month, setMonth] = useState<number>(initial?.birth_month ?? 1);
  const [day, setDay] = useState<number>(initial?.birth_day ?? 1);
  const [hour, setHour] = useState<number>(initial?.birth_hour ?? 12);
  const [isLunar, setIsLunar] = useState(initial?.is_lunar ?? false);
  const [isLeapMonth, setIsLeapMonth] = useState(initial?.is_leap_month ?? false);
  const [location, setLocation] = useState(initial?.location ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!label.trim()) {
      setError('請輸入命盤名稱');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        label: label.trim(),
        gender,
        birth_year: year,
        birth_month: month,
        birth_day: day,
        birth_hour: hour,
        is_lunar: isLunar,
        is_leap_month: isLunar && isLeapMonth,
        location: location.trim() || null,
        notes: notes.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '儲存失敗');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 chinese-text">
      <div>
        <label className="block text-sm font-medium mb-1">命盤名稱</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="例如：我、老婆、小明"
          maxLength={80}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">性別</label>
        <div className="flex gap-3">
          {(['male', 'female'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`flex-1 py-2 rounded-md border ${
                gender === g
                  ? 'bg-red-50 border-red-400 text-red-700 font-semibold'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {g === 'male' ? '男' : '女'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">年</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value || '0', 10))}
            min={1900}
            max={2100}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">月</label>
          <input
            type="number"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value || '0', 10))}
            min={1}
            max={12}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">日</label>
          <input
            type="number"
            value={day}
            onChange={(e) => setDay(parseInt(e.target.value || '0', 10))}
            min={1}
            max={31}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">時辰</label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {HOUR_BLOCKS.map((h) => (
            <button
              key={h.value}
              type="button"
              onClick={() => setHour(h.value)}
              className={`px-2 py-2 rounded-md border text-xs ${
                hour === h.value
                  ? 'bg-red-50 border-red-400 text-red-700 font-semibold'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              title={h.range}
            >
              <div>{h.name}</div>
              <div className="opacity-60">{h.range}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isLunar}
            onChange={(e) => setIsLunar(e.target.checked)}
          />
          <span>農曆生日</span>
        </label>
        {isLunar && (
          <label className="flex items-center gap-2 ml-6">
            <input
              type="checkbox"
              checked={isLeapMonth}
              onChange={(e) => setIsLeapMonth(e.target.checked)}
            />
            <span>閏月</span>
          </label>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">出生地（選填）</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="例如：台北"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">備註（選填）</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <motion.button
        type="submit"
        disabled={submitting}
        whileTap={{ scale: 0.97 }}
        className="w-full py-2.5 rounded-md bg-red-600 text-white font-semibold disabled:opacity-50"
      >
        {submitting ? '儲存中…' : submitLabel}
      </motion.button>
    </form>
  );
}
