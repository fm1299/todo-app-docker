const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  "http://localhost:30080";

export async function register(username, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw await res.json()
    return res.json()
}

export async function login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw await res.json()
    return res.json()
}

export async function fetchTodos(token) {
    const res = await fetch(`${API_BASE}/todos`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw await res.json()
    return res.json()
}

export async function createTodo(token, title, description) {
    const res = await fetch(`${API_BASE}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, description }),
    })
    if (!res.ok) throw await res.json()
    return res.json()
}

export async function toggleTodo(token, id) {
    const res = await fetch(`${API_BASE}/todos/${id}/toggle`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw await res.json()
    return res.json()
}
