import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCheck, Trash2, Filter, FileText, Phone } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import type { QuoteRequest, QuoteStatus } from '../types';
import { quoteRequestService } from '@/lib/supabaseService';

const STATUS_COLORS: Record<QuoteStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Contacted: 'bg-blue-100 text-blue-700 border-blue-200',
  Closed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const PAGE_SIZE = 6;

export default function QuoteRequestsPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'All'>('All');
  const [page, setPage] = useState(1);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        const data = await quoteRequestService.getAll();
        setQuotes(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch quotes:', err);
        setError('Failed to load quote requests');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  const filtered = quotes.filter(q => {
    const matchSearch =
      q.customerName.toLowerCase().includes(search.toLowerCase()) ||
      q.location.toLowerCase().includes(search.toLowerCase()) ||
      q.serviceNeeded.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const markContacted = async (id: string) => {
    try {
      await quoteRequestService.update(id, { status: 'Contacted' });
      // Update the local state optimistically
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: 'Contacted' } : q));
      toast.success('Quote marked as Contacted');
    } catch (err) {
      console.error('Failed to mark quote as contacted:', err);
      toast.error('Failed to update quote status');
    }
  };

  const markClosed = async (id: string) => {
    try {
      await quoteRequestService.update(id, { status: 'Closed' });
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: 'Closed' } : q));
      toast.success('Quote marked as Closed');
    } catch (err) {
      console.error('Failed to mark quote as closed:', err);
      toast.error('Failed to update quote status');
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      await quoteRequestService.delete(id);
      // Remove from local state
      setQuotes(prev => prev.filter(q => q.id !== id));
      setDeleteId(null);
      if (selectedQuote?.id === id) setSelectedQuote(null);
      toast.success('Quote request deleted');
    } catch (err) {
      console.error('Failed to delete quote:', err);
      toast.error('Failed to delete quote request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-[#0B2E6B]/30 border-t-[#0B2E6B] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Quote Requests"
        subtitle={`${quotes.length} total submissions`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, location or service…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium bg-white outline-none focus:ring-2 focus:ring-[#0B2E6B]/20 focus:border-[#0B2E6B] transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {(['All', 'Pending', 'Contacted', 'Closed'] as const).map(s => (
            <button type="button"
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === s
                  ? 'bg-[#0B2E6B] text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No quotes found"
          description="No quote requests match your current filters. Try adjusting your search or status filter."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Service</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Location</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(q => (
                  <tr key={q.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5 text-xs font-mono text-gray-400">{q.id}</td>
                    <td className="px-6 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{q.customerName}</p>
                        <p className="text-xs text-gray-400">{q.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-700 hidden sm:table-cell">{q.serviceNeeded}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-700 hidden md:table-cell">{q.location}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-500 hidden lg:table-cell">
                      {new Date(q.dateSubmitted).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[q.status]}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button type="button"
                          onClick={() => setSelectedQuote(q)}
                          title="View details"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-[#0B2E6B] hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {q.status === 'Pending' && (
                          <button type="button"
                            onClick={() => markContacted(q.id)}
                            title="Mark as Contacted"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {q.status !== 'Closed' && (
                          <button type="button"
                            onClick={() => markClosed(q.id)}
                            title="Mark as Closed"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button type="button"
                          onClick={() => setDeleteId(q.id)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 disabled:opacity-40 hover:border-gray-300 transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 text-xs font-semibold rounded-lg transition-colors ${
                      page === n ? 'bg-[#0B2E6B] text-white' : 'border border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 disabled:opacity-40 hover:border-gray-300 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Details Modal */}
      <Dialog.Root open={!!selectedQuote} onOpenChange={o => !o && setSelectedQuote(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            {selectedQuote && (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <Dialog.Title className="text-xl font-black text-gray-900 font-['Poppins',sans-serif]">
                      {selectedQuote.customerName}
                    </Dialog.Title>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{selectedQuote.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[selectedQuote.status]}`}>
                    {selectedQuote.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  {[
                    { label: 'Phone', value: selectedQuote.phone },
                    { label: 'Email', value: selectedQuote.email },
                    { label: 'Service', value: selectedQuote.serviceNeeded },
                    { label: 'Location', value: selectedQuote.location },
                    { label: 'Date Submitted', value: new Date(selectedQuote.dateSubmitted).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
                  ].map(({ label, value }) => (
                    <div key={label} className={label === 'Email' || label === 'Date Submitted' ? 'col-span-2' : ''}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-sm font-semibold text-gray-800">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Message</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedQuote.message}</p>
                </div>

                <div className="flex gap-3">
                  {selectedQuote.status === 'Pending' && (
                    <button type="button"
                      onClick={() => { markContacted(selectedQuote.id); setSelectedQuote(null); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-sm font-bold hover:bg-blue-100 transition-colors"
                    >
                      <Phone className="w-4 h-4" /> Mark Contacted
                    </button>
                  )}
                  {selectedQuote.status !== 'Closed' && (
                    <button type="button"
                      onClick={() => { markClosed(selectedQuote.id); setSelectedQuote(null); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0B2E6B] text-white text-sm font-bold hover:bg-[#0a2660] transition-colors"
                    >
                      <CheckCheck className="w-4 h-4" /> Mark Closed
                    </button>
                  )}
                  <button type="button"
                    onClick={() => { setDeleteId(selectedQuote.id); setSelectedQuote(null); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                  <Dialog.Close asChild>
                    <button type="button" className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors">
                      Close
                    </button>
                  </Dialog.Close>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={o => !o && setDeleteId(null)}
        title="Delete Quote Request?"
        description="This action cannot be undone. The quote request and all its data will be permanently removed."
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteQuote(deleteId)}
      />
    </div>
  );
}
