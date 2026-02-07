import { formatNumber } from "@/lib/utils";
import { ServiceCard } from "@/types";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "@/link";
import Stars from "../Stars";

const Service = ({
  name,
  slug,
  img,
  location,
  price,
  currency,
}: ServiceCard) => {
  return (
    <div
      style={{ boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.08)" }}
      className="group overflow-hidden rounded-md"
    >
      <Link href={`/${slug}`}>
        <Image
          src={img}
          alt=""
          width={400}
          height={260}
          className="rounded-t-md h-[260px] w-full object-cover"
        />
      </Link>

      <div className="bg-white rounded-b-md p-5">
        <Link href={`/${slug}`} className="block font-bold text-xl mb-3">
          {name}
        </Link>

        <div className="flex items-center justify-between">
          <Stars />

          <Link
            href={`/${slug}/booking`}
            className="bg-primary text-white transition hover:bg-primary/80 py-2 px-3 text-sm rounded-md font-medium inline-block"
          >
            Book Now
          </Link>
        </div>

        <div className="border-t mt-4 pt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-lime-100 text-lime-500 border border-lime-200 w-8 h-8 rounded-full flex items-center justify-center">
              <MapPin width={20} height={20} />
            </div>
            <span className="block font-medium text-sm">
              {location || "Delhi, India"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="block text-lg font-bold text-orange-500">
              {currency + formatNumber(price.price)}
            </span>

            {price.mrp && (
              <span className="block text-sm text-gray-500 line-through">
                {currency + formatNumber(price.mrp)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Service;
