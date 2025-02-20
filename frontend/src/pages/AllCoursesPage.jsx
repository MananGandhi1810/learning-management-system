import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
    useLoaderData,
    useSearchParams,
    useSubmit,
    useNavigation,
} from "react-router-dom";
import CourseCard from "@/components/custom/CourseCard";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import debounce from "lodash/debounce";

function AllCoursesPage() {
    const { courses } = useLoaderData();
    const [searchParams] = useSearchParams();
    const submit = useSubmit();
    const navigation = useNavigation();
    const [searchValue, setSearchValue] = useState(
        searchParams.get("search") || "",
    );
    const [priceRange, setPriceRange] = useState({
        min: searchParams.get("minPrice") || "",
        max: searchParams.get("maxPrice") || "",
    });

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

    const handlePriceSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        if (!priceRange.min) formData.delete("minPrice");
        if (!priceRange.max) formData.delete("maxPrice");
        submit(formData, { replace: true });
    };

    const clearFilters = () => {
        setPriceRange({ min: "", max: "" });
        submit(new FormData(), { replace: true });
    };

    const hasFilters = priceRange.min || priceRange.max;

    const isSearching =
        navigation.location &&
        new URLSearchParams(navigation.location.search).has("search");

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6">All Courses</h1>
                <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <form>
                            <Input
                                placeholder="Search courses..."
                                className="pl-10"
                                type="search"
                                name="search"
                                value={searchValue}
                                onChange={handleSearchChange}
                                disabled={isSearching}
                            />
                        </form>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                Filters
                                {hasFilters && (
                                    <Badge variant="secondary" className="ml-2">
                                        Active
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <form onSubmit={handlePriceSubmit}>
                                <div className="space-y-4">
                                    <h4 className="font-medium">Price Range</h4>
                                    <div className="flex gap-4">
                                        <div className="grid gap-2 flex-1">
                                            <Label htmlFor="minPrice">
                                                Min (₹)
                                            </Label>
                                            <Input
                                                type="number"
                                                id="minPrice"
                                                name="minPrice"
                                                placeholder="0"
                                                value={priceRange.min}
                                                onChange={(e) =>
                                                    setPriceRange((prev) => ({
                                                        ...prev,
                                                        min: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2 flex-1">
                                            <Label htmlFor="maxPrice">
                                                Max (₹)
                                            </Label>
                                            <Input
                                                type="number"
                                                id="maxPrice"
                                                name="maxPrice"
                                                placeholder="1000"
                                                value={priceRange.max}
                                                onChange={(e) =>
                                                    setPriceRange((prev) => ({
                                                        ...prev,
                                                        max: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="submit"
                                            className="flex-1"
                                        >
                                            Apply
                                        </Button>
                                        {hasFilters && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={clearFilters}
                                                className="flex-1"
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </PopoverContent>
                    </Popover>
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
