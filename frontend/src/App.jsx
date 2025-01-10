import React from "react";
import { ThemeProvider } from "./context/theme-provider";
import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "@/pages/Layout";
import Home from "@/pages/Home";

function App() {
    const router = createBrowserRouter([
        {
            element: <Layout />,
            children: [
                {
                    path: "/",
                    element: <Home />,
                },
            ],
        },
    ]);

    return (
        <div className="font-inter">
            <ThemeProvider defaultTheme="dark">
                <RouterProvider router={router} />
            </ThemeProvider>
        </div>
    );
}

export default App;
