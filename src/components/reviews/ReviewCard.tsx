import React, { useState } from 'react';
import { BadgeCheck, Trash2, Edit2, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: {
    id: string;
    user_id: string;
    rating: number;
    review_text: string;
    is_verified_purchase: boolean;
    created_at: string;
    profiles?: {
      display_name: string | null;
    };
  };
  onEdit?: (review: { id: string; rating: number; review_text: string }) => void;
  onDelete?: () => void;
  isAdmin?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  isAdmin = false
}) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isOwner = user?.id === review.user_id;

  const displayName = review.profiles?.display_name || 'Anonymous';
  // Mask the name for privacy: "John" -> "J***"
  const maskedName = displayName.length > 1 
    ? `${displayName[0]}${'*'.repeat(Math.min(displayName.length - 1, 3))}`
    : displayName;

  const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Log the deletion
      await supabase.from('review_logs').insert({
        user_id: user!.id,
        review_id: review.id,
        action: isAdmin && !isOwner ? 'admin_delete' : 'delete',
        details: { deleted_by: isAdmin && !isOwner ? 'admin' : 'owner' }
      });

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', review.id);

      if (error) throw error;

      toast({
        title: 'Review Deleted',
        description: 'The review has been removed.',
      });

      onDelete?.();
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEdit = () => {
    onEdit?.({
      id: review.id,
      rating: review.rating,
      review_text: review.review_text
    });
  };

  return (
    <>
      <div className="p-4 rounded-lg border border-border bg-card animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StarRating rating={review.rating} size="sm" />
              {review.is_verified_purchase && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  <BadgeCheck className="h-3 w-3" />
                  Verified Purchase
                </span>
              )}
            </div>

            <p className="text-sm text-foreground leading-relaxed">
              {review.review_text}
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">{maskedName}</span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          {(isOwner || isAdmin) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Review
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Review
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReviewCard;
