"use client";
import React, { useEffect, useState } from "react";
import {
  AvailableArea,
  BookingStep2Props,
  InputField,
  SelectOption,
} from "@/types";
import FormInputs from "../../form-inputs";
import { getAllAvailableAreas } from "@/lib/api/available-areas";
import { useParams } from "next/navigation";
import getSymbolFromCurrency from "currency-symbol-map";

interface Form {
  [key: string]: InputField;
}

const Step2 = ({
  name,
  phone,
  email,
  selectedArea,
  postalCode,
  address,
  remark,
}: BookingStep2Props) => {
  const { site } = useParams();

  const [areaOptions, setAreaOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const getAreas = async () => {
      try {
        const data = await getAllAvailableAreas(site as string, { limit: 100 });

        setAreaOptions([]);
        data.records.map((item: AvailableArea) => {
          setAreaOptions((current) => [
            ...current,
            {
              label: item.area,
              value: item.area + "|" + item.charges,
            },
          ]);
        });
      } catch (error) {
        setAreaOptions([]);
      }
    };
    getAreas();
  }, [site]);

  const formData: Form = {
    name: {
      type: "text",
      value: name.value,
      setValue: name.setValue,
      placeholder: "Name",
      label: "Name",
      containerClassName: "md:col-span-6",
      required: true,
    },
    mobile: {
      type: "phone",
      value: phone.value,
      placeholder: "94XXXXXXXX",
      label: "Mobile Number",
      setValue: phone.setValue,
      containerClassName: "md:col-span-6",
      required: true,
    },
    email: {
      type: "email",
      value: email.value,
      setValue: email.setValue,
      placeholder: "Email Address",
      label: "Email Address",
      containerClassName: "md:col-span-6",
    },
    area: {
      type: "select",
      value: selectedArea.value,
      setValue: selectedArea.setValue,
      placeholder: "Select Area",
      label: "Area",
      options: areaOptions,
      containerClassName: "md:col-span-6",
      required: true,
    },
    postalCode: {
      type: "text",
      value: postalCode.value,
      setValue: postalCode.setValue,
      placeholder: "Postal Code",
      label: "Postal Code",
      containerClassName: "md:col-span-6",
      required: true,
    },
    address: {
      type: "textarea",
      value: address.value,
      setValue: address.setValue,
      placeholder: "Address",
      label: "Address",
      containerClassName: "md:col-span-6",
      required: true,
    },
    remark: {
      type: "textarea",
      value: remark.value,
      setValue: remark.setValue,
      placeholder: "Remark",
      label: "Remark",
      containerClassName: "md:col-span-6",
    },
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <FormInputs inputFields={formData} />
    </div>
  );
};

export default Step2;
