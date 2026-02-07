import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { uploadsUrl } from "@/config";
import { PaymentMethodProps } from "@/types";
import Image from "next/image";
import React, { useId } from "react";

const PaymentMethod = ({
  icon,
  heading,
  color,
  value,
  setPaymentMethod,
}: PaymentMethodProps) => {
  const id = useId();

  let bg_50 = "";
  let fill_500 = "";
  let text_500 = "";
  let border_500 = "";

  if (color === "green") {
    bg_50 = "bg-green-50";
    fill_500 = "[&_Circle]:fill-green-500";
    text_500 = "[&_Circle]:text-green-500";
    border_500 = "border-green-500";
  } else if (color === "red") {
    bg_50 = "bg-red-50";
    fill_500 = "[&_Circle]:fill-red-500";
    text_500 = "[&_Circle]:text-red-500";
    border_500 = "border-red-500";
  } else if (color === "indigo") {
    bg_50 = "bg-indigo-50";
    fill_500 = "[&_Circle]:fill-indigo-500";
    text_500 = "[&_Circle]:text-indigo-500";
    border_500 = "border-indigo-500";
  } else if (color === "blue") {
    bg_50 = "bg-blue-50";
    fill_500 = "[&_Circle]:fill-blue-500";
    text_500 = "[&_Circle]:text-blue-500";
    border_500 = "border-blue-500";
  } else if (color === "purple") {
    bg_50 = "bg-purple-50";
    fill_500 = "[&_Circle]:fill-purple-500";
    text_500 = "[&_Circle]:text-purple-500";
    border_500 = "border-purple-500";
  } else if (color === "lime") {
    bg_50 = "bg-lime-50";
    fill_500 = "[&_Circle]:fill-lime-500";
    text_500 = "[&_Circle]:text-lime-500";
    border_500 = "border-lime-500";
  }

  return (
    <Label
      htmlFor={id}
      className={`${bg_50} p-2 rounded-md flex items-center justify-between`}
    >
      <div className="flex items-center gap-3.5">
        <div className="bg-white rounded-md w-14 h-14 flex items-center justify-center">
          <Image src={uploadsUrl + icon} alt="" width={32} height={32} />
        </div>

        <p className="font-semibold">{heading}</p>
      </div>

      <div>
        <RadioGroupItem
          id={id}
          value={value}
          className={`${fill_500} ${text_500} ${border_500}`}
          onClick={() => setPaymentMethod && setPaymentMethod(value)}
        />
      </div>
    </Label>
  );
};

export default PaymentMethod;
