"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import { loginCustomer } from "@/lib/api/customers";
import { Input } from "../ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "../ui/phone-input";
import { toast } from "sonner";
import { handleToast } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { setCookie } from "cookies-next";
import { useParams } from "next/navigation";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const LoginDialog = ({ children, className }: Props) => {
  const params = useParams();
  const slug = params.site as string;   // ⭐ CORRECT slug here

  const { login } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

const handleLogin = async () => {
  if (!user) return toast.error("You must enter a phone number");
  if (!password) return toast.error("You must enter a password");

  try {
    const result = await loginCustomer(
      { phone: user.trim(), password },  // ⭐ CORRECT KEY NAME
      slug
    );

    if (result?.success) {
      login(result.customer);

      setCookie("customer_token", result.token, { path: "/" });

      setUser("");
      setPassword("");
      setIsOpen(false);

      toast.success("Login successful");
    } else {
      toast.error(result.message || "Login failed");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  }
};



  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={className}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Access your account to save your appointment history.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone">Phone</Label>
            <div className="col-span-3">
              <PhoneInput
                id="phone"
                placeholder="+91XXXXXXXXXX"
                onChange={setUser}
                value={user}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              placeholder="********"
              className="col-span-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" onClick={handleLogin}>
            Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
