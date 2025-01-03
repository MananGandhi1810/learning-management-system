import React from "react";
import { Button } from "./components/ui/button";
import { ThemeProvider } from "./context/theme-provider";

function App() {
    return (
        <div className="font-inter overflow-x-hidden">
            <ThemeProvider defaultTheme="dark">
                <Button>Test Button</Button>
            </ThemeProvider>
        </div>
    );
}

export default App;
