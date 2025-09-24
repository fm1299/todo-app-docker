"use client"

import { useState } from "react"
import LoginPage from "./pages/LoginPage"
import TodoPage from "./pages/TodoPage"

export default function App() {
    const [token, setToken] = useState(localStorage.getItem("token"))

    function handleAuth(newToken) {
        setToken(newToken)
        localStorage.setItem("token", newToken)
    }

    function handleLogout() {
        setToken(null)
        localStorage.removeItem("token")
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
            <div className="relative z-10">
                {!token ? <LoginPage onAuth={handleAuth} /> : <TodoPage token={token} onLogout={handleLogout} />}
            </div>
        </div>
    )
}
