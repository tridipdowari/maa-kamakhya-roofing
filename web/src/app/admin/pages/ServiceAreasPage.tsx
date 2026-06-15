import React, { useState } from 'react';
import { Plus, Pencil, Trash2, MapPin, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { serviceAreaService } from '@/lib/supabaseService';
import type { ServiceArea } from '../types';

interface AreaForm { name: string; district: string; description: string; }
const emptyForm: AreaForm = { name: '', district: '', description: '' };

export default function ServiceAreasPage() {
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<AreaForm>(emptyForm);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (a: ServiceArea) => {
    setEditingId(a.id);
    setForm({ name: a.name, district: a.district, description: a.description });
    setFormOpen(true);
  };

  React.useEffect(() => {
    const fetchAreas = async () => {
      try {
        setLoading(true);
        const data = await serviceAreaService.getAll();
        setAreas(data);
      } catch (err) {
        console.error('Failed to fetch areas:', err);
        toast.error('Failed to load service areas');
      } finally {
        setLoading(false);
      }
    };
    fetchAreas();
  }, []);

  const handleSave = async () => {
    if (!form.name) { toast.error('Area name is required'); return; }
    try {
      if (editingId) {
        const updated = await serviceAreaService.update(editingId, form);
        setAreas(prev => prev.map(a => a.id === editingId ? updated : a));
        toast.success('Service area updated');
      } else {
        const newArea = await serviceAreaService.create({
          ...form,
          projectCount: 0,
        });
        setAreas(prev => [...prev, newArea]);
        toast.success('Service area added');
      }
      setFormOpen(false);
    } catch (err) {
      console.error('Failed to save area:', err);
      toast.error('Failed to save service area');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await serviceAreaService.delete(id);
      setAreas(prev => prev.filter(a => a.id !== id));
      setDeleteId(null);
      toast.success('Service area removed');
    } catch (err) {
      console.error('Failed to delete area:', err);
      toast.error('Failed to remove service area');
    }
  };

  const DISTRICT_COLORS: Record<string, string> = {
    'Golaghat District': 'bg-blue-50 text-blue-700 border-blue-100',
    'Jorhat District': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  return (
    <div>
      <PageHeader
        title="Service Areas"
        subtitle={`Covering ${areas.length} locations across Assam`}
        action={
          <button
            id="add-area-btn"
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2E6B] text-white text-sm font-bold hover:bg-[#0a2660] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Area
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-[#0B2E6B]/30 border-t-[#0B2E6B] rounded-full animate-spin" />
        </div>
      ) : areas.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No service areas"
          description="Add the locations where you provide roofing services."
          action={<button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2E6B] text-white text-sm font-bold"><Plus className="w-4 h-4" /> Add First Area</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {areas.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-[#0B2E6B] rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#F4B400]" />
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(a)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-[#0B2E6B] hover:bg-blue-100 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setDeleteId(a.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-1">{a.name}</h3>
              <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border mb-2 ${DISTRICT_COLORS[a.district] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                {a.district}
              </span>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{a.description}</p>

              <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
                <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center">
                  <span className="text-amber-600 text-[10px] font-black">{a.projectCount}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">projects completed</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog.Root open={formOpen} onOpenChange={setFormOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-black text-gray-900 font-['Poppins',sans-serif]">
                {editingId ? 'Edit Service Area' : 'Add Service Area'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </Dialog.Close>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Area Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Golaghat"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">District</label>
                <input
                  type="text"
                  value={form.district}
                  onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                  placeholder="e.g. Golaghat District"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief note about this service area"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-[#0B2E6B] text-white text-sm font-bold hover:bg-[#0a2660] transition-colors">
                {editingId ? 'Save Changes' : 'Add Area'}
              </button>
              <Dialog.Close asChild>
                <button className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors">Cancel</button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={o => !o && setDeleteId(null)}
        title="Remove Service Area?"
        description="This service area will be removed from the website. This action cannot be undone."
        confirmLabel="Remove"
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </div>
  );
}
