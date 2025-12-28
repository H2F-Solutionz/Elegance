import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import StarRating from './StarRating';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  review_text: string;
  is_verified_purchase: boolean;
  is_visible: boolean;
  created_at: string;
  profiles?: {
    display_name: string | null;
  };
}

interface ProductReviewsProps {
  productId: string;
}

const REVIEWS_PER_PAGE = 5;

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [editingReview, setEditingReview] = useState<{
    id: string;
    rating: number;
    review_text: string;
  } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchReviews = useCallback(async (offset = 0, append = false) => {
    try {
      if (offset === 0) setLoading(true);
      else setLoadingMore(true);

      // Fetch reviews
      const { data: reviewsData, error, count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .eq('product_id', productId)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + REVIEWS_PER_PAGE - 1);

      if (error) throw error;

      // Fetch profiles for these reviews
      const userIds = [...new Set((reviewsData || []).map(r => r.user_id))];
      let profilesMap: Record<string, { display_name: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);
        
        if (profilesData) {
          profilesMap = profilesData.reduce((acc, p) => {
            acc[p.user_id] = { display_name: p.display_name };
            return acc;
          }, {} as Record<string, { display_name: string | null }>);
        }
      }

      const typedData: Review[] = (reviewsData || []).map(r => ({
        ...r,
        profiles: profilesMap[r.user_id] || { display_name: null }
      }));
      
      if (append) {
        setReviews(prev => [...prev, ...typedData]);
      } else {
        setReviews(typedData);
      }

      setTotalReviews(count || 0);
      setHasMore((count || 0) > offset + REVIEWS_PER_PAGE);

      // Calculate average rating
      if (count && count > 0) {
        const { data: avgData } = await supabase
          .from('reviews')
          .select('rating')
          .eq('product_id', productId)
          .eq('is_visible', true);

        if (avgData && avgData.length > 0) {
          const avg = avgData.reduce((sum, r) => sum + r.rating, 0) / avgData.length;
          setAverageRating(Math.round(avg * 10) / 10);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [productId]);

  const checkUserReview = useCallback(async () => {
    if (!user) {
      setUserReview(null);
      return;
    }

    try {
      const { data: reviewData, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (reviewData) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setUserReview({
          ...reviewData,
          profiles: profileData || { display_name: null }
        });
      } else {
        setUserReview(null);
      }
    } catch (error) {
      console.error('Error checking user review:', error);
    }
  }, [user, productId]);

  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'moderator'])
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReviews();
    checkUserReview();
    checkAdminStatus();
  }, [fetchReviews, checkUserReview, checkAdminStatus]);

  const handleReviewSubmitted = () => {
    fetchReviews();
    checkUserReview();
    setEditingReview(null);
    setShowReviewForm(false);
  };

  const handleEdit = (review: { id: string; rating: number; review_text: string }) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDelete = () => {
    fetchReviews();
    checkUserReview();
  };

  const loadMore = () => {
    fetchReviews(reviews.length, true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Customer Reviews
          </h2>
          {totalReviews > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={averageRating} />
              <span className="font-semibold">{averageRating}</span>
              <span className="text-muted-foreground">
                ({totalReviews} verified {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>

        {!showReviewForm && !userReview && (
          <Button
            variant="gold"
            onClick={() => setShowReviewForm(true)}
          >
            Write a Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {(showReviewForm || editingReview) && (
        <div className="animate-fade-in">
          <ReviewForm
            productId={productId}
            onReviewSubmitted={handleReviewSubmitted}
            existingReview={editingReview || userReview}
          />
          {showReviewForm && (
            <Button
              variant="ghost"
              onClick={() => {
                setShowReviewForm(false);
                setEditingReview(null);
              }}
              className="mt-2"
            >
              Cancel
            </Button>
          )}
        </div>
      )}

      {/* User's Own Review (if not editing) */}
      {userReview && !editingReview && !showReviewForm && (
        <div className="border-l-4 border-primary pl-4">
          <p className="text-sm text-primary font-medium mb-2">Your Review</p>
          <ReviewCard
            review={userReview}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isAdmin={isAdmin}
          />
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews
            .filter(r => r.id !== userReview?.id) // Don't duplicate user's review
            .map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={isAdmin ? handleEdit : undefined}
                onDelete={handleDelete}
                isAdmin={isAdmin}
              />
            ))}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Reviews'
                )}
              </Button>
            </div>
          )}
        </div>
      ) : !userReview && (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No reviews yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Be the first to review this product!
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
