import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { NavLink } from "@/types";
import Hamburger from "hamburger-react";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MobileMenu = ({ navLinks }: { navLinks: NavLink[] }) => {
  let pathname = usePathname();
  const { site } = useParams();
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(value) => {
        setOpen(value);
      }}
    >
      <SheetTrigger className="lg:hidden block">
        <Hamburger toggled={isOpen} toggle={setOpen} />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>

        <ul className="mt-5 space-y-3">
          {navLinks?.map((item, index) => {
            let link = "/" + site;
            if (item.link !== "/") link += item.link;

            return (
              <li key={index}>
                <Link
                  href={item.link}
                  className={`bg-muted block w-full p-3 rounded-md text-left font-medium ${
                    pathname === link && "bg-primary text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
