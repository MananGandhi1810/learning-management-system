import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
    useLoaderData,
    useSearchParams,
    useSubmit,
    useNavigation,
} from "react-router-dom";
import CourseCard from "@/components/custom/CourseCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import debounce from "lodash/debounce";

function AllCoursesPage() {
    const { courses } = useLoaderData();
    const [searchParams] = useSearchParams();
    const submit = useSubmit();
    const navigation = useNavigation();
    const [searchValue, setSearchValue] = useState(
        searchParams.get("search") || "",
    );

    const debouncedSubmit = useMemo(
        () =>
            debounce((form, value) => {
                const formData = new FormData(form);
                if (!value) {
                    formData.delete("search");
                }
                submit(formData, { replace: true });
            }, 500),
        [submit],
    );

    const handleSearchChange = useCallback(
        (e) => {
            const value = e.target.value;
            setSearchValue(value);
            debouncedSubmit(e.currentTarget.form, value);
        },
        [debouncedSubmit],
    );

    useEffect(() => {
        return () => {
            debouncedSubmit.cancel();
        };
    }, [debouncedSubmit]);

    const isSearching =
        navigation.location &&
        new URLSearchParams(navigation.location.search).has("search");

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6">All Courses</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <form>
                        <Input
                            placeholder="Search courses..."
                            className="pl-10 max-w-md"
                            type="search"
                            name="search"
                            value={searchValue}
                            onChange={handleSearchChange}
                            disabled={isSearching}
                        />
                    </form>
                </div>
            </div>

            {isSearching ? (
                <div className="text-center text-muted-foreground py-8">
                    Searching...
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    No courses found matching your search.
                </div>
            ) : (
                <div className="lg:grid-cols-4 md:grid-cols-2 grid-cols-1 grid gap-x-6 gap-y-8">
                    {courses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default AllCoursesPage;
