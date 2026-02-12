// API client replacing Supabase
const API_URL = '/api';

const STORAGE_KEY_TOKEN = 'voxai_token';
const STORAGE_KEY_USER = 'voxai_user';

function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEY_TOKEN) || sessionStorage.getItem(STORAGE_KEY_TOKEN);
}

function setToken(token: string, remember: boolean = true) {
  if (remember) {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    sessionStorage.removeItem(STORAGE_KEY_TOKEN);
  } else {
    sessionStorage.setItem(STORAGE_KEY_TOKEN, token);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  }
}

function clearToken() {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  sessionStorage.removeItem(STORAGE_KEY_TOKEN);
}

function getUser() {
  const raw = localStorage.getItem(STORAGE_KEY_USER) || sessionStorage.getItem(STORAGE_KEY_USER);
  return raw ? JSON.parse(raw) : null;
}

function setUser(user: any, remember: boolean = true) {
  const str = JSON.stringify(user);
  if (remember) {
    localStorage.setItem(STORAGE_KEY_USER, str);
    sessionStorage.removeItem(STORAGE_KEY_USER);
  } else {
    sessionStorage.setItem(STORAGE_KEY_USER, str);
    localStorage.removeItem(STORAGE_KEY_USER);
  }
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEY_USER);
  sessionStorage.removeItem(STORAGE_KEY_USER);
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  try {
    const data = await res.json();
    if (!res.ok) {
      console.error('API Error:', res.status, data);
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    if (!res.ok) {
      // If we failed but couldn't parse JSON (e.g. 404 HTML page)
      throw new Error(`Request failed with status ${res.status}`);
    }
    console.error('Fetch Error:', err);
    throw err;
  }
}

// ---------- Auth ----------
export const auth = {
  async signUp(email: string, password: string, displayName?: string, remember: boolean = true) {
    const data = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    setToken(data.token, remember);
    setUser(data.user, remember);
    return data;
  },

  async signIn(email: string, password: string, remember: boolean = true) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token, remember);
    setUser(data.user, remember);
    return data;
  },

  async signOut() {
    clearToken();
    clearUser();
  },

  async getSession() {
    const token = getToken();
    if (!token) return { session: null };
    try {
      const data = await apiFetch('/auth/me');
      setUser(data.user);
      return { session: { user: data.user, token } };
    } catch {
      clearToken();
      clearUser();
      return { session: null };
    }
  },

  getToken,
  getUser,

  onAuthStateChange(callback: (event: string, session: any) => void) {
    // Check current auth state immediately
    const token = getToken();
    const user = getUser();
    if (token && user) {
      callback('SIGNED_IN', { user, token });
    }
    // Return a fake subscription object for compatibility
    return { data: { subscription: { unsubscribe: () => { } } } };
  },
};

// ---------- Voice Assistants ----------
export const assistants = {
  async list() {
    return apiFetch('/assistants');
  },

  async create(data: any) {
    return apiFetch('/assistants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any) {
    return apiFetch(`/assistants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async remove(id: string) {
    return apiFetch(`/assistants/${id}`, { method: 'DELETE' });
  },
};

// ---------- Voice Chat ----------
export const voiceChat = {
  async invoke(body: {
    userMessage: string;
    systemPrompt?: string;
    temperature?: number;
    conversationHistory?: any[];
  }) {
    return apiFetch('/voice-chat', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};

// Default export for easy import
const api = { auth, assistants, voiceChat };
export default api;