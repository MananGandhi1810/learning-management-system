import { ThemeProvider } from "@/components/theme-provider.jsx";
import {
    createBrowserRouter,
    redirect,
    RouterProvider,
} from "react-router-dom";
import Home from "@/pages/Home.jsx";
import Layout from "@/pages/Layout.jsx";
import Login from "@/pages/Login.jsx";
import Register from "@/pages/Register.jsx";
import AuthContext from "@/context/auth-provider.jsx";
import { useEffect, useState } from "react";
import axios from "axios";
import ForgotPassword from "@/pages/ForgotPassword.jsx";
import VerifyOtp from "@/pages/VerifyOtp.jsx";
import ResetPassword from "@/pages/ResetPassword.jsx";
import NoPageFound from "@/pages/404.jsx";
import { useToast } from "@/hooks/use-toast";
import CoursePage from "./pages/CoursePage";
import AllCoursesPage from "./pages/AllCoursesPage";
import CartPage from "./pages/CartPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import CourseContentPage from "./pages/CourseContentPage";
import VideoPlayerPage from "./pages/VideoPlayerPage";

function App() {
    const initialState = {
        id: null,
        name: null,
        email: null,
        token: null,
        isAuthenticated: false,
    };
    const { toast } = useToast();
    const [user, setUser] = useState(
        () =>
            JSON.parse(
                localStorage.getItem("user") ?? JSON.stringify(initialState),
            ) || initialState,
    );

    const fetchUserData = async () => {
        if (!user.isAuthenticated) {
            return;
        }
        const res = await axios
            .get(`${process.env.SERVER_URL}/auth/user`, {
                headers: {
                    authorization: `Bearer ${user.token}`,
                },
                validateStatus: false,
            })
            .then((res) => res.data);
        if (!res.success) {
            setUser(initialState);
            return;
        }
        setUser({
            ...user,
            id: res.data.id,
            name: res.data.name,
            email: res.data.email,
        });
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const router = createBrowserRouter([
        {
            element: <Layout />,
            errorElement: (
                <p className="w-screen h-full-w-nav flex justify-center align-middle items-center">
                    Something went wrong
                </p>
            ),
            children: [
                {
                    path: "/",
                    loader: async ({ request }) => {
                        const courses = await axios
                            .get(`${process.env.SERVER_URL}/course/all`, {
                                validateStatus: false,
                            })
                            .then((res) => res.data);
                        if (!courses) {
                            return null;
                        }
                        return courses.data;
                    },
                    element: <Home />,
                },
                {
                    path: "/login",
                    loader: ({ request }) => {
                        const searchParams = new URL(request.url).searchParams;
                        if (user.isAuthenticated) {
                            return redirect(searchParams.get("next") || "/");
                        }
                        return null;
                    },
                    element: <Login />,
                },
                {
                    path: "/register",
                    loader: ({ request }) => {
                        const searchParams = new URL(request.url).searchParams;
                        if (user.isAuthenticated) {
                            return redirect(searchParams.get("next") || "/");
                        }
                        return null;
                    },
                    element: <Register />,
                },
                {
                    path: "/forgot-password",
                    loader: ({ request }) => {
                        const searchParams = new URL(request.url).searchParams;
                        if (user.isAuthenticated) {
                            return redirect(searchParams.get("next") || "/");
                        }
                        return null;
                    },
                    element: <ForgotPassword />,
                },
                {
                    path: "/verify-otp",
                    loader: ({ request }) => {
                        const searchParams = new URL(request.url).searchParams;
                        if (user.isAuthenticated) {
                            return redirect(searchParams.get("next") || "/");
                        }
                        return null;
                    },
                    element: <VerifyOtp />,
                },
                {
                    path: "/reset-password",
                    loader: ({ request }) => {
                        const searchParams = new URL(request.url).searchParams;
                        if (user.isAuthenticated) {
                            return redirect(searchParams.get("next") || "/");
                        }
                        return null;
                    },
                    element: <ResetPassword />,
                },
                {
                    path: "/courses",
                    loader: async ({ request }) => {
                        const search = new URL(request.url).searchParams;
                        const response = await axios.get(
                            `${process.env.SERVER_URL}/course/all?${search}`,
                            {
                                validateStatus: false,
                            },
                        );
                        return response.data.data;
                    },
                    element: <AllCoursesPage />,
                },
                {
                    path: "/course/:slug",
                    loader: async ({ params: { slug } }) => {
                        const course = await axios
                            .get(`${process.env.SERVER_URL}/course/${slug}`, {
                                validateStatus: false,
                            })
                            .then((res) => res.data);

                        const reviews = await axios
                            .get(`${process.env.SERVER_URL}/reviews/${slug}`, {
                                validateStatus: false,
                            })
                            .then((res) => res.data?.data || [])
                            .catch(() => []);

                        console.log(course);
                        return {
                            course: course.data.course,
                            reviews,
                        };
                    },
                    element: <CoursePage />,
                },
                {
                    path: "/cart",
                    loader: async (req) => {
                        if (!user.isAuthenticated) {
                            return redirect("/login?next=/cart");
                        }
                        return null;
                    },
                    element: <CartPage />,
                },
                {
                    path: "/my-courses",
                    loader: ({ request }) => {
                        if (!user.isAuthenticated) {
                            return redirect("/login?next=/my-courses");
                        }
                        return null;
                    },
                    element: <MyCoursesPage />,
                },
                {
                    path: "/my-courses/:slug",
                    loader: ({ request }) => {
                        if (!user.isAuthenticated) {
                            return redirect(
                                `/login?next=${encodeURIComponent(
                                    request.url,
                                )}`,
                            );
                        }
                        return null;
                    },
                    element: <CourseContentPage />,
                },
                {
                    path: "/my-courses/:slug/video/:videoId",
                    loader: ({ request }) => {
                        if (!user.isAuthenticated) {
                            return redirect(
                                `/login?next=${encodeURIComponent(
                                    request.url,
                                )}`,
                            );
                        }
                        return null;
                    },
                    element: <VideoPlayerPage />,
                },
                {
                    path: "*",
                    element: <NoPageFound />,
                },
            ],
        },
    ]);

    useEffect(() => {
        localStorage.setItem("user", JSON.stringify(user));
    }, [user]);

    useEffect(() => {
        fetchUserData();
    }, [user.isAuthenticated, user.token]);

    return (
        <div className="font-inter overflow-x-hidden">
            <AuthContext.Provider
                value={{
                    user,
                    setUser,
                }}
            >
                <ThemeProvider defaultTheme="dark">
                    <RouterProvider router={router} />
                </ThemeProvider>
            </AuthContext.Provider>
        </div>
    );
}

export default App;
