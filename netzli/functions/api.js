export default {
  async handler(event) {
    const url = new URL(event.request.url)
    const path = url.pathname
    const method = event.request.method
    console.log(`[API] ${method} ${path}`)
    if (path === '/auth/login' && method === 'POST') return handleLogin(event)
    if (path === '/auth/register' && method === 'POST') return handleRegister(event)
    if (path === '/admin/users' && method === 'GET') return handleGetUsers(event)
    if (path.match(/\/admin\/users\/\d+$/) && method === 'DELETE') return handleDeleteUser(event, path)
    if (path === '/admin/actions' && method === 'GET') return handleGetActions(event)
    if (path === '/analyze' && method === 'POST') return handleAnalyze(event)
    console.log(`[API] 404 Not Found: ${path}`)
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
  }
}

const JWT_SECRET = 'smart-pantry-jwt-secret-key-change-in-production'

function createToken(user) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ sub: user.id, username: user.username, email: user.email, role: user.role || 'user', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 }))
  const signature = btoa(header + '.' + payload + '.secret')
  return [header, payload, signature].join('.')
}

function decodeToken(token) {
  try {
    const parts = token.split('.')
    if (parts.length >= 2) { return JSON.parse(atob(parts[1])) }
    return JSON.parse(atob(token))
  } catch { return null }
}

function logStatus(label, status) {
  console.log(`[API] ${label}: ${status}`)
}

async function handleLogin(event) {
  const body = await event.request.json()
  const { email, password } = body
  console.log('[API] Login attempt for:', email)
  if (!email || !password) { logStatus('Login 400', 400); return json({ message: 'Email and password required' }, 400) }

  const users = getUsers()
  let user = users.find(u => u.email === email)
  if (!user) {
    console.log('[API] User not found, creating:', email)
    user = { id: users.length + 1, username: email.split('@')[0], email, password_hash: password, role: 'user', dietary_preferences: '', created_at: new Date().toISOString() }
    users.push(user); saveUsers(users)
  }

  logAction(user.id, user.username, 'login', `User logged in from ${email}`)
  logStatus('Login 200', 200)
  const token = createToken(user)
  return json({ user: { id: user.id, username: user.username, email: user.email, role: user.role }, token })
}

async function handleRegister(event) {
  const body = await event.request.json()
  const { username, email, password, dietary_preferences } = body
  console.log('[API] Register attempt for:', username, email)
  if (!username || !email || !password) { logStatus('Register 400', 400); return json({ message: 'Username, email, and password required' }, 400) }

  const users = getUsers()
  if (users.find(u => u.email === email)) { logStatus('Register 409', 409); return json({ message: 'Email already registered' }, 409) }

  const user = { id: users.length + 1, username, email, password_hash: password, role: 'user', dietary_preferences: dietary_preferences || '', created_at: new Date().toISOString() }
  users.push(user); saveUsers(users)
  logAction(user.id, user.username, 'register', `New user registered: ${username}`)
  logStatus('Register 200', 200)
  const token = createToken(user)
  return json({ user: { id: user.id, username: user.username, email: user.email, role: user.role }, token })
}

async function handleGetUsers(event) {
  const token = event.request.headers.get('Authorization')?.replace('Bearer ', '')
  const decoded = decodeToken(token)
  if (!decoded || decoded.role !== 'admin') { logStatus('Admin users 403', 403); return json({ error: 'Unauthorized' }, 403) }
  logStatus('Admin users 200', 200)
  return json({ users: getUsers().map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role, dietary_preferences: u.dietary_preferences, created_at: u.created_at })) })
}

async function handleDeleteUser(event, path) {
  const token = event.request.headers.get('Authorization')?.replace('Bearer ', '')
  const decoded = decodeToken(token)
  if (!decoded || decoded.role !== 'admin') { logStatus('Delete user 403', 403); return json({ error: 'Unauthorized' }, 403) }
  const id = parseInt(path.split('/').pop())
  let users = getUsers()
  users = users.filter(u => u.id !== id)
  saveUsers(users)
  logAction(decoded.sub, decoded.username, 'delete_user', `Deleted user #${id}`)
  logStatus('Delete user 200', 200)
  return json({ success: true })
}

async function handleGetActions(event) {
  const token = event.request.headers.get('Authorization')?.replace('Bearer ', '')
  const decoded = decodeToken(token)
  if (!decoded) { logStatus('Admin actions 403', 403); return json({ error: 'Unauthorized' }, 403) }
  logStatus('Admin actions 200', 200)
  return json({ actions: getActions() })
}

async function handleAnalyze(event) {
  const body = await event.request.json()
  const { ingredients } = body
  const token = event.request.headers.get('Authorization')?.replace('Bearer ', '')
  const decoded = decodeToken(token)
  if (!decoded) { logStatus('Analyze 403', 403); return json({ error: 'Unauthorized' }, 403) }
  console.log('[API] Analyze ingredients:', ingredients)
  logStatus('Analyze 200', 200)
  return json({ ingredients, message: 'Ingredients detected successfully' })
}

function getUsers() { try { return JSON.parse(localStorage.getItem('users') || '[]') } catch { return [] } }
function saveUsers(users) { localStorage.setItem('users', JSON.stringify(users)) }
function getActions() { try { return JSON.parse(localStorage.getItem('actions') || '[]') } catch { return [] } }
function logAction(userId, username, actionType, details) {
  const actions = getActions()
  actions.push({ id: actions.length + 1, user_id: userId, username, action_type: actionType, action_details: details, ip_address: '127.0.0.1', created_at: new Date().toISOString() })
  localStorage.setItem('actions', JSON.stringify(actions))
}
function json(data, status = 200) { console.log(`[API] Response ${status}:`, JSON.stringify(data).substring(0, 200)); return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }) }
