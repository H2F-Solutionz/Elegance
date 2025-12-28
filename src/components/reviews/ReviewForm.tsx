import React, { useState, useEffect } from 'react';
import { BadgeCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import StarRating from './StarRating';

// Basic spam/offensive words filter
const BLOCKED_WORDS = ['spam', 'scam', 'fake', 'hate', 'terrible'];

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
  existingReview?: {
    id: string;
    rating: number;
    review_text: string;
  } | null;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onReviewSubmitted,
  existingReview
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [eligibleOrderId, setEligibleOrderId] = useState<string | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);

  useEffect(() => {
    if (user) {
      checkReviewEligibility();
    } else {
      setCheckingEligibility(false);
    }
  }, [user, productId]);

  const checkReviewEligibility = async () => {
    if (!user) return;
    
    setCheckingEligibility(true);
    try {
      // Check if user has a completed/delivered order for this product
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .in('status', ['delivered', 'completed'])
        .limit(1);

      if (error) throw error;

      if (orders && orders.length > 0) {
        setCanReview(true);
        setEligibleOrderId(orders[0].id);
      } else {
        setCanReview(false);
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setCanReview(false);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const validateReview = (): string | null => {
    if (rating === 0) {
      return 'Please select a star rating';
    }

    if (reviewText.length < 10) {
      return 'Review must be at least 10 characters';
    }

    if (reviewText.length > 1000) {
      return 'Review must be less than 1000 characters';
    }

    // Check for blocked words
    const lowerText = reviewText.toLowerCase();
    for (const word of BLOCKED_WORDS) {
      if (lowerText.includes(word)) {
        return 'Your review contains inappropriate content. Please revise.';
      }
    }

    // Rate limiting (5 seconds between submissions)
    const now = Date.now();
    if (now - lastSubmitTime < 5000) {
      return 'Please wait a few seconds before submitting again';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateReview();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    if (!eligibleOrderId) {
      toast({
        title: 'Cannot Submit Review',
        description: 'You must purchase and receive this product before reviewing.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setLastSubmitTime(Date.now());

    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            review_text: reviewText,
          })
          .eq('id', existingReview.id);

        if (error) throw error;

        // Log the update
        await supabase.from('review_logs').insert({
          user_id: user!.id,
          review_id: existingReview.id,
          action: 'update',
          details: { rating, text_length: reviewText.length }
        });

        toast({
          title: 'Review Updated',
          description: 'Your review has been updated successfully.',
        });
      } else {
        // Create new review
        const { data: newReview, error } = await supabase
          .from('reviews')
          .insert({
            user_id: user!.id,
            product_id: productId,
            order_id: eligibleOrderId,
            rating,
            review_text: reviewText,
          })
          .select()
          .single();

        if (error) throw error;

        // Log the creation
        await supabase.from('review_logs').insert({
          user_id: user!.id,
          review_id: newReview.id,
          action: 'create',
          details: { rating, text_length: reviewText.length }
        });

        toast({
          title: 'Review Submitted',
          description: 'Thank you for your verified review!',
        });
      }

      onReviewSubmitted();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please sign in to leave a review.
        </AlertDescription>
      </Alert>
    );
  }

  if (checkingEligibility) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Checking eligibility...</span>
      </div>
    );
  }

  if (!canReview && !existingReview) {
    return (
      <Alert className="border-primary/30 bg-primary/5">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          Only verified buyers can review this product. Purchase and receive this item to leave a review.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 text-sm text-primary">
        <BadgeCheck className="h-4 w-4" />
        <span className="font-medium">Verified Buyer</span>
      </div>

      <div className="space-y-2">
        <Label>Your Rating</Label>
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onRatingChange={setRating}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-text">Your Review</Label>
        <Textarea
          id="review-text"
          placeholder="Share your experience with this product (10-1000 characters)"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {reviewText.length}/1000 characters
        </p>
      </div>

      <Button
        type="submit"
        variant="gold"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : existingReview ? (
          'Update Review'
        ) : (
          'Submit Review'
        )}
      </Button>
    </form>
  );
};

export default ReviewForm;
