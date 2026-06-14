import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { homepageSettingsService } from '@/lib/supabaseService';
import type { HomepageSettings } from '../types';

export default function HomepageSettingsPage() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await homepageSettingsService.get();
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch homepage settings:', error);
        toast.error('Failed to load homepage settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const set = (key: keyof HomepageSettings) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setSettings(v => ({ ...v, [key]: e.target.value }));

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all bg-white';

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await homepageSettingsService.update(settings);
      toast.success('Homepage settings saved successfully');
    } catch (error) {
      console.error('Failed to save homepage settings:', error);
      toast.error('Failed to save homepage settings');
    } finally {
      setSaving(false);
    }
  };

  const updatePoint = (i: number, field: 'title' | 'description', value: string) => {
    setSettings(s => ({
      ...s,
      whyChooseUsPoints: s.whyChooseUsPoints.map((p, idx) =>
        idx === i ? { ...p, [field]: value } : p
      ),
    }));
  };

  const addPoint = () => {
    setSettings(s => ({
      ...s,
      whyChooseUsPoints: [...s.whyChooseUsPoints, { title: '', description: '' }],
    }));
  };

  const removePoint = (i: number) => {
    setSettings(s => ({
      ...s,
      whyChooseUsPoints: s.whyChooseUsPoints.filter((_, idx) => idx !== i),
    }));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!settings) {
    return <div className="min-h-screen flex items-center justify-center">Error loading settings</div>;
  }

  return (
    <div>
      <PageHeader
        title="Homepage Settings"
        subtitle="Control the content displayed on the public website homepage"
        action={
          <button
            id="save-homepage-btn"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2E6B] text-white text-sm font-bold hover:bg-[#0a2660] transition-colors disabled:opacity-60"
          >
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-2 h-4 bg-[#0B2E6B] rounded-full" />
            Hero Section
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="hero-title" className="block text-xs font-semibold text-gray-600 mb-1.5">Hero Title</label>
              <input id="hero-title" type="text" value={settings.heroTitle} onChange={set('heroTitle')} className={inputClass} />
            </div>
            <div>
              <label htmlFor="hero-subtitle" className="block text-xs font-semibold text-gray-600 mb-1.5">Hero Subtitle</label>
              <textarea
                id="hero-subtitle"
                rows={3}
                value={settings.heroSubtitle}
                onChange={set('heroSubtitle')}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cta-text" className="block text-xs font-semibold text-gray-600 mb-1.5">Primary CTA Button Text</label>
                <input id="cta-text" type="text" value={settings.ctaButtonText} onChange={set('ctaButtonText')} className={inputClass} />
              </div>
              <div>
                <label htmlFor="cta-sub" className="block text-xs font-semibold text-gray-600 mb-1.5">Secondary CTA Button Text</label>
                <input id="cta-sub" type="text" value={settings.ctaSubButtonText} onChange={set('ctaSubButtonText')} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-2 h-4 bg-[#D72626] rounded-full" />
            Hero Statistics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Years Experience', key: 'yearsExperience', id: 'stat-years' },
              { label: 'Projects Completed', key: 'projectsCompleted', id: 'stat-projects' },
              { label: 'Skilled Professionals', key: 'skilledProfessionals', id: 'stat-professionals' },
              { label: 'Customer Satisfaction', key: 'customerSatisfaction', id: 'stat-satisfaction' },
            ].map(({ label, key, id }) => (
              <div key={key}>
                <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                <input
                  id={id}
                  type="text"
                  value={settings[key as keyof HomepageSettings] as string}
                  onChange={set(key as keyof HomepageSettings)}
                  className={inputClass}
                  placeholder="e.g. 11+"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-4 bg-[#F4B400] rounded-full" />
              Why Choose Us Points
            </h2>
            <button
              onClick={addPoint}
              className="flex items-center gap-1.5 text-xs font-bold text-[#0B2E6B] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Point
            </button>
          </div>

          <div className="space-y-4">
            {settings.whyChooseUsPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl group">
                <GripVertical className="w-4 h-4 text-gray-300 mt-3 shrink-0 cursor-grab" />
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={point.title}
                    onChange={e => updatePoint(i, 'title', e.target.value)}
                    placeholder="Feature title"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all bg-white"
                  />
                  <input
                    type="text"
                    value={point.description}
                    onChange={e => updatePoint(i, 'description', e.target.value)}
                    placeholder="Feature description"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all bg-white"
                  />
                </div>
                <button
                  onClick={() => removePoint(i)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors shrink-0 mt-1 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating save on mobile */}
      <div className="fixed bottom-24 right-4 lg:hidden">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0B2E6B] text-white text-sm font-bold shadow-2xl hover:bg-[#0a2660] transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
