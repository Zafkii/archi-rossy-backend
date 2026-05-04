const BASE_URL = "http://localhost:3000"

export async function login(username: string, password: string) {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) throw new Error("Login failed")

  return res.json()
}

export async function register(
  name: string,
  username: string,
  password: string,
) {
  const res = await fetch(`${BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, password }),
  })

  if (!res.ok) throw new Error("Register failed")

  return res.json()
}

export async function checkUsersExist() {
  const res = await fetch(`${BASE_URL}/users/exists`)
  return res.json()
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Request error")
  }

  return res.json()
}
