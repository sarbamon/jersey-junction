import { AdminReview } from '../types/admin';
import { INITIAL_REVIEWS } from '../mock/reviews';

const REVIEWS_KEY = 'jj_admin_reviews';

export const reviewService = {
  getReviews: (): AdminReview[] => {
    if (typeof window === 'undefined') return INITIAL_REVIEWS;
    const stored = localStorage.getItem(REVIEWS_KEY);
    if (!stored) {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_REVIEWS;
    }
  },

  updateReviewStatus: (id: string, status: 'Pending' | 'Approved' | 'Rejected'): AdminReview => {
    const reviews = reviewService.getReviews();
    const index = reviews.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Review not found');

    const updated = { ...reviews[index], status };
    reviews[index] = updated;

    if (typeof window !== 'undefined') {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    }
    return updated;
  },

  deleteReview: (id: string): void => {
    const reviews = reviewService.getReviews();
    const filtered = reviews.filter(r => r.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(filtered));
    }
  }
};
