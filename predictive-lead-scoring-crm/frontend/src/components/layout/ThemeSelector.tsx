import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeOptions: { id: ThemeMode; name: string; color: string; desc: string }[] = [
    { id: 'indigo', name: 'Dark Indigo', color: 'bg-indigo-500', desc: 'Default SaaS Aesthetic' },
    { id: 'cyber', name: 'Midnight Cyan', color: 'bg-cyan-400', desc: 'Neon Cyberpunk Theme' },
    { id: 'emerald', name: 'Emerald Growth', color: 'bg-emerald-500', desc: 'Finance & Growth Theme' },
    { id: 'amber', name: 'Sunset Executive', color: 'bg-amber-500', desc: 'Warm Executive Theme' },
    { id: 'light', name: 'Clean Light Mode', color: 'bg-slate-200 border border-slate-400', desc: 'High Contrast Crisp Light' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors flex items-center space-x-1.5"
        title="Customize Theme"
        aria-label="Theme Selector"
      >
        <Palette className="w-5 h-5 text-indigo-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 space-y-2">
          <div className="px-2 py-1.5 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center">
              <Palette className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Theme Customizer
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-mono">{theme}</span>
          </div>

          <div className="space-y-1">
            {themeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setTheme(opt.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                  theme === opt.id
                    ? 'bg-indigo-600/20 text-white font-bold border border-indigo-500/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={`w-3.5 h-3.5 rounded-full ${opt.color} shrink-0`} />
                  <div className="text-left">
                    <p className="font-semibold leading-none">{opt.name}</p>
                    <p className="text-[10px] text-slate-400 leading-none mt-1">{opt.desc}</p>
                  </div>
                </div>

                {theme === opt.id && <Check className="w-4 h-4 text-indigo-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;

