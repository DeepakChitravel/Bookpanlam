"use client";
import { formatNumber } from "@/lib/utils";
import { PaginationProps } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Pagination = ({ totalPages, totalRecords }: PaginationProps) => {
  const pathname = usePathname();
  const { replace } = useRouter();

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  let limit = searchParams.get("limit");
  !limit && (limit = "10");

  let page = searchParams.get("page");
  !page && (page = "1");

  // When click on next button
  const handleNext = () => {
    const nextPage = parseInt(page as string) + 1;

    params.set("page", nextPage.toString());
    replace(`${pathname}?${params.toString()}`);
  };

  // When click on prev button
  const handlePrev = () => {
    const prevPage = parseInt(page as string) - 1;

    params.set("page", prevPage.toString());
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-end gap-3.5 flex-col sm:flex-row">
      <div className="border border-input h-10 px-3 rounded-md flex items-center justify-center text-sm w-full sm:w-auto">
        <div>
          <span>
            {page && formatNumber(parseInt(page))} of {formatNumber(totalPages)}
          </span>
        </div>

        <div className="ml-3 pl-3 border-l h-full flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={page && parseInt(page) <= 1 ? true : false}
            className="disabled:text-black/40"
          >
            <ChevronLeft width={18} height={18} />
          </button>

          <button
            onClick={handleNext}
            disabled={page && parseInt(page) >= totalPages ? true : false}
            className="disabled:text-black/40"
          >
            <ChevronRight width={18} height={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
