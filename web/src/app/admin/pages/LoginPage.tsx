import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Home, Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      toast.error('Login Failed', { description: error.message });
      setErrors({ password: error.message });
    } else {
      toast.success('Welcome back, Admin!', { description: 'Redirecting to dashboard…' });
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B2E6B] relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-[#F4B400]/10" />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-white/5" />

        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="w-20 h-20 bg-[#F4B400] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Home className="w-10 h-10 text-[#0B2E6B]" />
          </div>
          <h1 className="font-['Poppins',sans-serif] font-black text-3xl text-white mb-2">
            Maa Kamakhya
          </h1>
          <p className="text-[#F4B400] font-bold tracking-widest uppercase text-xs mb-8">
            Roofing Contractors
          </p>
          <div className="w-16 h-0.5 bg-white/20 mx-auto mb-8" />
          <p className="text-blue-200 text-lg font-medium mb-2">Admin Control Panel</p>
          <p className="text-blue-300 text-sm leading-relaxed max-w-xs mx-auto">
            Manage quote requests, projects, testimonials, and all website content from one place.
          </p>

          {/* Stats strip */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { label: 'Projects', value: '300+' },
              { label: 'Quotes', value: '8' },
              { label: 'Reviews', value: '6' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3">
                <p className="text-white font-black text-xl font-['Poppins',sans-serif]">{s.value}</p>
                <p className="text-blue-300 text-xs font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#0B2E6B] rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-[#F4B400]" />
            </div>
            <div>
              <p className="font-['Poppins',sans-serif] font-black text-[#0B2E6B] text-sm leading-tight">Maa Kamakhya</p>
              <p className="text-[10px] text-[#D72626] font-bold tracking-wider uppercase">Admin Panel</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 mb-4">
              <Shield className="w-3.5 h-3.5 text-[#0B2E6B]" />
              <span className="text-[#0B2E6B] text-xs font-semibold">Secure Admin Access</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 font-['Poppins',sans-serif] mb-2">
              Sign in
            </h2>
            <p className="text-gray-500 text-sm">
              Enter your admin credentials to access the dashboard.
            </p>
          </div>

          {/* Demo credentials hint removed */}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: undefined })); }}
                placeholder="admin@maakamakhyaroofing.com"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium bg-white transition-all outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, password: undefined })); }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm font-medium bg-white transition-all outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>}
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[#0B2E6B] text-white font-bold text-sm hover:bg-[#0a2660] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            © 2026 Maa Kamakhya Roofing Contractors. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
