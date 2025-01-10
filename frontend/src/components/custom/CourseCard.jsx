import React from "react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge, Star } from "lucide-react";

function CourseCard({course}) {
    return (
        <div>
            <Card key={course.id} className="overflow-hidden">
                <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                />
                <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500 mb-2">
                        {course.instructor}
                    </p>
                    <div className="flex items-center mb-2">
                        <span className="text-yellow-500 mr-1">
                            {course.rating}
                        </span>
                        <Star className="w-4 h-4 fill-current text-yellow-500" />
                        <span className="text-sm text-gray-500 ml-1">
                            ({course.students.toLocaleString()} students)
                        </span>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <span className="font-bold">${course.price}</span>
                    <Badge variant="secondary">Bestseller</Badge>
                </CardFooter>
            </Card>
        </div>
    );
}

export default CourseCard;
