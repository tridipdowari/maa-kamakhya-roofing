import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Images, MapPin, Calendar, FolderOpen, X, Loader2, Upload } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { projectService } from '../../../lib/supabaseService';
import { supabase } from '../../../lib/supabase';
import type { Project } from '../../../lib/supabaseService';
import type { ProjectStatus } from '../types';

const MAX_PROJECTS = 6;

const STATUS_COLORS: Record<ProjectStatus, string> = {
  Completed: 'bg-emerald-100 text-emerald-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Planning: 'bg-blue-100 text-blue-700',
};

const SERVICE_TYPES = ['Metal Roofing', 'Roof Installation', 'Roof Repair', 'Shed Construction', 'Leak Proofing', 'Waterproofing'];

interface ProjectForm {
  title: string;
  location: string;
  serviceType: string;
  completionDate: string;
  status: ProjectStatus;
  description: string;
  client: string;
  images: string[];
}

const emptyForm: ProjectForm = {
  title: '', location: '', serviceType: 'Metal Roofing',
  completionDate: '', status: 'Completed', description: '', client: '', images: [],
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [galleryProject, setGalleryProject] = useState<Project | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    if (projects.length >= MAX_PROJECTS) {
      toast.error(`Maximum ${MAX_PROJECTS} projects allowed`, {
        description: 'Delete an existing project before adding a new one.',
      });
      return;
    }
    setEditingProject(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditingProject(p);
    setForm({
      title: p.title,
      location: p.location,
      serviceType: p.serviceType,
      completionDate: p.completionDate,
      status: p.status as ProjectStatus,
      description: p.description,
      client: p.client,
      images: p.images || [],
    });
    setFormOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Please select an image under 5MB.');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('project-images').getPublicUrl(filePath);
      
      setForm(prev => ({ ...prev, images: [data.publicUrl, ...prev.images] }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image', { description: error?.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.location) {
      toast.error('Title and location are required');
      return;
    }
    if (!form.completionDate) {
      toast.error('Completion date is required');
      return;
    }
    
    setSaving(true);
    try {
      if (editingProject) {
        const updated = await projectService.update(editingProject.id, form);
        setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...updated } : p));
        toast.success('Project updated successfully');
      } else {
        const newProject = await projectService.create({
          ...form,
          // Fallback image if none provided
          images: form.images.length > 0 ? form.images : ['https://images.unsplash.com/photo-1763665814538-8ba04597286c?w=800&h=600&fit=crop&auto=format'],
        });
        setProjects(prev => [newProject, ...prev]);
        toast.success('Project added successfully');
      }
      setFormOpen(false);
    } catch (err: any) {
      toast.error('Failed to save project', { description: err?.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await projectService.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setDeleteId(null);
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const atLimit = projects.length >= MAX_PROJECTS;

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle={`${projects.length}/${MAX_PROJECTS} slots used`}
        action={
          <button
            id="add-project-btn"
            onClick={openAdd}
            disabled={atLimit}
            title={atLimit ? `Maximum ${MAX_PROJECTS} projects reached` : 'Add a new project'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2E6B] text-white text-sm font-bold hover:bg-[#0a2660] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        }
      />

      {atLimit && (
        <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <FolderOpen className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700 font-medium">
            You've reached the maximum of <strong>{MAX_PROJECTS} projects</strong>. Delete one to add a new project.
          </p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#0B2E6B] animate-spin mr-3" />
          <p className="text-sm text-gray-500 font-medium">Loading projects…</p>
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description={`Add up to ${MAX_PROJECTS} projects to showcase your portfolio.`}
          action={
            <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2E6B] text-white text-sm font-bold hover:bg-[#0a2660] transition-colors">
              <Plus className="w-4 h-4" /> Add First Project
            </button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 group">
              <div className="relative h-48 overflow-hidden bg-blue-50 cursor-pointer" onClick={() => { setGalleryProject(p); setGalleryIdx(0); }}>
                <img
                  src={p.images?.[0] || 'https://images.unsplash.com/photo-1763665814538-8ba04597286c?w=800&h=600&fit=crop&auto=format'}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status as ProjectStatus] || 'bg-gray-100 text-gray-700'}`}>
                    {p.status}
                  </span>
                  {p.images?.length > 1 && (
                    <span className="bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Images className="w-3 h-3" /> {p.images.length}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2">{p.title}</h3>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#D72626]" />{p.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#0B2E6B]" />
                    {new Date(p.completionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5 mb-3 font-medium">{p.serviceType}</p>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">{p.description}</p>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-[#0B2E6B] text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => { setGalleryProject(p); setGalleryIdx(0); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors"
                  >
                    <Images className="w-3.5 h-3.5" /> Gallery
                  </button>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <Dialog.Root open={formOpen} onOpenChange={o => !saving && setFormOpen(o)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-black text-gray-900 font-['Poppins',sans-serif]">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Project Title *', key: 'title', placeholder: 'e.g. Industrial Warehouse Roofing' },
                { label: 'Location *', key: 'location', placeholder: 'e.g. Golaghat' },
                { label: 'Client Name', key: 'client', placeholder: 'e.g. ABC Industries' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={form[key as keyof ProjectForm] as string}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Service Type</label>
                  <select
                    value={form.serviceType}
                    onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all bg-white"
                  >
                    {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as ProjectStatus }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all bg-white"
                  >
                    <option>Completed</option>
                    <option>In Progress</option>
                    <option>Planning</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Completion Date *</label>
                <input
                  type="date"
                  value={form.completionDate}
                  onChange={e => setForm(f => ({ ...f, completionDate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief project description…"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Project Images</label>
                <div 
                  className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-[#0B2E6B] animate-spin mb-2" />
                      <p className="text-xs font-semibold text-gray-500">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="text-xs font-semibold text-gray-500">Click to upload image</p>
                      <p className="text-[11px] text-gray-400 mt-1">Max 5MB (JPG, PNG)</p>
                    </div>
                  )}
                </div>
                
                {/* Image Previews */}
                {form.images.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0B2E6B] text-white text-sm font-bold hover:bg-[#0a2660] transition-colors disabled:opacity-60"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : editingProject ? 'Save Changes' : 'Add Project'}
              </button>
              <Dialog.Close asChild>
                <button disabled={saving || uploading} className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-60">
                  Cancel
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Gallery Modal */}
      <Dialog.Root open={!!galleryProject} onOpenChange={o => !o && setGalleryProject(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl bg-black rounded-2xl overflow-hidden">
            {galleryProject && (
              <>
                <div className="relative">
                  <img
                    src={galleryProject.images?.[galleryIdx] || 'https://images.unsplash.com/photo-1763665814538-8ba04597286c?w=800&h=600&fit=crop&auto=format'}
                    alt={galleryProject.title}
                    className="w-full max-h-[60vh] object-cover"
                  />
                  <Dialog.Close asChild>
                    <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </Dialog.Close>
                </div>
                <div className="p-4 bg-gray-900">
                  <p className="text-white font-bold text-sm mb-3">{galleryProject.title}</p>
                  {galleryProject.images?.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {galleryProject.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setGalleryIdx(i)}
                          className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${i === galleryIdx ? 'border-[#F4B400]' : 'border-transparent'}`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={o => !o && setDeleteId(null)}
        title="Delete Project?"
        description="This project and all its data will be permanently removed. This action cannot be undone."
        confirmLabel="Delete Project"
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </div>
  );
}
