import React from "react";
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router";
import { Star, StarHalf } from "lucide-react";

function CourseCard({ course, className }) {
    const calculateAverageRating = () => {
        if (!course.reviews || course.reviews.length === 0) return null;

        const totalRating = course.reviews.reduce((acc, review) => {
            return acc + (review.rating || 0);
        }, 0);

        return (totalRating / course.reviews.length).toFixed(1);
    };

    const averageRating = calculateAverageRating();

    return (
        <Link asChild to={`/course/${course.slug}`}>
            <Card key={course.id} className={cn("overflow-hidden", className)}>
                {course.thumbnailPath ? (
                    <img
                        src={course.thumbnailPath}
                        alt={course.title}
                        className="w-full h-48 object-cover"
                    />
                ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        No thumbnail
                    </div>
                )}
                <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500 line-clamp-2">
                        {course.description}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <span className="font-bold">₹{course.price}</span>
                    {averageRating && (
                        <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 text-sm">
                                {averageRating} ({course.reviews.length})
                            </span>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </Link>
    );
}

export default CourseCard;
