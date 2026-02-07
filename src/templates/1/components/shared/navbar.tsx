"use client";
import Link from "@/link";
import NextLink from "next/link";
import { useParams, usePathname } from "next/navigation";
import { PhoneCall, ChevronRight, User } from "lucide-react";
import { Button } from "../ui/button";
import MobileMenu from "./mobile-menu";
import { NavbarProps } from "@/types";
import { formatPhoneNumber } from "react-phone-number-input";
import { uploadsUrl } from "@/config";
import Logo from "@/components/logo";
import LoginDialog from "../dialogs/login";
import RegisterDialog from "../dialogs/register";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "./../../../../components/navbar/user-menu";




const Navbar = ({
  topbarInformations,
  phone,
  logo,
  siteName,
  navLinks,
}: NavbarProps) => {
  const pathname = usePathname();
  const { site } = useParams();

  const { user, loading } = useAuth();

  return (
    <>
      {/* Topbar */}
<div className="bg-secondary text-white py-5 fixed top-0 left-0 w-full z-50">
        <div className="container">
          <div className="flex items-center justify-between flex-wrap gap-5">
            {/* Left */}
            <ul className="flex items-center flex-wrap lg:divide-x divide-gray-600 lg:[&_li]:px-4 gap-3">
              {topbarInformations?.map(
                (item, index) =>
                  item.label && (
                    <li className="flex gap-2 text-sm" key={index}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="flex items-center gap-2"
                        >
                          <span className="text-primary [&_svg]:w-[19px] [&_svg]:h-[19px]">
                            {item.icon}
                          </span>
                          {item.label}
                        </Link>
                      ) : (
                        <>
                          <span className="text-primary [&_svg]:w-[19px] [&_svg]:h-[19px]">
                            {item.icon}
                          </span>
                          {item.label}
                        </>
                      )}
                    </li>
                  )
              )}
            </ul>

            {/* Right */}
            <div className="flex items-center gap-3 text-sm">
              {loading ? (
                // ⏳ During refresh → DO NOT show Sign In / Sign Up
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              ) : user ? (
                // ✅ Logged in
               <UserMenu slug={Array.isArray(site) ? site[0] : site} />
              ) : (
                // ❌ Not logged in
                <>
                  <LoginDialog className="flex items-center gap-2">
                    <User size={22} />
                    <span>Sign In</span>
                  </LoginDialog>

                  <span>/</span>

                  <RegisterDialog className="flex items-center gap-2">
                    <span>Sign Up</span>
                  </RegisterDialog>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
