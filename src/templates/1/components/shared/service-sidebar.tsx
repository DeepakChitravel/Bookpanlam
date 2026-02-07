import { calculateGST, formatNumber, getAvailableTime } from "@/lib/utils";
import { ServiceSidebarProps } from "@/types";
import { Album, PhoneCall } from "lucide-react";
import Link from "@/link";
import { formatPhoneNumber } from "react-phone-number-input";
import getSymbolFromCurrency from "currency-symbol-map";

const ServiceSidebar = ({ service }: ServiceSidebarProps) => {
  const siteSettings =
    service.user.siteSettings && service.user.siteSettings[0];

  const workingHours = [
    {
      day: "Monday",
      time: getAvailableTime(
        "monday",
        siteSettings?.monday as boolean,
        siteSettings?.mondayStarts as string,
        siteSettings?.mondayEnds as string
      ),
    },
    {
      day: "Tuesday",
      time: getAvailableTime(
        "tuesday",
        siteSettings?.tuesday as boolean,
        siteSettings?.tuesdayStarts as string,
        siteSettings?.tuesdayEnds as string
      ),
    },
    {
      day: "Wednesday",
      time: getAvailableTime(
        "wednesday",
        siteSettings?.wednesday as boolean,
        siteSettings?.wednesdayStarts as string,
        siteSettings?.wednesdayEnds as string
      ),
    },
    {
      day: "Thursday",
      time: getAvailableTime(
        "thursday",
        siteSettings?.thursday as boolean,
        siteSettings?.thursdayStarts as string,
        siteSettings?.thursdayEnds as string
      ),
    },
    {
      day: "Friday",
      time: getAvailableTime(
        "friday",
        siteSettings?.friday as boolean,
        siteSettings?.fridayStarts as string,
        siteSettings?.fridayEnds as string
      ),
    },
    {
      day: "Saturday",
      time: getAvailableTime(
        "saturday",
        siteSettings?.saturday as boolean,
        siteSettings?.saturdayStarts as string,
        siteSettings?.saturdayEnds as string
      ),
    },
    {
      day: "Sunday",
      time: getAvailableTime(
        "sunday",
        siteSettings?.sunday as boolean,
        siteSettings?.sundayStarts as string,
        siteSettings?.sundayEnds as string
      ),
    },
  ];

  const gstAmount = calculateGST(
    parseInt(service.amount),
    service.gstPercentage,
    siteSettings?.gstType === "inclusive" ? true : false
  ).totalAmount;

  return (
    <div className="space-y-5">
      <div className="border bg-transparent p-5 rounded-xl">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold">
            {getSymbolFromCurrency(siteSettings?.currency as string) +
              formatNumber(
                siteSettings?.gstNumber
                  ? parseInt(gstAmount)
                  : parseInt(service.amount)
              )}
          </span>
          <span className="line-through text-gray-500">
            {getSymbolFromCurrency(siteSettings?.currency as string) +
              formatNumber(parseInt(service.previousAmount))}
          </span>
        </div>

        {siteSettings?.gstNumber && service.gstPercentage && (
          <p className="mt-2 text-green-600">
            {siteSettings?.gstType} of all taxes
          </p>
        )}

        <div className="mt-10 space-y-3">
          <button className="w-full rounded-xl h-[47px] px-3 border border-[#25D366] text-[#25D366] fill-[#25D366] transition hover:bg-[#25D366] hover:text-white hover:fill-white font-medium flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              width={24}
              height={24}
            >
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
            </svg>
            WhatsApp
          </button>

          <Link
            href={`/${service.slug}/booking`}
            className="w-full rounded-xl h-[47px] px-3 border border-primary text-primary fill-primary transition hover:bg-primary hover:text-white hover:fill-white font-medium flex items-center justify-center gap-2"
          >
            <Album width={24} height={24} />
            Book Now
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 p-5 rounded-xl">
        <h3 className="text-3xl font-bold mb-5">Need Help?</h3>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-primary/20"></div>
            <div className="bg-primary w-9 h-9 rounded-full absolute top-[50%] left-[50%] -translate-y-[50%] -translate-x-[50%] flex items-center justify-center text-white">
              <PhoneCall width={18} height={18} />
            </div>
          </div>

          <div>
            <span className="block text-xs text-gray-500 uppercase">
              Call Us Today
            </span>
            <Link
              href="tel:+919363601020"
              className="block font-medium text-sm mt-0.5"
            >
              {formatPhoneNumber(siteSettings?.phone as string)}
            </Link>
          </div>
        </div>

        <ul className="mt-5">
          {workingHours?.map((hour) => (
            <li
              key={hour.day}
              className="font-medium flex items-center justify-between border-b py-3"
            >
              <span>{hour.day}</span>
              <span
                className={
                  hour.time === "closed" ? "text-red-500" : "text-gray-500"
                }
              >
                {hour.time}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ServiceSidebar;
