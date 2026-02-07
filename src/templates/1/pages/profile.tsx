"use client";

import { Label } from "@/components/ui/label";
import { Input } from "../components/ui/input";
import { useEffect, useState } from "react";
import PhoneInput from "../components/ui/phone-input";
import { useAuth } from "@/contexts/AuthContext";
import FileInput from "../components/ui/file-input";
import { Button } from "../components/ui/button";
import { updateCustomer } from "@/lib/api/customers";
import { handleToast } from "@/lib/utils";

export default function Profile() {
  const { user, login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState(""); // 👈 this drives preview

  // 🔥 THIS is what restores image after refresh
useEffect(() => {
  if (user) {
    console.log("🔥 USER OBJECT:", user);
    console.log("🖼 Backend user.photo:", user.photo);

    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setPhoto(user.photo || "");
  }
}, [user]);


  const handleSave = async () => {
    if (!user?.customer_id) {
      handleToast({ success: false, message: "Missing customer ID" });
      return;
    }

    const result = await updateCustomer({
      customer_id: user.customer_id,
      data: {
        name,
        email,
        phone,
        photo, // ✅ already uploaded path
      },
    });

    handleToast(result);

    if (result.success && result.customer) {
      login(result.customer); // 🔥 updates AuthContext.user.photo
    }
  };

  return (
    <div className="w-full bg-gray-100 rounded-lg p-6 grid gap-6">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="grid gap-2">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="grid gap-2">
          <Label>Phone</Label>
          <PhoneInput value={phone} onChange={setPhone} />
        </div>
      </div>

      {/* 👇 photo is passed DOWN */}
      <div className="grid gap-2">
        <Label>Photo</Label>
        <FileInput fileName={photo} setFileName={setPhoto} />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
