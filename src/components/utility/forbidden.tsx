import { Lock } from "lucide-react";
import React from "react";
import { LoginDialog, RegisterDialog } from "..";

const Forbidden = () => {
  return (
    <div className="py-20">
      <div className="container">
        <div className="flex items-center justify-center flex-col">
          <Lock size={48} />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            403 Forbidden
          </h1>

          <p className="mt-4 text-muted-foreground">
            Oops, it looks like you dont&apos; have permission to access this
            page. Please login to your access
          </p>

          <div className="mt-6 flex items-center gap-3">
            <LoginDialog>Sign In</LoginDialog>
            <span>|</span>
            <RegisterDialog>Sign Up</RegisterDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
