"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, User, Settings, ChevronDown, HelpCircle, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadsUrl } from "@/config";
import Image from "next/image";
type UserMenuProps = {
  slug: string;
};

export default function UserMenu({ slug }: UserMenuProps) {
  console.log("UserMenu slug:", slug);

  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const avatarLetter = user.name?.charAt(0)?.toUpperCase();

const handleLogout = async () => {
  await logout(slug);   // 🔥 PASS THE SLUG
  setOpen(false);
};



  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar with subtle animation */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm relative overflow-hidden ring-2 ring-white ring-offset-2 ring-offset-gray-50">
            {user.photo ? (
              <Image
                src={`${uploadsUrl}/${user.photo}`}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              avatarLetter
            )}
          </div>
          {/* Active indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>

        {/* Chevron with animation */}
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown with fade-in animation */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-xl rounded-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Section */}
          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold text-lg shadow-sm">
                {user.photo ? (
                  <Image
                    src={`${uploadsUrl}/${user.photo}`}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  avatarLetter
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                <p className="text-sm text-gray-600 truncate">{user.phone}</p>
                {user.email && (
                  <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                )}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Verified Account
              </div>
              <div className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Active
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              href={`/${slug}/profile`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors duration-150 group"
              onClick={() => setOpen(false)}
            >

              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-sm">My Profile</span>
                <p className="text-xs text-gray-500 mt-0.5">View and edit your profile</p>
              </div>
            </Link>

          </div>

          {/* Logout Section */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-50 to-red-50 hover:from-red-100 hover:to-red-100 text-red-600 font-medium rounded-lg transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span>Logout</span>
            </button>
            <p className="text-xs text-center text-gray-500 mt-3 px-2">
              Session expires in 24 hours
            </p>
          </div>
        </div>
      )}
    </div>
  );
}