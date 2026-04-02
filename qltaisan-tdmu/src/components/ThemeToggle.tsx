'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  // Tránh hydration mismatch (quan trọng khi dùng SSR)
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('system');
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    root.classList.remove('light', 'dark');

    if (newTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(systemPrefersDark ? 'dark' : 'light');
      localStorage.removeItem('theme'); // Theo hệ thống
    } else {
      root.classList.add(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) return null; // Tránh flash khi load

  return (
    <div className="relative group">
      <button
        className="p-3 hover:bg-zinc-800 rounded-2xl transition flex items-center gap-2 text-zinc-300 hover:text-white"
      >
        {theme === 'light' && <Sun className="w-5 h-5" />}
        {theme === 'dark' && <Moon className="w-5 h-5" />}
        {theme === 'system' && <Monitor className="w-5 h-5" />}
      </button>

      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl py-2 hidden group-hover:block z-50">
        <button
          onClick={() => changeTheme('light')}
          className={`w-full px-5 py-3 flex items-center gap-3 hover:bg-zinc-800 text-left ${theme === 'light' ? 'text-white' : 'text-zinc-400'}`}
        >
          <Sun className="w-5 h-5" />
          Giao diện Sáng
        </button>

        <button
          onClick={() => changeTheme('dark')}
          className={`w-full px-5 py-3 flex items-center gap-3 hover:bg-zinc-800 text-left ${theme === 'dark' ? 'text-white' : 'text-zinc-400'}`}
        >
          <Moon className="w-5 h-5" />
          Giao diện Tối
        </button>

        <button
          onClick={() => changeTheme('system')}
          className={`w-full px-5 py-3 flex items-center gap-3 hover:bg-zinc-800 text-left ${theme === 'system' ? 'text-white' : 'text-zinc-400'}`}
        >
          <Monitor className="w-5 h-5" />
          Theo hệ thống
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;