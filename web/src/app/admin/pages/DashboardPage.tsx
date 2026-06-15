import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText, FolderOpen, Star, Clock, Globe, Calendar,
  Plus, ArrowRight, CheckCircle, Phone,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { CardSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import { quoteRequestService } from '@/lib/supabaseService';
import { testimonialService } from '@/lib/supabaseService';
import { projectService } from '@/lib/supabaseService';
import { supabase } from '@/lib/supabase';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Contacted: 'bg-blue-100 text-blue-700',
  Closed: 'bg-emerald-100 text-emerald-700',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Array<any>>([]);
  const [testimonials, setTestimonials] = useState<Array<any>>([]);
  const [projects, setProjects] = useState<Array<any>>([]);
  const [lastLogin, setLastLogin] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quotesData, testimonialsData, projectsData] = await Promise.all([
          quoteRequestService.getAll(),
          testimonialService.getAll(),
          projectService.getAll()
        ]);
        setQuotes(quotesData);
        setTestimonials(testimonialsData);
        setProjects(projectsData);
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user?.last_sign_in_at) {
          setLastLogin(new Date(authData.user.last_sign_in_at).toLocaleString('en-IN', {
            dateStyle: 'medium', timeStyle: 'short',
          }));
        } else {
          setLastLogin('Recent');
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pending = quotes.filter((q: any) => q.status === 'Pending').length;
  const published = testimonials.filter((t: any) => t.status === 'Published').length;

  // Create dynamic quote status data for the last 6 months
  const monthMap: Record<string, { month: string; pending: number; contacted: number; closed: number }> = {};
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.toLocaleString('en-US', { month: 'short' });
    monthMap[month] = { month, pending: 0, contacted: 0, closed: 0 };
  }

  quotes.forEach((q: any) => {
    const month = new Date(q.dateSubmitted).toLocaleString('en-US', { month: 'short' });
    if (monthMap[month]) {
      if (q.status === 'Pending') monthMap[month].pending++;
      else if (q.status === 'Contacted') monthMap[month].contacted++;
      else if (q.status === 'Closed') monthMap[month].closed++;
    }
  });

  const quoteStatusData = Object.values(monthMap);

  return (
    <div>
      {/* Welcome strip */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 font-['Poppins',sans-serif]">
          Good morning, Admin 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Total Quotes"
            value={quotes.length}
            icon={FileText}
            iconBg="bg-blue-50"
            iconColor="text-[#0B2E6B]"
            trend="+12%"
            trendUp
            subtitle="All time"
          />
          <StatCard
            title="Pending"
            value={pending}
            icon={Clock}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            trend="-2"
            trendUp={false}
            subtitle="Needs action"
          />
          <StatCard
            title="Projects"
            value={projects.length}
            icon={FolderOpen}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            trend="+3"
            trendUp
            subtitle="Total"
          />
          <StatCard
            title="Reviews"
            value={published}
            icon={Star}
            iconBg="bg-yellow-50"
            iconColor="text-yellow-600"
            trend="+1"
            trendUp
            subtitle="Published"
          />
          <StatCard
            title="Website Visits"
            value="N/A"
            icon={Globe}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            subtitle="Connect Google Analytics"
          />
          <StatCard
            title="Last Login"
            value={lastLogin}
            icon={Calendar}
            iconBg="bg-gray-50"
            iconColor="text-gray-500"
            subtitle={lastLogin}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-900">Quote Trends</h2>
              <p className="text-xs text-gray-400 mt-0.5">Jan – Jun 2026</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={quoteStatusData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="pending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F4B400" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F4B400" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="contacted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0B2E6B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0B2E6B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="closed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
              <Area type="monotone" dataKey="pending" name="Pending" stroke="#F4B400" fill="url(#pending)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="contacted" name="Contacted" stroke="#0B2E6B" fill="url(#contacted)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="closed" name="Closed" stroke="#10b981" fill="url(#closed)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: 'Add New Project', icon: FolderOpen, path: '/admin/projects', color: 'bg-indigo-50 text-indigo-600' },
              { label: 'View Pending Quotes', icon: Clock, path: '/admin/quotes', color: 'bg-amber-50 text-amber-600' },
              { label: 'Add Testimonial', icon: Star, path: '/admin/testimonials', color: 'bg-yellow-50 text-yellow-600' },
              { label: 'Update Contact Info', icon: Phone, path: '/admin/contact', color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Edit Homepage', icon: Globe, path: '/admin/homepage', color: 'bg-blue-50 text-[#0B2E6B]' },
            ].map(({ label, icon: Icon, path, color }) => (
              <button type="button"
                key={path}
                onClick={() => navigate(path)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group text-left"
              >
                <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-gray-700 flex-1">{label}</span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent quotes table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Recent Quote Requests</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last 5 submissions</p>
          </div>
          <button type="button"
            onClick={() => navigate('/admin/quotes')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#0B2E6B] hover:underline"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {loading ? (
          <TableSkeleton rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Service</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Location</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {quotes.slice(0, 5).map((q, i) => (
                  <tr
                    key={q.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/quotes')}
                  >
                    <td className="px-6 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{q.customerName}</p>
                        <p className="text-xs text-gray-400">{q.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-700">{q.serviceNeeded}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-700 hidden sm:table-cell">{q.location}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-500 hidden md:table-cell">
                      {new Date(q.dateSubmitted).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[q.status]}`}>
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Recent Projects</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest 3 added</p>
          </div>
          <button type="button"
            onClick={() => navigate('/admin/projects')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#0B2E6B] hover:underline"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {projects.slice(0, 3).map(p => (
            <div key={p.id} className="p-5 group hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/admin/projects')}>
              <div className="relative rounded-xl overflow-hidden h-32 mb-3 bg-blue-50">
                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  p.status === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-white'
                }`}>
                  {p.status}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900 leading-tight mb-1">{p.title}</p>
              <p className="text-xs text-gray-500">{p.location} · {p.serviceType}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
