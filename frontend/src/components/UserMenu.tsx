"use client";

import { useState, useRef, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { currentUserAtom, authLoadingAtom, startGoogleLogin, logout } from '@/store/auth';

export default function UserMenu() {
  const user = useAtomValue(currentUserAtom);
  const loading = useAtomValue(authLoadingAtom);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (loading && !user) {
    return <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" aria-hidden />;
  }

  if (!user) {
    return (
      <button
        onClick={() => startGoogleLogin().catch(() => {})}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 chinese-text"
      >
        以 Google 登入
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full"
        aria-label="開啟使用者選單"
      >
        {user.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.picture}
            alt=""
            className="w-9 h-9 rounded-full border border-gray-200"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-200 to-yellow-200 flex items-center justify-center text-sm font-semibold">
            {(user.name ?? user.email).slice(0, 1).toUpperCase()}
          </div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50 chinese-text"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-semibold truncate">{user.name ?? user.email}</div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
            <Link
              href="/profiles"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm hover:bg-gray-50"
            >
              我的命盤
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                logout().then(() => window.location.assign('/'));
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
            >
              登出
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
