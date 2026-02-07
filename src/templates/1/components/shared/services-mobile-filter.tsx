"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Hamburger from "hamburger-react";
import { useState } from "react";
import ServicesSidebar from "./services-sidebar";
import { ServicesSidebarProps } from "@/types";

const ServicesMobileFilter = ({ categories }: ServicesSidebarProps) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(value) => {
        setOpen(value);
      }}
    >
      <SheetTrigger className="lg:hidden block">
        <div className="bg-gray-100 rounded-md w-12 h-12 flex items-center justify-center">
          <Hamburger toggled={isOpen} toggle={setOpen} size={24} />
        </div>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="text-left">Filter</SheetTitle>
        </SheetHeader>
        <div className="mt-5">
          <ServicesSidebar categories={categories} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ServicesMobileFilter;
