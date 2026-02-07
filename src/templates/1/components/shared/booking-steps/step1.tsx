"use client";
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BookingStep1Props } from "@/types";
import { getDayOfWeek } from "@/lib/utils";
import { getExistingTimes } from "@/lib/api/appointments";

const Step1 = (props: BookingStep1Props) => {
  let { serviceId, siteSettings, intervalType, timeSlotInterval } = props;

  const disabledDays: { daysOfWeek: number[] } = { daysOfWeek: [] };

  if (siteSettings) {
    for (const [day, enabled] of Object.entries(siteSettings)) {
      if (typeof enabled === "boolean") {
        if (!enabled) {
          disabledDays.daysOfWeek.push(
            [
              "sunday",
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
            ].indexOf(day)
          );
        }
      }
    }
  }

  const date = props.date.value;
  const setDate = props.date.setValue;
  const time = props.time.value;
  const setTime = props.time.setValue;

  const [times, setTimes] = useState<string[]>([]);
  const [existingTimes, setExistingTimes] = useState<string[]>([]);

  useEffect(() => {
    async function getTimes() {
      setTimes([]);

      let startTime;
      let endTime;

      const starts =
        siteSettings[getDayOfWeek(date as Date).toLowerCase() + "Starts"];
      const ends =
        siteSettings[getDayOfWeek(date as Date).toLowerCase() + "Ends"];

      if (starts && ends) {
        startTime = new Date("2024-05-19T" + starts);
        endTime = new Date("2024-05-19T" + ends);
      } else {
        // Default to a 24-hour range
        startTime = new Date("2024-05-19T00:00:00");
        endTime = new Date("2024-05-19T23:59:59");
      }

      let currentTime = startTime;
      while (currentTime <= endTime) {
        const endTimeRange = new Date(currentTime);
        intervalType === "hours"
          ? endTimeRange.setHours(
              endTimeRange.getHours() + parseInt(timeSlotInterval)
            )
          : endTimeRange.setMinutes(
              endTimeRange.getMinutes() + parseInt(timeSlotInterval)
            );
        const timeRange = `${currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${endTimeRange.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
        setTimes((prev) => [...prev, timeRange]);
        intervalType === "hours"
          ? currentTime.setHours(
              currentTime.getHours() + parseInt(timeSlotInterval)
            )
          : currentTime.setMinutes(
              currentTime.getMinutes() + parseInt(timeSlotInterval)
            );
      }
    }

    async function getExistingTime() {
      try {
        const response = await getExistingTimes({
          serviceId,
          date: date as Date,
        });

        setExistingTimes(response.data);
      } catch (error) {}
    }

    date && getTimes();
    date && getExistingTime();
  }, [date, intervalType, siteSettings, timeSlotInterval, serviceId]);

  const handleDaySelect = (value: Date | undefined) => {
    setTimes([]);
    setDate && setDate(value);
  };

  const handleTimeSelect = (value: string) => {
    setTime && setTime(value);
  };

  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));

  return (
    <div className="grid xl:grid-cols-2 gap-10 bg-gray-50 p-4 rounded-md">
      <div>
        <Calendar
          mode="single"
          disabled={(date) =>
            date < yesterday || disabledDays.daysOfWeek.includes(date.getDay())
          }
          selected={date}
          onSelect={(value) => {
            handleDaySelect(value);
          }}
          className="rounded-md bg-white
          [&_th]:w-full [&_td]:w-full [&_td>button]:w-full [&_td>button]:rounded-none [&_th]:rounded-none [&_th]:border-r [&_td]:border-r [&_th]:border-b [&_td]:border-b [&_tr]:m-0 [&_table]:border-l [&_table]:border-t [&_th]:h-11 [&_th]:flex [&_th]:justify-center [&_th]:items-center [&_.h-9]:h-11"
        />
      </div>

      <div>
        <RadioGroup className="grid md:grid-cols-3 sm:grid-cols-2 gap-5">
          {times.map((item, index: number) => (
            <Label
              htmlFor={"time:" + index}
              key={index}
              className={`bg-white shadow rounded-md p-4 flex items-center gap-2 cursor-pointer ${
                existingTimes.find((i) => i === item)
                  ? "opacity-90 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => {
                !existingTimes.find((i) => i === item) &&
                  handleTimeSelect(item);
              }}
            >
              <RadioGroupItem
                value={item}
                id={"time:" + index}
                checked={time === item}
                disabled={existingTimes.find((i) => i === item) ? true : false}
              />
              <span>{item}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};

export default Step1;
