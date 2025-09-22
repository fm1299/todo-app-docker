import React, { useState } from "react";
import LoginPage from "./pages/LoginPage";
import TodoPage from "./pages/TodoPage";

export default function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));

    function handleAuth(newToken) {
        setToken(newToken);
        localStorage.setItem("token", newToken);
    }

    function handleLogout() {
        setToken(null);
        localStorage.removeItem("token");
    }

    return (
        <div className="min-h-screen flex flex-col">
            {!token
                ? <LoginPage onAuth={handleAuth} />
                : <TodoPage token={token} onLogout={handleLogout} />}
        </div>
    );
}
