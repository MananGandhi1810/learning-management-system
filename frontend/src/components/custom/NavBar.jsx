import { Button } from "@/components/ui/button.jsx";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet.jsx";
import { ArrowRight, Computer, Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link, useNavigation } from "react-router";
import LoadingBar from "react-top-loading-bar";
import { Input } from "../ui/input";

export default function NavBar() {
    const loaderRef = useRef(null);
    const { state: navState } = useNavigation();

    useEffect(() => {
        if (navState == "loading") {
            loaderRef.current.continuousStart();
        } else {
            loaderRef.current.complete();
        }
    }, [navState]);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background dark:bg-background">
            <LoadingBar color="#ffffff" ref={loaderRef} />
            <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
                <div className="flex-1 flex flex-row">
                    <Link
                        to="/"
                        className="flex items-center gap-2 justify-start w-min pr-10"
                    >
                        <Computer />{" "}
                        <span className="font-medium">SkillMaster</span>
                    </Link>
                    <nav className="hidden items-center gap-6 text-sm font-medium md:flex flex-1">
                        <Link
                            to="/"
                            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 relative after:bg-white after:absolute after:h-0.5 after:w-0 after:-bottom-1 after:left-0 hover:after:w-full after:transition-all duration-300"
                        >
                            Home
                        </Link>
                        <Link
                            to="/courses"
                            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 relative after:bg-white after:absolute after:h-0.5 after:w-0 after:-bottom-1 after:left-0 hover:after:w-full after:transition-all duration-300"
                        >
                            Courses
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center justify-end flex-1 gap-4">
                    <div className="relative invisible md:visible">
                        <Input
                            type="search"
                            placeholder="Search for courses"
                            className="pl-10 pr-4 py-2 rounded-full border-gray-300 focus:[#34dded]"
                        />
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={20}
                        />
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" asChild>
                            <Link to="/login">Login</Link>
                        </Button>
                        <Button className="group" asChild>
                            <Link to="/register">
                                Register
                                <ArrowRight className="ml-2 z-10 group-hover:ml-3 duration-200" />
                            </Link>
                        </Button>
                    </div>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full md:hidden"
                            >
                                <MenuIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                <span className="sr-only">
                                    Toggle navigation menu
                                </span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="md:hidden">
                            <div className="grid gap-4 p-4">
                                <Link
                                    to="/"
                                    className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/courses"
                                    className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                                >
                                    Courses
                                </Link>
                                <div className="relative">
                                    <Input
                                        type="search"
                                        placeholder="Search for courses"
                                        className="pl-10 pr-4 py-2 rounded-full border-gray-300 focus:[#34dded]"
                                    />
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                        size={20}
                                    />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}

function MenuIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
    );
}
