import { CalendarClock, Check, HandCoins, User } from "lucide-react";

interface Props {
  activeStep: number;
}

const steps = [
  {
    step: 1,
    title: "Date & Time",
    summary: "Select booking date and time",
    icon: <CalendarClock width={24} height={24} />,
  },
  {
    step: 2,
    title: "Personal Information",
    summary: "Enter contact and address",
    icon: <User width={24} height={24} />,
  },
  {
    step: 3,
    title: "Confirm Booking",
    summary: "Check the details once again",
    icon: <Check width={24} height={24} />,
  },
  {
    step: 4,
    title: "Payment",
    summary: "Make payment to booking",
    icon: <HandCoins width={24} height={24} />,
  },
];

const BookingStepper = ({ activeStep }: Props) => {
  return (
    <div className="w-full xl:block hidden">
      <ol className="flex items-center w-full">
        {steps.map((item, index, row) => {
          let after_bg_500 = "after:bg-gray-500";
          let border_500 = "border-gray-500";
          let bg_50 = "bg-gray-50";
          let bg_500 = "bg-gray-500";

          if (item.step <= activeStep) {
            item.step < activeStep
              ? (after_bg_500 = "after:bg-green-500")
              : after_bg_500;
            border_500 = "border-green-500";
            bg_50 = "bg-green-50";
            bg_500 = "bg-green-500";
          }

          return (
            <li
              key={index}
              className={
                index + 1 === row.length
                  ? ""
                  : `flex w-full relative after:content-[''] after:w-full after:h-0.5 ${after_bg_500} after:inline-block after:absolute after:top-[50%] after:-translate-y-[50%] after:left-4`
              }
            >
              <div>
                <div
                  className={`w-[270px] border ${
                    border_500 + " " + bg_50
                  } p-3.5 gap-3.5 rounded-xl flex items-center justify-center relative z-10`}
                >
                  <div
                    className={`w-12 h-12 ${bg_500} text-white rounded-lg flex items-center justify-center`}
                  >
                    {item.icon}
                  </div>

                  <div className="w-[calc(100%_-_62px)]">
                    <span className="block font-semibold">{item.title}</span>
                    <span className="block text-xs text-gray-500 mt-1">
                      {item.summary}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default BookingStepper;
