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
            points: res.data.points,
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
                        const course = await axios
                            .get(
                                `${process.env.SERVER_URL}/course/all?${search}`,
                                {
                                    validateStatus: false,
                                },
                            )
                            .then((res) => res.data);
                        return course.data;
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
                        return course.data;
                    },
                    element: <CoursePage />,
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
