"use client";

import { setCookie } from "cookies-next";
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
import { Input } from "../ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "../ui/phone-input";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { registerCustomer } from "@/lib/api/customers";
import { useParams } from "next/navigation";
import { userWithSite } from "@/lib/api/users";
import { handleToast } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const RegisterDialog = ({ children, className }: Props) => {
  const { login } = useAuth();
  const params = useParams();
  const site =
    typeof params.site === "string"
      ? params.site
      : Array.isArray(params.site)
        ? params.site[0]
        : "";

  const [id, setId] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(""); // ✅ STRING

  useEffect(() => {
    async function getUserData() {
      if (!site) return;

      const user = await userWithSite(site as string);
      setId(user.id);
    }
    getUserData();
  }, [site]);


  const handlePrevCloseBtn = () => {
    if (step <= 1) {
      setIsOpen(false);
      setStep(1);
    } else {
      setStep((current) => current - 1);
    }
  };

  const handleBtnOnClick = () => {
    if (step === 1) {
      if (!name) return toast.error("You must provide a name");
      if (!phone) return toast.error("You must provide a phone number");
      if (!isPossiblePhoneNumber(phone))
        return toast.error("You must provide a valid phone number");

      // 🔥 Skip real OTP sending (dummy mode)
      setStep(2);
    }

    if (step === 2) {
      // ✅ ONLY VALID OTP
      if (otp !== "111111") {
        return toast.error("You entered an incorrect otp code");
      }
      setStep(3);
    }

    if (step === 3) {
      if (!password) return toast.error("You must provide a password");
      handleRegister();
    }
  };
  const handleRegister = async () => {
    try {
      if (!site) {
        toast.error("Site missing");
        return;
      }

      const payload = {
        name,
        email,
        phone,
        password,
        slug: site,
      };

      console.log("🚀 REGISTER PAYLOAD:", payload);

      const result = await registerCustomer(payload);

      console.log("🚀 REGISTER RESPONSE:", result);

      handleToast(result);

      if (!result.success) return;

      // ❌ REMOVE THESE (they don't exist yet)
      // login(result.customer);
      // setCookie("token", result.token);

      // reset
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setOtp("");
      setStep(1);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Registration failed");
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={className}>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign Up</DialogTitle>
          <DialogDescription>
            Create an account to save your appointment history.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {(step === 1 || step === 3) && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Name *</Label>
                <Input
                  className="col-span-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Phone *</Label>
                <div className="col-span-3">
                  <PhoneInput
                    value={phone}
                    onChange={(value: string) => setPhone(value)}
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Email</Label>
                <Input
                  className="col-span-3"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Password *</Label>
                <Input
                  type="password"
                  className="col-span-3"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>OTP</Label>
              <div className="col-span-3">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                >
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <p className="text-xs text-gray-500 mt-1">
                  Use <b>111111</b> (demo)
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handlePrevCloseBtn}>
            {step <= 1 ? "Close" : "Previous"}
          </Button>
          <Button onClick={handleBtnOnClick}>
            {step === 1 ? "Continue" : step === 2 ? "Verify" : "Sign Up"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;
