import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, LogOut, User, Home, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { quoteRequestService, adminProfileService } from '@/lib/supabaseService';
import { supabase } from '@/lib/supabase';
import type { QuoteRequest, AdminProfile } from '../types';

interface TopbarProps {
  sidebarCollapsed: boolean;
}

export function Topbar({ sidebarCollapsed: _ }: TopbarProps) {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [qRes, pRes, { data: { user } }] = await Promise.all([
          quoteRequestService.getAll(),
          adminProfileService.get(),
          supabase.auth.getUser()
        ]);
        setQuotes(qRes);
        if (pRes && user?.email) {
          pRes.email = user.email;
        }
        setProfile(pRes);
      } catch (err) {
        console.error('Failed to fetch topbar data:', err);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    navigate('/admin/login');
  };

  const pendingQuotes = quotes.filter(q => q.status === 'Pending');
  const unreadCount = pendingQuotes.length;
  const notifications = pendingQuotes.map(q => ({
    id: q.id,
    text: `New quote request from ${q.customerName}`,
    time: new Date(q.dateSubmitted).toLocaleDateString(),
    unread: true,
  }));

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      {/* Left — breadcrumb/title placeholder */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#F4B400] rounded-lg flex items-center justify-center lg:hidden">
          <Home className="w-4 h-4 text-[#0B2E6B]" />
        </div>
        <div className="hidden sm:block">
          <p className="text-xs text-gray-400">Maa Kamakhya Roofing Contractors</p>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu.Root open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenu.Trigger asChild>
            <button
              id="admin-notifications-btn"
              className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600"
            >
              <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#D72626] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-0 z-50 mt-2"
              align="end"
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-bold text-gray-900 text-sm">Notifications</p>
                <p className="text-xs text-gray-400">{unreadCount} unread</p>
              </div>
              <div className="py-1">
                {notifications.map(n => (
                  <DropdownMenu.Item
                    key={n.id}
                    onClick={() => navigate('/admin/quotes')}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer outline-none"
                  >
                    {n.unread && (
                      <span className="w-2 h-2 mt-1.5 rounded-full bg-[#0B2E6B] shrink-0" />
                    )}
                    <div className={n.unread ? '' : 'pl-5'}>
                      <p className="text-sm text-gray-800 leading-snug">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </DropdownMenu.Item>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100 text-center">
                <button 
                  onClick={() => navigate('/admin/quotes')}
                  className="text-xs text-[#0B2E6B] font-semibold hover:underline"
                >
                  View all quotes
                </button>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Admin profile dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              id="admin-profile-dropdown"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0B2E6B] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {profile?.name ? profile.name.charAt(0) : 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{profile?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-400">{profile?.role || 'Admin'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 p-1.5 z-50 mt-2"
              align="end"
            >
              <div className="px-3 py-2 mb-1">
                <p className="text-sm font-bold text-gray-900">{profile?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-400 truncate">{profile?.email || 'admin@example.com'}</p>
              </div>
              <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl cursor-pointer outline-none"
                onClick={() => navigate('/admin/profile')}
              >
                <User className="w-4 h-4" />
                Profile Settings
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl cursor-pointer outline-none"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
