import React, { useState } from "react";
import { login, register } from "../api";

export default function LoginPage({ onAuth }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState("login");
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        try {
            const res = mode === "login"
                ? await login(username, password)
                : await register(username, password);
            onAuth(res.access_token);
        } catch (err) {
            setError("❌ " + (err.detail || "Error"));
        }
    }

    return (
        <div className="flex flex-col items-center justify-center flex-1">
            <div className="bg-white shadow-lg rounded-lg p-8 w-96">
                <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">
                    {mode === "login" ? "Login" : "Register"}
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">
                        {mode === "login" ? "Login" : "Register"}
                    </button>
                </form>
                <p className="text-center mt-4">
                    {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
                    <button
                        onClick={() => setMode(mode === "login" ? "register" : "login")}
                        className="text-indigo-600 font-semibold ml-2"
                    >
                        {mode === "login" ? "Regístrate" : "Inicia sesión"}
                    </button>
                </p>
                {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
            </div>
        </div>
    );
}
