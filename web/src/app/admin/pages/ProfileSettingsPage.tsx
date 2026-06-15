import React, { useState } from 'react';
import { Save, Eye, EyeOff, Lock, User, Camera, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { adminProfileService } from '@/lib/supabaseService';
import { supabase } from '@/lib/supabase';
import type { AdminProfile } from '../types';

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all bg-white';

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await adminProfileService.get();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.last_sign_in_at) {
          data.lastLogin = user.last_sign_in_at;
        }
        
        setProfile(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        toast.error('Failed to load profile settings');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      setSavingProfile(true);
      await adminProfileService.update(profile);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    const errs: Record<string, string> = {};
    if (!passwords.current) errs.current = 'Current password is required';
    if (!passwords.new) errs.new = 'New password is required';
    else if (passwords.new.length < 8) errs.new = 'Must be at least 8 characters';
    if (passwords.new !== passwords.confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setPasswordErrors(errs); return; }
    
    setPasswordErrors({});
    setSavingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      
      setPasswords({ current: '', new: '', confirm: '' });
      toast.success('Password changed successfully');
    } catch (err: any) {
      console.error('Failed to change password:', err);
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const toggleShow = (field: 'current' | 'new' | 'confirm') =>
    setShowPasswords(v => ({ ...v, [field]: !v[field] }));

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#0B2E6B]/30 border-t-[#0B2E6B] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Profile Settings"
        subtitle="Manage your admin account details and security"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Avatar & Quick Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-2xl bg-[#0B2E6B] flex items-center justify-center mx-auto text-white text-3xl font-black font-['Poppins',sans-serif]">
                {profile.name.charAt(0)}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#F4B400] rounded-full flex items-center justify-center shadow-md hover:bg-yellow-400 transition-colors">
                <Camera className="w-3.5 h-3.5 text-[#0B2E6B]" />
              </button>
            </div>
            <h3 className="font-black text-gray-900 font-['Poppins',sans-serif]">{profile.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{profile.email}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
              <Shield className="w-3 h-3 text-[#0B2E6B]" />
              <span className="text-xs font-bold text-[#0B2E6B]">{profile.role}</span>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100 text-left space-y-2">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Last Login</p>
                <p className="text-xs text-gray-600 font-medium mt-0.5">
                  {new Date(profile.lastLogin).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Profile Picture</p>
                <button className="mt-1 text-xs font-semibold text-[#0B2E6B] hover:underline flex items-center gap-1">
                  <Camera className="w-3 h-3" /> Upload Photo (coming soon)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Admin Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-[#0B2E6B]" />
              Admin Details
            </h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="admin-name" className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                  <input
                    id="admin-name"
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile(v => v ? { ...v, name: e.target.value } : null)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="admin-role" className="block text-xs font-semibold text-gray-600 mb-1.5">Role</label>
                  <input
                    id="admin-role"
                    type="text"
                    value={profile.role}
                    onChange={e => setProfile(v => v ? { ...v, role: e.target.value } : null)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="admin-email-profile" className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                <input
                  id="admin-email-profile"
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile(v => v ? { ...v, email: e.target.value } : null)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2E6B] text-white text-sm font-bold hover:bg-[#0a2660] transition-colors disabled:opacity-60"
              >
                {savingProfile ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {savingProfile ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#D72626]" />
              Change Password
            </h2>
            <div className="space-y-4">
              {([
                { key: 'current', label: 'Current Password', id: 'pwd-current' },
                { key: 'new', label: 'New Password', id: 'pwd-new' },
                { key: 'confirm', label: 'Confirm New Password', id: 'pwd-confirm' },
              ] as const).map(({ key, label, id }) => (
                <div key={key}>
                  <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      id={id}
                      type={showPasswords[key] ? 'text' : 'password'}
                      value={passwords[key]}
                      onChange={e => setPasswords(v => ({ ...v, [key]: e.target.value }))}
                      placeholder="••••••••"
                      className={`${inputClass} pr-10 ${passwordErrors[key] ? 'border-red-400 bg-red-50' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow(key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors[key] && <p className="mt-1.5 text-xs text-red-500 font-medium">{passwordErrors[key]}</p>}
                </div>
              ))}
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  Password must be at least 8 characters long. Use a mix of letters, numbers, and symbols for better security.
                </p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D72626] text-white text-sm font-bold hover:bg-[#b91c1c] transition-colors disabled:opacity-60"
              >
                {savingPassword ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
                {savingPassword ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
