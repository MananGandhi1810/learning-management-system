import React, { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "@/context/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

function VideoPlayerPage() {
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { slug, videoId } = useParams();
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVideoData = async () => {
            try {
                const res = await axios.get(
                    `${process.env.SERVER_URL}/course/${slug}/videos/${videoId}`,
                    {
                        headers: { Authorization: `Bearer ${user.token}` },
                        validateStatus: false,
                    },
                );

                if (res.data.success) {
                    setVideoData(res.data.data);
                } else {
                    toast({
                        title: "Access Denied",
                        description: res.data.message,
                        variant: "destructive",
                    });
                    navigate(`/my-courses/${slug}`);
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load video",
                    variant: "destructive",
                });
                navigate(`/my-courses/${slug}`);
            } finally {
                setLoading(false);
            }
        };

        fetchVideoData();
    }, [slug, videoId, user.token, toast, navigate]);

    if (loading) {
        return (
            <div className="container mx-auto py-20 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="mt-4 text-muted-foreground">Loading video...</p>
            </div>
        );
    }

    if (!videoData) return null;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <Link
                    to={`/my-courses/${slug}`}
                    className="inline-flex items-center text-primary hover:underline mb-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Course
                </Link>
                <h1 className="text-2xl font-bold">{videoData.video.title}</h1>
                <p className="text-muted-foreground">
                    {videoData.course.title}
                </p>
            </div>

            <div className="aspect-video mb-8 bg-transparent rounded-lg overflow-hidden">
                <iframe
                    src={videoData.video.url}
                    className="w-full h-full"
                    title={videoData.video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>

            <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Video Description
                </h2>
                <p className="text-muted-foreground whitespace-pre-line">
                    {videoData.video.description}
                </p>
            </div>
        </div>
    );
}

export default VideoPlayerPage;
