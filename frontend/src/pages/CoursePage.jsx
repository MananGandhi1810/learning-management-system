import React, { useContext, useState, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Clock, PlayCircle, Star, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import AuthContext from "@/context/auth-provider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours} ${hours === 1 ? "hour" : "hours"} ${minutes} ${
            minutes === 1 ? "minute" : "minutes"
        }`;
    }
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}

function CoursePage() {
    const { course } = useLoaderData();
    const sortedVideos = [...course.videos].sort((a, b) => a.index - b.index);
    const { user } = useContext(AuthContext);
    const totalDuration = course.videos.reduce(
        (total, video) => total + video.duration,
        0,
    );
    const { toast } = useToast();
    const navigate = useNavigate();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [checkingAccess, setCheckingAccess] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [formError, setFormError] = useState("");

    useEffect(() => {
        const checkCourseAccess = async () => {
            if (!user.isAuthenticated) {
                setCheckingAccess(false);
                return;
            }

            try {
                const res = await axios.get(
                    `${process.env.SERVER_URL}/course/${course.slug}/videos`,
                    {
                        headers: { Authorization: `Bearer ${user.token}` },
                        validateStatus: false,
                    },
                );

                if (res.data.success) {
                    setHasAccess(true);
                }
            } catch (error) {
                console.log("User doesn't have access to this course");
            } finally {
                setCheckingAccess(false);
            }
        };

        checkCourseAccess();
    }, [course.slug, user.isAuthenticated, user.token]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get(
                    `${process.env.SERVER_URL}/reviews/${course.slug}`,
                );

                if (res.data.success) {
                    setReviews(res.data.data);

                    if (user.isAuthenticated) {
                        const myReview = res.data.data.find(
                            (review) => review.userId === user.id,
                        );
                        if (myReview) {
                            setUserReview(myReview);
                            setRating(myReview.rating);
                            setComment(myReview.comment);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            } finally {
                setLoadingReviews(false);
            }
        };

        fetchReviews();
    }, [course.slug, user.id, user.isAuthenticated]);

    const addToCart = async (id) => {
        const res = await axios
            .put(
                `${process.env.SERVER_URL}/cart/${id}`,
                {},
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                    validateStatus: false,
                },
            )
            .then((res) => res.data);
        if (!res.success) {
            toast({
                title: "Could not add to cart",
                description: res.message,
            });
        } else {
            toast({
                title: "Course added to cart",
            });
        }
    };

    const purchaseCourse = async () => {
        setIsProcessing(true);
        try {
            const res = await axios.post(
                `${process.env.SERVER_URL}/cart/purchase`,
                { courseId: course.id },
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                    validateStatus: false,
                },
            );

            if (res.data.success) {
                toast({
                    title: "Purchase successful",
                    description: "You now have access to this course",
                });
                navigate(`/my-courses/${course.slug}`);
            } else {
                toast({
                    title: "Purchase failed",
                    description: res.data.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Purchase failed",
                description: "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
            setConfirmOpen(false);
        }
    };

    const validateReviewForm = () => {
        if (!comment || comment.length < 10) {
            setFormError("Review must be at least 10 characters");
            return false;
        }

        if (comment.length > 500) {
            setFormError("Review cannot exceed 500 characters");
            return false;
        }

        setFormError("");
        return true;
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!validateReviewForm()) {
            return;
        }

        if (!user.isAuthenticated || !hasAccess) {
            toast({
                title: "Cannot submit review",
                description: "You need to purchase this course first",
                variant: "destructive",
            });
            return;
        }

        setIsSubmittingReview(true);

        try {
            const reviewData = {
                rating,
                comment,
            };

            const res = await axios.post(
                `${process.env.SERVER_URL}/reviews/${course.slug}`,
                reviewData,
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                    validateStatus: false,
                },
            );

            if (res.data.success) {
                const updatedReview = res.data.data;
                setUserReview(updatedReview);

                if (reviews.find((r) => r.userId === user.id)) {
                    setReviews(
                        reviews.map((r) =>
                            r.userId === user.id ? updatedReview : r,
                        ),
                    );
                } else {
                    setReviews([
                        {
                            ...updatedReview,
                            user: { id: user.id, name: user.name },
                        },
                        ...reviews,
                    ]);
                }

                setShowReviewForm(false);
                toast({
                    title: "Review submitted",
                    description: "Thank you for your feedback!",
                });
            } else {
                toast({
                    title: "Failed to submit review",
                    description: res.data.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error submitting review",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!user.isAuthenticated || !userReview) return;

        try {
            const res = await axios.delete(
                `${process.env.SERVER_URL}/reviews/${course.slug}`,
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                    validateStatus: false,
                },
            );

            if (res.data.success) {
                setReviews(reviews.filter((r) => r.userId !== user.id));
                setUserReview(null);
                setRating(5);
                setComment("");

                toast({
                    title: "Review deleted",
                    description: "Your review has been removed",
                });
            }
        } catch (error) {
            toast({
                title: "Failed to delete review",
                description: "Something went wrong",
                variant: "destructive",
            });
        }
    };

    const averageRating =
        reviews.length > 0
            ? (
                  reviews.reduce((sum, review) => sum + review.rating, 0) /
                  reviews.length
              ).toFixed(1)
            : "No ratings";

    const RatingStars = ({ rating }) => {
        return (
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${
                            star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                        }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
                            {course.title}
                        </h1>
                        <p className="text-xl text-muted-foreground mt-2">
                            {course.description}
                        </p>
                    </div>

                    <div>
                        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                            About this course
                        </h2>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <PlayCircle className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Videos
                                    </p>
                                    <p className="font-medium">
                                        {course.videos.length} lessons
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Duration
                                    </p>
                                    <p className="font-medium">
                                        {formatDuration(totalDuration)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <div className="flex justify-between items-center">
                            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                Reviews
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                                    <span className="font-medium">
                                        {averageRating}
                                    </span>
                                </div>
                                <span className="text-muted-foreground">
                                    ({reviews.length} reviews)
                                </span>
                            </div>
                        </div>

                        {hasAccess && user.isAuthenticated && (
                            <div className="mt-4">
                                {!showReviewForm && (
                                    <Button
                                        onClick={() => setShowReviewForm(true)}
                                        variant={
                                            userReview ? "outline" : "default"
                                        }
                                    >
                                        {userReview ? (
                                            <>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit your review
                                            </>
                                        ) : (
                                            "Write a review"
                                        )}
                                    </Button>
                                )}

                                {showReviewForm && (
                                    <Card className="mt-4">
                                        <CardHeader>
                                            <h3 className="font-semibold">
                                                {userReview
                                                    ? "Edit your review"
                                                    : "Write a review"}
                                            </h3>
                                        </CardHeader>
                                        <CardContent>
                                            <form
                                                onSubmit={handleReviewSubmit}
                                                className="space-y-4"
                                            >
                                                <div className="space-y-2">
                                                    <Label htmlFor="rating">
                                                        Rating
                                                    </Label>
                                                    <div className="flex items-center space-x-2">
                                                        {[1, 2, 3, 4, 5].map(
                                                            (star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`h-6 w-6 cursor-pointer ${
                                                                        star <=
                                                                        rating
                                                                            ? "fill-yellow-400 text-yellow-400"
                                                                            : "text-gray-300"
                                                                    }`}
                                                                    onClick={() =>
                                                                        setRating(
                                                                            star,
                                                                        )
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="comment">
                                                        Your review
                                                    </Label>
                                                    <Textarea
                                                        id="comment"
                                                        placeholder="Share your experience with this course..."
                                                        value={comment}
                                                        onChange={(e) =>
                                                            setComment(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <p className="text-sm text-muted-foreground">
                                                        Your review will be
                                                        visible to other users
                                                    </p>
                                                    {formError && (
                                                        <p className="text-sm font-medium text-destructive">
                                                            {formError}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex justify-between">
                                                    <div>
                                                        {userReview && (
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                onClick={
                                                                    handleDeleteReview
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <div className="space-x-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setShowReviewForm(
                                                                    false,
                                                                );
                                                                setFormError(
                                                                    "",
                                                                );
                                                                if (
                                                                    !userReview
                                                                ) {
                                                                    setRating(
                                                                        5,
                                                                    );
                                                                    setComment(
                                                                        "",
                                                                    );
                                                                } else {
                                                                    setRating(
                                                                        userReview.rating,
                                                                    );
                                                                    setComment(
                                                                        userReview.comment,
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            disabled={
                                                                isSubmittingReview
                                                            }
                                                        >
                                                            {isSubmittingReview
                                                                ? "Submitting..."
                                                                : "Submit Review"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        <div className="mt-6 space-y-6">
                            {loadingReviews ? (
                                <p className="text-center text-muted-foreground">
                                    Loading reviews...
                                </p>
                            ) : reviews.length === 0 ? (
                                <p className="text-center text-muted-foreground">
                                    No reviews yet
                                </p>
                            ) : (
                                reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="border-b pb-6 last:border-0"
                                    >
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-medium">
                                                    {review.user.name}
                                                </p>
                                                <div className="flex items-center mt-1">
                                                    <RatingStars
                                                        rating={review.rating}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(
                                                    review.createdAt,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="mt-2">{review.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <img
                            src={course.thumbnailPath}
                            alt={course.title}
                            className="w-full aspect-video object-cover rounded-lg"
                        />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline justify-between mb-6">
                            <span className="text-3xl font-bold">
                                ₹{course.price}
                            </span>
                            {user.isAuthenticated && (
                                <div className="space-x-2">
                                    {checkingAccess ? (
                                        <Button disabled>
                                            Checking access...
                                        </Button>
                                    ) : hasAccess ? (
                                        <Button
                                            onClick={() =>
                                                navigate(
                                                    `/my-courses/${course.slug}`,
                                                )
                                            }
                                            className="w-full"
                                        >
                                            Go to Course
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    addToCart(course.id)
                                                }
                                            >
                                                Add to Cart
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    setConfirmOpen(true)
                                                }
                                            >
                                                Buy Now
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-1">
                            <h3 className="font-semibold">Course Content</h3>
                            <div className="space-y-2 mt-4">
                                {sortedVideos.map((video, index) => (
                                    <Dialog key={video.index}>
                                        <DialogTrigger className="w-full">
                                            <div className="flex items-center gap-3 text-sm p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer text-left">
                                                <span className="text-muted-foreground">
                                                    {index + 1}.
                                                </span>
                                                <span className="flex-1">
                                                    {video.title}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {formatDuration(
                                                        video.duration,
                                                    )}
                                                </span>
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    {video.title}
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="mt-4">
                                                <p className="text-muted-foreground">
                                                    {video.description}
                                                </p>
                                                <div className="mt-4 text-sm text-muted-foreground">
                                                    Duration:{" "}
                                                    {formatDuration(
                                                        video.duration,
                                                    )}
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {!hasAccess && (
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Purchase</DialogTitle>
                            <DialogDescription>
                                You are about to purchase {course.title} for ₹
                                {course.price}. Would you like to proceed?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setConfirmOpen(false)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={purchaseCourse}
                                disabled={isProcessing}
                            >
                                {isProcessing
                                    ? "Processing..."
                                    : "Confirm Purchase"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

export default CoursePage;
