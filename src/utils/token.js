export function createDemoToken(user) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ sub: user.id, username: user.username, email: user.email, role: user.role || 'user', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 }))
  const signature = btoa(header + '.' + payload + '.demo-secret')
  return [header, payload, signature].join('.')
}

export function decodeTokenAny(token) {
  try {
    const parts = token.split('.')
    if (parts.length >= 2) {
      const payload = atob(parts[1])
      return JSON.parse(payload)
    }
    return JSON.parse(atob(token))
  } catch {
    try {
      return JSON.parse(token)
    } catch {
      return null
    }
  }
}
