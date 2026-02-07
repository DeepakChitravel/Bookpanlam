"use client";
import { useState } from "react";
import { InputField } from "@/types";

import { Input } from "@/templates/1/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/templates/1/components/ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

interface Form {
  [key: string]: InputField;
}

const BookAppointment = () => {
  const [formData, setFormData] = useState<Form>({
    name: {
      type: "text",
      value: "",
      placeholder: "Name",
    },
    email: {
      type: "email",
      value: "",
      placeholder: "Email",
    },
    phone: {
      type: "text",
      value: "",
      placeholder: "Phone",
    },
    services: {
      type: "select",
      placeholder: "Service",
      options: [
        {
          label: "General Roofing",
          value: "General Roofing",
        },
      ],
      value: "",
    },
    message: {
      type: "textarea",
      value: "",
      placeholder: "Message",
    },
  });

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData({
      ...formData,
      [fieldName]: {
        ...formData[fieldName],
        value: value,
      },
    });
  };

  return (
    <form className="space-y-3">
      {Object.keys(formData).map((input, index: number) => {
        const field = formData[input];

        return field.type === "select" ? (
          <div key={index}>
            <Select
              onValueChange={(value) => {
                handleInputChange("services", value);
              }}
            >
              <SelectTrigger className="w-full bg-[#2E3030] border-[#2E3030] text-gray-300 h-14">
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent className="bg-[#2E3030] border-[#2E3030]">
                {field.options?.map((option) => (
                  <SelectItem
                    className="hover:bg-primary text-white"
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : field.type === "textarea" ? (
          <div key={index}>
            <Textarea
              placeholder={field.placeholder}
              value={field.value as string}
              onChange={(e) => {
                handleInputChange(input, e.target.value);
              }}
              className="bg-[#2E3030] border-[#2E3030] text-white placeholder:text-gray-300 min-h-28"
            />
          </div>
        ) : (
          <div key={index}>
            <Input
              type={field.type}
              placeholder={field.placeholder}
              value={field.value as string}
              onChange={(e) => {
                handleInputChange(input, e.target.value);
              }}
              className="bg-[#2E3030] border-[#2E3030] text-white placeholder:text-gray-300 h-14"
            />
          </div>
        );
      })}

      <Button className="w-full " size="lg">
        Book Appointment
      </Button>
    </form>
  );
};

export default BookAppointment;
