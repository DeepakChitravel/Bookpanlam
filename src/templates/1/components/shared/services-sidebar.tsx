"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { ServicesSidebarProps } from "@/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ServicesSidebar = ({ categories }: ServicesSidebarProps) => {
  const pathname = usePathname();
  const { replace } = useRouter();

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  return (
    <div className="space-y-5">
      <div className="py-4 bg-gray-50">
        <div className="border-b pb-4 mb-4 px-4 flex items-center justify-between text-gray-600">
          <h5 className="font-bold text-lg">Categories</h5>
          <ChevronDown />
        </div>

        <ul className="px-4 space-y-4">
          {categories?.map((item, index: number) => (
            <li key={index} className="flex items-center gap-3">
              <Checkbox
                id={`category:${index}`}
                className="rounded-[2px] border-2 w-[18px] h-[18px]"
                onCheckedChange={(isChecked) => {
                  if (isChecked) {
                    params.set("category", item.id.toString());
                    replace(`${pathname}?${params.toString()}`);
                  } else {
                    params.delete("category");
                    replace(`${pathname}?${params.toString()}`);
                  }
                }}
                checked={
                  params.get("category") === item.id.toString() ? true : false
                }
              />
              <label htmlFor={`category:${index}`}>{item.name}</label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ServicesSidebar;
