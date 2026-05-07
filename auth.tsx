import { createContext, useContext, useEffect, useState } from "react";

export type Role = "admin" | "member";
export interface User {
  name: string;
  email: string;
  role: Role;
  token: string;
}

interface AuthCtx {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: Role, email: string, password: string, remember?: boolean) => Promise<User>;
  loginWithGoogle: (role: Role) => Promise<User>;
  signup: (role: Role, name: string, email: string, password: string) => Promise<User>;
  signupWithGoogle: (role: Role, googleEmail: string) => Promise<User>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "ethara_auth";
const SESSION_KEY = "ethara_auth_session";
const USERS_KEY = "ethara_users";

interface StoredUserRecord {
  name: string;
  email: string;
  role: Role;
  password: string;
}

function makeToken(payload: object) {
  const base = (s: string) => btoa(unescape(encodeURIComponent(s)));
  const header = base(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base(JSON.stringify({ ...payload, iat: Date.now() }));
  return `${header}.${body}.mock-signature`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (u: User | null, remember = true) => {
    setUser(u);
    if (u) {
      if (remember) {
        localStorage.setItem(KEY, JSON.stringify(u));
        sessionStorage.removeItem(SESSION_KEY);
      } else {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
        localStorage.removeItem(KEY);
      }
    } else {
      localStorage.removeItem(KEY);
      sessionStorage.removeItem(SESSION_KEY);
    }
  };

  const readUsers = (): StoredUserRecord[] => {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? (JSON.parse(raw) as StoredUserRecord[]) : [];
    } catch {
      return [];
    }
  };

  const writeUsers = (users: StoredUserRecord[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login: AuthCtx["login"] = async (role, email, password, remember = true) => {
    if (!email || !password) throw new Error("Email and password required");
    const users = readUsers();
    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role,
    );
    if (!existing) {
      throw new Error("No account found for this email and role. Please sign up first.");
    }
    if (existing.password !== password) {
      throw new Error("Invalid password.");
    }
    const u: User = {
      name: existing.name,
      email: existing.email,
      role: existing.role,
      token: makeToken({ email: existing.email, role: existing.role }),
    };
    persist(u, remember);
    return u;
  };

  const loginWithGoogle: AuthCtx["loginWithGoogle"] = async (role) => {
    const email = `google.${role}@ethara.ai`;
    const users = readUsers();
    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role,
    );
    if (!existing) {
      throw new Error("No Google-linked account found for this role. Use Google Sign up first.");
    }
    const u: User = {
      name: existing.name,
      email: existing.email,
      role: existing.role,
      token: makeToken({ email: existing.email, role: existing.role, provider: "google" }),
    };
    persist(u, true);
    return u;
  };

  const signup: AuthCtx["signup"] = async (role, name, email, password) => {
    if (!name || !email || !password) throw new Error("All fields required");
    const users = readUsers();
    const alreadyExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (alreadyExists) throw new Error("An account with this email already exists.");
    users.push({ role, name, email, password });
    writeUsers(users);
    const u: User = { name, email, role, token: makeToken({ email, role, name }) };
    persist(u, true);
    return u;
  };

  const signupWithGoogle: AuthCtx["signupWithGoogle"] = async (role, googleEmail) => {
    const email = googleEmail.trim().toLowerCase();
    if (!email.endsWith("@gmail.com")) {
      throw new Error("Please use a valid Google Gmail address.");
    }
    const users = readUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const record =
      existing ??
      ({
        role,
        name: email.split("@")[0],
        email,
        password: "google-oauth",
      } satisfies StoredUserRecord);
    if (!existing) {
      users.push(record);
      writeUsers(users);
    }
    const u: User = {
      name: record.name,
      email: record.email,
      role: record.role,
      token: makeToken({ email: record.email, role: record.role, provider: "google" }),
    };
    persist(u, true);
    return u;
  };

  const logout = () => persist(null);

  return (
    <Ctx.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        signup,
        signupWithGoogle,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
