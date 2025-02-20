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

function CourseCard({ course, className }) {
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
                </CardFooter>
            </Card>
        </Link>
    );
}

export default CourseCard;
