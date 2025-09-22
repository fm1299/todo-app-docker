import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import TodoForm from "../components/TodoForm";
import TodoItem from "../components/TodoItem";
import { fetchTodos, toggleTodo } from "../api";

export default function TodoPage({ token, onLogout }) {
    const [todos, setTodos] = useState([]);

    async function loadTodos() {
        const data = await fetchTodos(token);
        setTodos(data);
    }

    useEffect(() => { loadTodos(); }, []);

    async function handleToggle(id) {
        await toggleTodo(token, id);
        loadTodos();
    }

    return (
        <div className="flex flex-col flex-1">
            <Navbar onLogout={onLogout} />
            <div className="max-w-2xl mx-auto mt-6 p-4 bg-white rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Mis Tareas</h2>
                <TodoForm token={token} onCreated={loadTodos} />
                <ul className="mt-4 space-y-2">
                    {todos.map(t => (
                        <TodoItem key={t.id} todo={t} onToggle={() => handleToggle(t.id)} />
                    ))}
                </ul>
            </div>
        </div>
    );
}
