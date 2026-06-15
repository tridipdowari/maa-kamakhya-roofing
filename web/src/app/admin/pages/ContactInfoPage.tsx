import React, { useState } from 'react';
import { Save, Phone, Mail, MapPin, MessageCircle, Link, Facebook, Instagram, Youtube } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { contactInfoService } from '@/lib/supabaseService';
import type { ContactInfo } from '../types';

interface FieldProps {
  label: string;
  id: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function Field({ label, id, icon, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ContactInfoPage() {
  const [info, setInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const data = await contactInfoService.get();
        setInfo(data);
      } catch (err) {
        console.error('Failed to fetch contact info:', err);
        toast.error('Failed to load contact information');
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const set = (key: keyof ContactInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setInfo(v => v ? { ...v, [key]: e.target.value } : null);

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all bg-white';

  const handleSave = async () => {
    if (!info) return;
    try {
      setSaving(true);
      await contactInfoService.update(info);
      toast.success('Contact information saved successfully');
    } catch (err) {
      console.error('Failed to save contact info:', err);
      toast.error('Failed to save contact information');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !info) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#0B2E6B]/30 border-t-[#0B2E6B] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Contact Information"
        subtitle="Manage business contact details displayed on the website"
        action={
          <button
            id="save-contact-btn"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2E6B] text-white text-sm font-bold hover:bg-[#0a2660] transition-colors disabled:opacity-60"
          >
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-2 h-4 bg-[#0B2E6B] rounded-full" />
            Business Details
          </h2>
          <div className="space-y-4">
            <Field label="Business Name" id="biz-name">
              <input id="biz-name" type="text" value={info.businessName} onChange={set('businessName')} className={inputClass} />
            </Field>
            <Field label="Primary Phone" id="phone1" icon={<Phone className="w-3.5 h-3.5" />}>
              <input id="phone1" type="tel" value={info.phone1} onChange={set('phone1')} className={inputClass} />
            </Field>
            <Field label="Secondary Phone" id="phone2" icon={<Phone className="w-3.5 h-3.5" />}>
              <input id="phone2" type="tel" value={info.phone2} onChange={set('phone2')} className={inputClass} />
            </Field>
            <Field label="Email Address" id="email" icon={<Mail className="w-3.5 h-3.5" />}>
              <input id="email" type="email" value={info.email} onChange={set('email')} className={inputClass} />
            </Field>
            <Field label="WhatsApp Number" id="whatsapp" icon={<MessageCircle className="w-3.5 h-3.5" />}>
              <input id="whatsapp" type="text" value={info.whatsapp} onChange={set('whatsapp')} placeholder="91XXXXXXXXXX (no + or spaces)" className={inputClass} />
            </Field>
          </div>
        </div>

        {/* Address & Map */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-2 h-4 bg-[#D72626] rounded-full" />
            Address & Map
          </h2>
          <div className="space-y-4">
            <Field label="Business Address" id="address" icon={<MapPin className="w-3.5 h-3.5" />}>
              <textarea
                id="address"
                rows={3}
                value={info.address}
                onChange={set('address')}
                className={`${inputClass} resize-none`}
              />
            </Field>
            <Field label="Google Maps Embed URL" id="maps-embed" icon={<Link className="w-3.5 h-3.5" />}>
              <input id="maps-embed" type="url" value={info.googleMapsEmbed} onChange={set('googleMapsEmbed')} placeholder="https://maps.google.com/maps?q=…" className={inputClass} />
            </Field>
            {/* Map preview */}
            {info.googleMapsEmbed && (
              <div className="rounded-xl overflow-hidden border border-gray-100 h-40">
                <iframe
                  src={info.googleMapsEmbed}
                  title="Map preview"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-2 h-4 bg-[#F4B400] rounded-full" />
            Social Media Links
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Facebook" id="facebook" icon={<Facebook className="w-3.5 h-3.5 text-blue-600" />}>
              <input id="facebook" type="url" value={info.facebook} onChange={set('facebook')} placeholder="https://facebook.com/…" className={inputClass} />
            </Field>
            <Field label="Instagram" id="instagram" icon={<Instagram className="w-3.5 h-3.5 text-pink-500" />}>
              <input id="instagram" type="url" value={info.instagram} onChange={set('instagram')} placeholder="https://instagram.com/…" className={inputClass} />
            </Field>
            <Field label="YouTube" id="youtube" icon={<Youtube className="w-3.5 h-3.5 text-red-500" />}>
              <input id="youtube" type="url" value={info.youtube} onChange={set('youtube')} placeholder="https://youtube.com/…" className={inputClass} />
            </Field>
          </div>
        </div>
      </div>

      {/* Floating save on mobile */}
      <div className="fixed bottom-24 right-4 lg:hidden">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0B2E6B] text-white text-sm font-bold shadow-2xl hover:bg-[#0a2660] transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
