"use client";

import { useState } from "react";
import { loginCustomer } from "@/lib/api/customers";
import { useRouter, useParams } from "next/navigation";
import { setCookie } from "cookies-next";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();

  const site = Array.isArray(params.site)
    ? params.site[0]
    : params.site;

  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!site) {
      setError("Invalid site");
      return;
    }

    // ✅ FORCE CORRECT PAYLOAD (NO TYPE INTERFERENCE)
    const payload = {
      phone: form.phone.trim(),
      password: form.password,
      slug: site,
    };

    console.log("📤 LOGIN PAYLOAD (FORCED):", payload);
    console.log("🔑 LOGIN KEYS:", Object.keys(payload));

    setLoading(true);

    try {
      const res = await loginCustomer(payload as any, site as string);

      console.log("📥 LOGIN RESPONSE:", res);

      if (!res?.success) {
        setError(res?.message || "Login failed");
        return;
      }




      toast.success(res.message || "Login successful");

      setTimeout(() => {
        router.push(`/${site}`);
      }, 800);
    } catch (err) {
      console.error("🔥 LOGIN ERROR:", err);
      setError("Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-5">Login</h1>

      {error && (
        <p className="text-red-500 mb-3 text-sm">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="tel"
          className="w-full border p-2"
          placeholder="Mobile number"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
          required
        />

        <input
          type="password"
          className="w-full border p-2"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
