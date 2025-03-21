import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "@/context/auth-provider";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

function MyCoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const { toast } = useToast();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get(
                    `${process.env.SERVER_URL}/course/my-courses`,
                    {
                        headers: { Authorization: `Bearer ${user.token}` },
                        validateStatus: false,
                    },
                );

                if (res.data.success) {
                    setCourses(res.data.data.courses);
                } else {
                    toast({
                        title: "Failed to load courses",
                        description: res.data.message,
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load your courses",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user.token, toast]);

    if (loading) {
        return (
            <div className="container mx-auto py-20 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="mt-4 text-muted-foreground">
                    Loading your courses...
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">My Courses</h1>

            {courses.length === 0 ? (
                <div className="text-center py-12">
                    <h2 className="text-xl font-medium mb-4">
                        You haven't purchased any courses yet
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Browse our catalog to find courses that interest you
                    </p>
                    <Link
                        to="/courses"
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                    >
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Link to={`/my-courses/${course.slug}`} key={course.id}>
                            <Card className="h-full hover:shadow-md transition-shadow">
                                <CardHeader className="p-0">
                                    <img
                                        src={course.thumbnailPath}
                                        alt={course.title}
                                        className="w-full h-48 object-cover rounded-t-lg"
                                    />
                                </CardHeader>
                                <CardContent className="p-4">
                                    <CardTitle className="text-xl mb-2">
                                        {course.title}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {course.description}
                                    </p>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <span className="text-sm text-muted-foreground">
                                        Continue Learning
                                    </span>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyCoursesPage;
