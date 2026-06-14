import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Star as StarIcon, X, Loader2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { StarRating } from '../components/StarRating';
import { testimonialService } from '../../../lib/supabaseService';
import type { Testimonial, TestimonialStatus } from '../../../lib/supabaseService';

const MAX_TESTIMONIALS = 6;

const AVATAR_COLORS = ['#0B2E6B', '#D72626', '#d97706', '#1e40af', '#7c3aed', '#0d9488'];

const STATUS_COLORS: Record<TestimonialStatus, string> = {
  Published: 'bg-emerald-100 text-emerald-700',
  Hidden: 'bg-gray-100 text-gray-500',
};

interface TestimonialForm {
  customerName: string;
  location: string;
  reviewText: string;
  rating: number;
  status: TestimonialStatus;
}

const emptyForm: TestimonialForm = {
  customerName: '', location: '', reviewText: '', rating: 5, status: 'Published',
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialForm>(emptyForm);

  // Fetch testimonials from Supabase on mount
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const data = await testimonialService.getAll();
      setTestimonials(data);
    } catch (err) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    if (testimonials.length >= MAX_TESTIMONIALS) {
      toast.error(`Maximum ${MAX_TESTIMONIALS} testimonials allowed`, {
        description: 'Delete or hide an existing one before adding a new one.',
      });
      return;
    }
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setForm({
      customerName: t.customerName,
      location: t.location,
      reviewText: t.reviewText,
      rating: t.rating,
      status: t.status,
    });
    setFormOpen(true);
  };

  const toggleStatus = async (t: Testimonial) => {
    const newStatus: TestimonialStatus = t.status === 'Published' ? 'Hidden' : 'Published';
    try {
      await testimonialService.update(t.id, { status: newStatus });
      setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, status: newStatus } : x));
      toast.success(newStatus === 'Published' ? 'Testimonial published' : 'Testimonial hidden');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSave = async () => {
    if (!form.customerName || !form.reviewText) {
      toast.error('Customer name and review text are required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const updated = await testimonialService.update(editingId, form);
        setTestimonials(prev => prev.map(t => t.id === editingId ? { ...t, ...updated } : t));
        toast.success('Testimonial updated');
      } else {
        const initials = form.customerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const avatarColor = AVATAR_COLORS[testimonials.length % AVATAR_COLORS.length];
        const newT = await testimonialService.create({
          ...form,
          dateAdded: new Date().toISOString().split('T')[0],
          initials,
          avatarColor,
        });
        setTestimonials(prev => [newT, ...prev]);
        toast.success('Testimonial added');
      }
      setFormOpen(false);
    } catch (err: any) {
      toast.error('Failed to save testimonial', { description: err?.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await testimonialService.delete(id);
      setTestimonials(prev => prev.filter(t => t.id !== id));
      setDeleteId(null);
      toast.success('Testimonial deleted');
    } catch {
      toast.error('Failed to delete testimonial');
    }
  };

  const atLimit = testimonials.length >= MAX_TESTIMONIALS;

  return (
    <div>
      <PageHeader
        title="Testimonials"
        subtitle={`${testimonials.filter(t => t.status === 'Published').length} published · ${testimonials.filter(t => t.status === 'Hidden').length} hidden · ${testimonials.length}/${MAX_TESTIMONIALS} slots used`}
        action={
          <button
            id="add-testimonial-btn"
            onClick={openAdd}
            disabled={atLimit}
            title={atLimit ? `Maximum ${MAX_TESTIMONIALS} testimonials reached` : 'Add a new testimonial'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2E6B] text-white text-sm font-bold hover:bg-[#0a2660] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Add Review
          </button>
        }
      />

      {/* Limit warning */}
      {atLimit && (
        <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <StarIcon className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700 font-medium">
            You've reached the maximum of <strong>{MAX_TESTIMONIALS} testimonials</strong>. Delete one to add a new review.
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#0B2E6B] animate-spin mr-3" />
          <p className="text-sm text-gray-500 font-medium">Loading testimonials…</p>
        </div>
      ) : testimonials.length === 0 ? (
        <EmptyState
          icon={StarIcon}
          title="No testimonials yet"
          description="Add up to 6 customer reviews to build trust on your website."
          action={
            <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2E6B] text-white text-sm font-bold">
              <Plus className="w-4 h-4" /> Add First Review
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Rating</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Review</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: t.avatarColor }}
                        >
                          {t.initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{t.customerName}</p>
                          <p className="text-xs text-gray-400">{t.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <StarRating rating={t.rating} size="sm" />
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell max-w-xs">
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{t.reviewText}</p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-500">
                      {new Date(t.dateAdded).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[t.status]}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => openEdit(t)}
                          title="Edit"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-[#0B2E6B] hover:bg-blue-100 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleStatus(t)}
                          title={t.status === 'Published' ? 'Hide' : 'Publish'}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                            t.status === 'Published'
                              ? 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {t.status === 'Published' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setDeleteId(t.id)}
                          title="Delete"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog.Root open={formOpen} onOpenChange={o => !saving && setFormOpen(o)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-black text-gray-900 font-['Poppins',sans-serif]">
                {editingId ? 'Edit Testimonial' : 'Add Testimonial'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Customer Name *</label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                    placeholder="e.g. Rajesh Bora"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Golaghat"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Rating</label>
                <StarRating rating={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} size="lg" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Review Text *</label>
                <textarea
                  rows={4}
                  value={form.reviewText}
                  onChange={e => setForm(f => ({ ...f, reviewText: e.target.value }))}
                  placeholder="Customer's review…"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                <div className="flex gap-3">
                  {(['Published', 'Hidden'] as TestimonialStatus[]).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        form.status === s ? 'bg-[#0B2E6B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0B2E6B] text-white text-sm font-bold hover:bg-[#0a2660] transition-colors disabled:opacity-60"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : editingId ? 'Save Changes' : 'Add Testimonial'}
              </button>
              <Dialog.Close asChild>
                <button disabled={saving} className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-60">
                  Cancel
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={o => !o && setDeleteId(null)}
        title="Delete Testimonial?"
        description="This testimonial will be permanently removed from Supabase and the website."
        confirmLabel="Delete"
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </div>
  );
}
