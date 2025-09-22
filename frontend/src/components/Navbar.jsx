import React from "react";

export default function Navbar({ onLogout }) {
    return (
        <header className="bg-indigo-600 text-white p-4 flex justify-between items-center">
            <h1 className="text-lg font-bold">Todo App</h1>
            <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
            >
                Logout
            </button>
        </header>
    );
}
