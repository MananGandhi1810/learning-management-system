import CourseCard from "@/components/custom/CourseCard";
import { Button } from "@/components/ui/button";
import React from "react";
import { useLoaderData } from "react-router";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle, Zap, Sparkles } from "lucide-react";

function Home() {
    const { courses } = useLoaderData();

    return (
        <div className="h-full w-screen overflow-hidden">
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 gradient-bg opacity-90 -z-10"></div>
                <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-20 -z-10"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
                            Master Any Skill with{" "}
                            <span className="relative">
                                SkillMaster
                                <span className="absolute -top-6 -right-6 text-yellow-400">
                                    <Sparkles size={24} />
                                </span>
                            </span>
                        </h1>
                        <p className="text-xl mb-8 text-white/90">
                            Learn from expert instructors and join millions of
                            students worldwide. Start your learning journey
                            today!
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button
                                size="lg"
                                asChild
                                className="bg-white text-primary hover:bg-white/90 rounded-full px-8 font-medium"
                            >
                                <Link to="/courses">Explore Courses</Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                asChild
                                className="bg-transparent border-white text-white hover:bg-white/10 rounded-full px-8 font-medium"
                            >
                                <Link to="/register">Join Now</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gray-50 dark:bg-gray-900/30">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                        <h2 className="text-3xl font-bold mb-4 md:mb-0">
                            Featured Courses
                        </h2>
                        <Link
                            to="/courses"
                            className="text-primary hover:underline flex items-center gap-2 font-medium"
                        >
                            View all courses <Zap size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                        {courses.slice(0, 6).map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                className="hover-scale card-glow"
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white dark:bg-gray-800/20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center">
                        Why Choose SkillMaster
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <BookOpen className="text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                High-Quality Content
                            </h3>
                            <p className="text-muted-foreground">
                                All our courses are created by industry experts
                                and undergo rigorous quality checks.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                                <CheckCircle className="text-accent" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                Flexible Learning
                            </h3>
                            <p className="text-muted-foreground">
                                Learn at your own pace with lifetime access to
                                courses from any device.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Zap className="text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                Career Growth
                            </h3>
                            <p className="text-muted-foreground">
                                Gain real-world skills that help you advance in
                                your career or change paths entirely.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
