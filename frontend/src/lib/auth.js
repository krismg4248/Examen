import { writable, derived } from 'svelte/store'

const TOKEN_KEY = 'torque_token'
const USER_KEY = 'torque_user'

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const token = writable(localStorage.getItem(TOKEN_KEY) || '')
export const user = writable(loadUser())

export const isAuthenticated = derived(token, ($token) => Boolean($token))

export function setSession(accessToken, usuario) {
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(USER_KEY, JSON.stringify(usuario))
  token.set(accessToken)
  user.set(usuario)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  token.set('')
  user.set(null)
}
