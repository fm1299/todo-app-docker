"use client"

export default function TodoItem({ todo, onToggle }) {
    return (
        <div className="flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800/70 transition-colors group">
            <label className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="relative">
                    <input type="checkbox" checked={todo.completed} onChange={onToggle} className="sr-only" />
                    <div
                        className={`w-5 h-5 rounded border-2 transition-all ${todo.completed ? "bg-orange-600 border-orange-600" : "border-gray-600 group-hover:border-orange-500/50"
                            }`}
                    >
                        {todo.completed && (
                            <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                    </div>
                </div>
                <span className={`text-sm transition-all ${todo.completed ? "line-through text-gray-500" : "text-white"}`}>
                    {todo.title}
                </span>
            </label>
        </div>
    )
}
