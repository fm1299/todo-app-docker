"use client"

import { useState } from "react"
import { createTodo } from "../api"

export default function TodoForm({ token, onCreated }) {
    const [title, setTitle] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)
        try {
            await createTodo(token, title, "")
            setTitle("")
            onCreated()
        } catch (error) {
            console.error("Failed to create todo:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-3">
            <input
                type="text"
                placeholder="What needs to be done?"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
            />
            <button
                type="submit"
                disabled={loading || !title.trim()}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Adding..." : "Add Task"}
            </button>
        </form>
    )
}
