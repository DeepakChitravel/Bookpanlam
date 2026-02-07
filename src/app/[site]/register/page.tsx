"use client";

import { useState } from "react";
import { verifyOtp } from "@/lib/api/customers";
import { useRouter, useParams } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();

  const site = params?.site as string;

  // ✅ Hooks MUST be before any return
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
  });

  const [error, setError] = useState("");

  // ✅ Now safe to early return
  if (!site) {
    console.error("❌ SITE SLUG MISSING");
    return <p>Invalid site URL</p>;
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await verifyOtp({
      ...form,
      slug: site,
    });

    if (!res.success) {
      setError(res.message);
      return;
    }

    router.push(`/${site}/login`);
  };

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-5">Create an Account</h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Full Name"
          className="w-full border p-2"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          placeholder="Email"
          className="w-full border p-2"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Phone"
          className="w-full border p-2"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <input
          placeholder="OTP (use 111111)"
          className="w-full border p-2"
          value={form.otp}
          onChange={(e) => setForm({ ...form, otp: e.target.value })}
          required
        />

        <button className="w-full bg-blue-600 text-white p-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}
