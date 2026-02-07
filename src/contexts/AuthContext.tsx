"use client";

import { Customer } from "@/types";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { currentCustomer, logoutCustomer } from "@/lib/api/customers";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface AuthContextType {
  user: Customer | null;
  loading: boolean;
  login: (userData: Customer | null) => void;
logout: (slug: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const [user, setUser] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD USER FROM TOKEN
  ========================= */
useEffect(() => {
  async function getCustomer() {
    console.log("🔄 AuthProvider mounted → checking token");

    try {
const site = window.location.pathname.split("/")[1];
const res = await currentCustomer(site);


  if (res && res.customer_id) {
  setUser(res);
} else {
  console.warn("❌ No user from token");
  setUser(null);
}

    } catch (err) {
      console.error("🔥 token.php error:", err);
      setUser(null);
    } finally {
      setLoading(false);
      console.log("⏹ Auth check finished");
    }
  }

  getCustomer();
}, []);

  /* =========================
     LOGIN (OPTIONAL USE)
  ========================= */
  const login = (userData: Customer | null) => {
    setUser(userData);
  };

  /* =========================
     LOGOUT
  ========================= */
const logout = async (slug: string) => {
  try {
    await logoutCustomer(slug); // ✅ always string now
  } catch {}

  deleteCookie("customer_token", { path: "/" });
  deleteCookie("PHPSESSID", { path: "/" });

  setUser(null);

  if (slug) {
    router.push(`/${slug}`);
  } else {
    router.push("/");
  }
};


  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
