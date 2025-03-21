import React, { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "@/context/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

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

function CourseContentPage() {
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { slug } = useParams();
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourseContent = async () => {
            try {
                const res = await axios.get(
                    `${process.env.SERVER_URL}/course/${slug}/videos`,
                    {
                        headers: { Authorization: `Bearer ${user.token}` },
                        validateStatus: false,
                    },
                );

                if (res.data.success) {
                    setCourseData(res.data.data.course);
                } else {
                    toast({
                        title: "Access Denied",
                        description: res.data.message,
                        variant: "destructive",
                    });
                    navigate("/my-courses");
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load course content",
                    variant: "destructive",
                });
                navigate("/my-courses");
            } finally {
                setLoading(false);
            }
        };

        fetchCourseContent();
    }, [slug, user.token, toast, navigate]);

    if (loading) {
        return (
            <div className="container mx-auto py-20 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="mt-4 text-muted-foreground">
                    Loading course content...
                </p>
            </div>
        );
    }

    if (!courseData) return null;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <Link
                    to="/my-courses"
                    className="text-primary hover:underline mb-2 block"
                >
                    ← Back to My Courses
                </Link>
                <h1 className="text-3xl font-bold">{courseData.title}</h1>
                <p className="text-muted-foreground mt-2">
                    {courseData.description}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-lg overflow-hidden border">
                        <img
                            src={courseData.thumbnailPath}
                            alt={courseData.title}
                            className="w-full h-[300px] object-cover"
                        />
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold">
                                Course Content
                            </h2>
                            <p className="text-muted-foreground mt-2">
                                {courseData.videos.length} videos • Total{" "}
                                {formatDuration(
                                    courseData.videos.reduce(
                                        (acc, video) => acc + video.duration,
                                        0,
                                    ),
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Videos</h3>
                    {courseData.videos.map((video, index) => (
                        <Link
                            to={`/my-courses/${slug}/video/${video.id}`}
                            key={video.id}
                            className="block"
                        >
                            <div className="p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full text-primary-foreground flex items-center justify-center">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium">
                                        {video.title}
                                    </h4>
                                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {formatDuration(video.duration)}
                                    </div>
                                </div>
                                <Play className="w-5 h-5" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CourseContentPage;
