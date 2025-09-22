import React, { useState } from "react";
import { createTodo } from "../api";

export default function TodoForm({ token, onCreated }) {
    const [title, setTitle] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title.trim()) return;
        await createTodo(token, title, "");
        setTitle("");
        onCreated();
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                type="text"
                placeholder="Nueva tarea..."
                className="flex-1 p-2 border rounded focus:ring focus:ring-indigo-200"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <button className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700 transition">
                Agregar
            </button>
        </form>
    );
}
