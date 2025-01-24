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
import Leaderboard from "@/pages/Leaderboard.jsx";
import NoPageFound from "@/pages/404.jsx";
import { useToast } from "@/hooks/use-toast";

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
                    path: "/leaderboard",
                    loader: async () => {
                        var res;
                        try {
                            res = await axios
                                .get(`${process.env.SERVER_URL}/leaderboard`, {
                                    headers: {
                                        Authorization:
                                            user.token != null ||
                                            user.token != undefined
                                                ? `Bearer ${user.token}`
                                                : "",
                                    },
                                    validateStatus: false,
                                })
                                .then((res) => res.data);
                        } catch (e) {
                            return null;
                        }
                        if (!res.success) {
                            return null;
                        }
                        return res.data.leaderboard;
                    },
                    element: <Leaderboard />,
                },
                {
                    path: "/gh-callback",
                    loader: async ({ request }) => {
                        var res;
                        const requestToken = new URL(
                            request.url,
                        ).searchParams.get("requestToken");
                        if (!requestToken) {
                            return null;
                        }
                        try {
                            res = await axios
                                .get(
                                    `${process.env.SERVER_URL}/auth/accessToken`,
                                    {
                                        headers: {
                                            authorization: `Bearer ${requestToken}`,
                                        },
                                        validateStatus: false,
                                    },
                                )
                                .then((res) => res.data);
                        } catch (e) {
                            return null;
                        }
                        if (!res.success) {
                            return null;
                        }
                        setUser((prevUser) => {
                            return {
                                ...prevUser,
                                token: res.data.accessToken,
                                isAuthenticated: true,
                            };
                        });
                        return redirect("/");
                    },
                    element: <Home />,
                },
                {
                    path: "gh-callback-error",
                    loader: async ({ request }) => {
                        const error = new URL(request.url).searchParams.get(
                            "error",
                        );
                        toast({
                            title: "An Error Occurred",
                            description: error,
                        });
                        return redirect("/login");
                    },
                    element: <Login />,
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
