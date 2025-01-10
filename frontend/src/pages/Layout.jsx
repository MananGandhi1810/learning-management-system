import React from "react";
import NavBar from "@/components/custom/NavBar";
import { Outlet } from "react-router";

function Layout() {
    return (
        <div className="min-h-full">
            <main>
                <NavBar />
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
