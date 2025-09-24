"use client"

import { useState } from "react"
import { login, register } from "../api"

export default function LoginPage({ onAuth }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [mode, setMode] = useState("login")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = mode === "login" ? await login(username, password) : await register(username, password)
            onAuth(res.access_token)
        } catch (err) {
            setError(err.detail || "Authentication failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">TaskFlow</h1>
                    <p className="text-gray-400">Your productivity companion</p>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-white mb-2">
                            {mode === "login" ? "Welcome back" : "Create account"}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {mode === "login" ? "Sign in to your account to continue" : "Sign up to get started with TaskFlow"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Username</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                            <button
                                onClick={() => setMode(mode === "login" ? "register" : "login")}
                                className="text-orange-500 hover:text-orange-400 font-medium ml-2 transition-colors"
                            >
                                {mode === "login" ? "Sign up" : "Sign in"}
                            </button>
                        </p>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
