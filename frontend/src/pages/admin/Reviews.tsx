import { useState, useEffect } from "react";
import { Search, Filter, Trash2, Eye, EyeOff, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { reviewsAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface ReviewItem {
    _id: string;
    product_id?: { name?: string; _id?: string };
    user_id?: { display_name?: string; email?: string };
    rating: number;
    review_text: string;
    created_at: string;
    is_visible?: boolean;
}

const Reviews = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRating, setFilterRating] = useState<string>("all");
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            const data = await reviewsAPI.getAll();
            setReviews(data.reviews || []);
        } catch (err: any) {
            toast({
                title: "Error fetching reviews",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteReview = async (id: string) => {
        try {
            await reviewsAPI.hide(id);
            toast({ title: "Review deleted successfully" });
            setDeleteConfirm(null);
            fetchReviews();
        } catch (err: any) {
            toast({
                title: "Error deleting review",
                description: err.message,
                variant: "destructive",
            });
        }
    };

    const filteredReviews = reviews.filter(review => {
        const matchesSearch =
            review.review_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.product_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.user_id?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRating =
            filterRating === "all" || review.rating === parseInt(filterRating);

        return matchesSearch && matchesRating;
    });

    const averageRating =
        reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${
                            star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                        }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Reviews
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage customer reviews and ratings.
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {averageRating}
                    </p>
                    <p className="text-sm text-gray-500">
                        Average Rating ({reviews.length} reviews)
                    </p>
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {reviews.length}
                    </p>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">5 Star Reviews</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {reviews.filter((r) => r.rating === 5).length}
                    </p>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">1-3 Star Reviews</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {reviews.filter((r) => r.rating <= 3).length}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search reviews or products..."
                            className="pl-9 bg-white dark:bg-zinc-950"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto bg-white dark:bg-zinc-950"
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Rating: {filterRating === "all" ? "All" : filterRating}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by Rating</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setFilterRating("all")}>
                                All Ratings
                            </DropdownMenuItem>
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <DropdownMenuItem
                                    key={rating}
                                    onClick={() => setFilterRating(String(rating))}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{rating} Star</span>
                                        {renderStars(rating)}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-900/50 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-medium">Product</th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Rating</th>
                                <th className="px-6 py-4 font-medium">Review</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                                    </td>
                                </tr>
                            ) : filteredReviews.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No reviews found
                                    </td>
                                </tr>
                            ) : (
                                filteredReviews.map((review) => (
                                    <tr
                                        key={review._id}
                                        className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900 dark:text-gray-300">
                                                {review.product_id?.name || "Unknown Product"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {review.user_id?.display_name || review.user_id?.email || "Anonymous"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1">
                                                {renderStars(review.rating)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-gray-600 dark:text-gray-400 truncate">
                                                {review.review_text}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 dark:text-red-400"
                                                onClick={() => setDeleteConfirm(review._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this review? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-3 mb-4">
                        <p className="text-sm text-red-800 dark:text-red-200">
                            <strong>Warning:</strong> This will permanently remove the review from your store.
                        </p>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => deleteConfirm && handleDeleteReview(deleteConfirm)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
            </div>
        </div>
    );
};

export default Reviews;
