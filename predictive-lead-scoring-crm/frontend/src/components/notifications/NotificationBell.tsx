import React, { useRef, useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationProvider';
import { NotificationDropdown } from './NotificationDropdown';

export const NotificationBell: React.FC = () => {
  const { unreadCount, connectionStatus } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#29292C] transition-colors focus:outline-none flex items-center justify-center group"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />

        {/* Unread Count Badge */}
        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-[#FF7A00] text-[10px] font-black text-white rounded-full flex items-center justify-center ring-2 ring-[#0B0B0D] shadow-xs animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : (
          /* Subtle Live Connection Status Dot */
          <span
            className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-[#0B0B0D] ${
              connectionStatus === 'connected' ? 'bg-[#FF7A00]' : 'bg-zinc-600'
            }`}
            title={connectionStatus === 'connected' ? 'Real-Time Live' : 'Reconnecting...'}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
    </div>
  );
};

