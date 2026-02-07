"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadsUrl } from "@/config";
import { PROFILE_SIDEBAR_LINKS } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";
import SideLink from "./side-link";
import { useParams } from "next/navigation";


const Sidebar = () => {
  const { user, logout } = useAuth();
  const params = useParams();

  const slug =
    typeof params.site === "string"
      ? params.site
      : params.site?.[0] || "";

  return (
    <div className="w-full h-full bg-gray-100 rounded-lg p-5">
      <div>
        <Avatar className="w-16 h-16 mx-auto">
          <AvatarImage src={uploadsUrl + "/" + user?.photo} />
          <AvatarFallback className="bg-white text-xl">
            {getInitials(user?.name as string)}
          </AvatarFallback>
        </Avatar>

        <h3 className="text-center font-bold text-xl mt-2">{user?.name}</h3>
        <p className="text-center text-sm text-gray-500 mt-1.5">
          Customer ID:{" "}
          <span className="font-semibold text-red-500">{user?.customer_id}</span>
        </p>
      </div>

      <ul className="mt-5 pt-5 border-t grid gap-3">
        {PROFILE_SIDEBAR_LINKS.map((link) => (
          <li key={link.href}>
            <SideLink href={link.href}>{link.label}</SideLink>
          </li>
        ))}
        <li>
          <button
            onClick={() => logout(slug)}

            type="button"
            className="bg-red-100 text-red-500 w-full block px-4 py-3 rounded-lg font-medium text-sm transition text-left hover:bg-red-500 hover:text-white"
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
