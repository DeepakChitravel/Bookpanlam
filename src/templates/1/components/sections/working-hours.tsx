"use client";
import { PhoneCall } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import BookAppointment from "../forms/book-appointment";
import { WorkingHoursProps } from "@/types";
import { formatPhoneNumber } from "react-phone-number-input";

const WorkingHours = ({ workingHours, phone }: WorkingHoursProps) => {
  return (
    <section className="lg:py-20 py-8 lg:pb-40 pb-16 bg-gray-50">
      <div className="container">
        <h1 className="lg:text-5xl text-3xl sm:text-4xl font-bold text-center mb-12 lg:mb-20">
          Need any help? to hire us now!
        </h1>

        <div className="lg:flex relative z-10">
          <span className="absolute -top-10 -left-10 w-28 h-28 bg-indigo-500 rounded-full -z-10 blur-[4.5rem]"></span>
          <span className="absolute -bottom-10 -right-10 w-28 h-28 bg-orange-500 rounded-full -z-10 blur-[4.5rem]"></span>

          <div className="lg:w-[calc(100%_-_520px)] lg:flex">
            <div className="lg:w-2/5 lg:block hidden">
              <Image
                src="/templates/1/working-hours.jpg"
                alt=""
                width={500}
                height={500}
                className="min-h-[550px] h-full w-full object-cover shadow-[-7px_-7px] shadow-blue-500"
              />
            </div>

            <div className="lg:w-3/5 bg-white py-8 lg:px-12 px-8">
              <h3 className="text-2xl font-semibold mb-5 uppercase">
                Working Hours:
              </h3>

              <ul>
                {workingHours.map((hour) => (
                  <li
                    key={hour.day}
                    className="font-medium flex items-center justify-between border-b py-3"
                  >
                    <span>{hour.day}</span>
                    <span
                      className={
                        hour.time === "closed"
                          ? "text-red-500"
                          : "text-gray-500"
                      }
                    >
                      {hour.time}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-center gap-3 mt-10">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-red-500/20"></div>
                  <div className="bg-red-500 w-11 h-11 rounded-full absolute top-[50%] left-[50%] -translate-y-[50%] -translate-x-[50%] flex items-center justify-center text-white">
                    <PhoneCall width={20} height={20} />
                  </div>
                </div>

                <div>
                  <span className="block text-xs text-gray-500 uppercase">
                    Need Help?
                  </span>
                  <Link
                    href={`tel:${phone}`}
                    className="block font-medium mt-1"
                  >
                    {phone && formatPhoneNumber(phone)}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-[520px] bg-[#0A0A0A] border-l p-8 shadow-[7px_7px] shadow-green-500">
            <h3 className="text-2xl font-semibold mb-5 uppercase text-white">
              Book an Appointment
            </h3>

            <BookAppointment />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkingHours;
