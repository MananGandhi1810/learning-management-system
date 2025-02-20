import CourseCard from "@/components/custom/CourseCard";
import { Button } from "@/components/ui/button";
import React from "react";
import { useLoaderData } from "react-router";

function Home() {
    const { courses } = useLoaderData();
    console.log(courses);

    return (
        <div className="h-full-w-nav w-screen">
            <section className="bg-main text-text py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Master Any Skill with SkillMaster
                        </h1>
                        <p className="text-xl mb-8">
                            Learn from expert instructors and join millions of
                            students worldwide. Start your learning journey
                            today!
                        </p>
                        <Button
                            size="lg"
                            className="bg-white text-text hover:bg-gray-100"
                        >
                            Explore Courses
                        </Button>
                    </div>
                </div>
            </section>
            <section>
                <div className="lg:grid-cols-3 md:grid-cols-2 grid-cols-1 grid p-10 gap-x-8 gap-y-6">
                    {courses.map((course) => (
                        <CourseCard key={course.id} course={course} className="max-w-md" />
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Home;
