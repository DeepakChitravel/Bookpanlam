import Link from "@/link";
import { SideLink as SideLinkProps } from "@/types";
import { usePathname } from "next/navigation";

const SideLink = ({ href, children }: SideLinkProps) => {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={`${
        pathname.includes(href) ? "bg-primary text-white" : "bg-gray-200"
      } w-full block px-4 py-3 rounded-lg font-medium text-sm transition hover:bg-primary hover:text-white`}
    >
      {children}
    </Link>
  );
};

export default SideLink;
