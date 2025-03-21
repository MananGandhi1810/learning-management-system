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
import { Clock, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import AuthContext from "@/context/auth-provider";

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
                // If error, user doesn't have access - default state is false
                console.log("User doesn't have access to this course");
            } finally {
                setCheckingAccess(false);
            }
        };

        checkCourseAccess();
    }, [course.slug, user.isAuthenticated, user.token]);

    const addToCart = async (id) => {
        console.log(user);
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
                            <div className="space-x-2">
                                {checkingAccess ? (
                                    <Button disabled>Checking access...</Button>
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
                                            onClick={() => addToCart(course.id)}
                                        >
                                            Add to Cart
                                        </Button>
                                        <Button
                                            onClick={() => setConfirmOpen(true)}
                                        >
                                            Buy Now
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-1">
                            <h3 className="font-semibold">Course Content</h3>
                            <div className="space-y-2 mt-4">
                                {sortedVideos.map((video) => (
                                    <Dialog key={video.index}>
                                        <DialogTrigger className="w-full">
                                            <div className="flex items-center gap-3 text-sm p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer text-left">
                                                <span className="text-muted-foreground">
                                                    {video.index + 1}.
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

            {/* Purchase Confirmation Dialog - only render if not hasAccess */}
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
