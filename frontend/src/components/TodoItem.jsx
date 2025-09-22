import React from "react";

export default function TodoItem({ todo, onToggle }) {
    return (
        <li className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={todo.completed} onChange={onToggle} />
                <span className={todo.completed ? "line-through text-gray-400" : ""}>
                    {todo.title}
                </span>
            </label>
        </li>
    );
}
