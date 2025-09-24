"use client"

import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import TodoForm from "../components/TodoForm"
import TodoItem from "../components/TodoItem"
import { fetchTodos, toggleTodo } from "../api"

export default function TodoPage({ token, onLogout }) {
    const [todos, setTodos] = useState([])
    const [loading, setLoading] = useState(true)

    async function loadTodos() {
        try {
            const data = await fetchTodos(token)
            setTodos(data)
        } catch (error) {
            console.error("Failed to load todos:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTodos()
    }, [])

    async function handleToggle(id) {
        try {
            await toggleTodo(token, id)
            loadTodos()
        } catch (error) {
            console.error("Failed to toggle todo:", error)
        }
    }

    const completedCount = todos.filter((t) => t.completed).length
    const totalCount = todos.length

    return (
        <div className="min-h-screen">
            <Navbar onLogout={onLogout} />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Your Tasks</h1>
                    <p className="text-gray-400">Stay organized and productive with your task management</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Add New Task</h2>
                            <TodoForm token={token} onCreated={loadTodos} />
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-white">Task List</h2>
                                <div className="text-sm text-gray-400">
                                    {completedCount} of {totalCount} completed
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-400">Loading tasks...</div>
                                </div>
                            ) : todos.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-2">No tasks yet</div>
                                    <div className="text-sm text-gray-500">Add your first task to get started</div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {todos.map((todo) => (
                                        <TodoItem key={todo.id} todo={todo} onToggle={() => handleToggle(todo.id)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Progress</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Completion</span>
                                        <span className="text-white font-medium">
                                            {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2">
                                        <div
                                            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : "0%",
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-500">{totalCount}</div>
                                        <div className="text-xs text-gray-400">Total</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">{completedCount}</div>
                                        <div className="text-xs text-gray-400">Done</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Active tasks</span>
                                    <span className="text-white font-medium">{totalCount - completedCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Completed today</span>
                                    <span className="text-white font-medium">{completedCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
