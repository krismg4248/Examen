const API_URL = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { message: text }
  }

  if (!res.ok) {
    const message =
      (Array.isArray(data?.message) ? data.message.join(', ') : data?.message) ||
      'No se pudo completar la solicitud'
    throw new Error(message)
  }

  return data
}

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register({ nombre, email, password }) {
  return request('/auth/registro', {
    method: 'POST',
    body: JSON.stringify({ nombre, email, password }),
  })
}

export function getMe(token) {
  return request('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function getPiezas(token) {
  return request('/piezas', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function createPieza(token, payload) {
  return request('/piezas', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}

export function updatePieza(token, id, payload) {
  return request(`/piezas/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}

export function getAutos(token) {
  return request('/autos', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function createAuto(token, payload) {
  return request('/autos', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}

export function updateAuto(token, id, payload) {
  return request(`/autos/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}
