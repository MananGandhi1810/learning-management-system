import React, { useContext } from "react";
import { useLoaderData } from "react-router";
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
                                ${course.price}
                            </span>
                            <Button
                                size="lg"
                                className="w-32"
                                onClick={() => addToCart(course.id)}
                            >
                                Add to Cart
                            </Button>
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
        </div>
    );
}

export default CoursePage;
