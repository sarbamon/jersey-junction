'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare } from 'lucide-react';
import { reviewService } from '../../../lib/services/reviewService';
import { AdminReview } from '../../../lib/types/admin';
import { ConfirmModal } from '../../../components/admin/ConfirmModal';
import { Toast } from '../../../components/admin/Toast';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const loadReviews = () => {
    setReviews(reviewService.getReviews());
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleStatusChange = (id: string, status: 'Approved' | 'Rejected') => {
    reviewService.updateReviewStatus(id, status);
    setToastMsg(`Review status set to ${status}`);
    loadReviews();
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      reviewService.deleteReview(deleteTarget.id);
      setToastMsg('Review deleted.');
      setDeleteTarget(null);
      loadReviews();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Star className="w-4 h-4" />
            <span>CUSTOMER REVIEWS MODERATION</span>
          </div>
          <h1 className="text-2xl font-black font-serif uppercase tracking-tight text-white">
            REVIEWS ({reviews.length})
          </h1>
          <p className="text-xs text-zinc-400">
            Moderate submitted customer reviews, rating scores, and product feedback.
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`} />
                  ))}
                </div>
                <span className="font-bold text-white text-xs">{r.customerName}</span>
                <span className="text-[10px] text-zinc-500 font-mono">({r.email})</span>
              </div>

              <div className="text-xs text-amber-400 font-bold font-mono">
                Product: {r.productName}
              </div>

              <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 leading-relaxed italic">
                &quot;{r.comment}&quot;
              </p>

              <div className="text-[10px] text-zinc-500 font-mono">
                Submitted on {r.date}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-800 w-full md:w-auto justify-end">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border mr-2 ${
                r.status === 'Approved' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : (r.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30')
              }`}>
                {r.status}
              </span>

              {r.status !== 'Approved' && (
                <button
                  onClick={() => handleStatusChange(r.id, 'Approved')}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
              )}

              {r.status !== 'Rejected' && (
                <button
                  onClick={() => handleStatusChange(r.id, 'Rejected')}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              )}

              <button
                onClick={() => setDeleteTarget(r)}
                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                title="Delete Review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Customer Review"
        message="Are you sure you want to delete this review?"
        confirmText="Delete Review"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
