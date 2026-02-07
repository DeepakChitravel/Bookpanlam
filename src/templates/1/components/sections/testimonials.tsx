"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { TestimonialUserProps } from "@/types";
import { useState } from "react";
import Stars from "../Stars";

function User({ name, title, img, className, onClick }: TestimonialUserProps) {
  return (
    <div
      className={
        className +
        " rounded-xl p-5 flex items-center gap-6 cursor-pointer transition"
      }
      onClick={onClick}
    >
      <Avatar className="w-12 h-12">
        <AvatarImage src={img} />
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>

      <div>
        <h4 className="font-medium">{name}</h4>
        <p className="text-gray-500 text-sm mt-1">{title}</p>
      </div>
    </div>
  );
}

const Testimonials = () => {
  const testimonials = [
    {
      title: "It was a great experience",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam aperiam alias vitae repellat nisi repudiandae eius voluptate, iusto debitis necessitatibus ducimus velit commodi est sapiente. Eaque repellendus delectus, et quibusdam ipsum dolores nobis repellat iusto corrupti ut non incidunt, sed adipisci dolorem mollitia cumque vero libero placeat est quasi iste.",
      customer: {
        name: "Muhammad Muawiyah",
        title: "Software Developer",
        img: "https://avatars.githubusercontent.com/u/115263823",
      },
    },
    {
      title: "It was a great experience",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam aperiam alias vitae repellat nisi repudiandae eius voluptate, iusto debitis necessitatibus ducimus velit commodi est sapiente. Eaque repellendus delectus, et quibusdam ipsum dolores nobis repellat iusto corrupti ut non incidunt, sed adipisci dolorem mollitia cumque vero libero placeat est quasi iste.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam aperiam alias vitae repellat nisi repudiandae eius voluptate, iusto debitis necessitatibus ducimus velit commodi est sapiente. Eaque repellendus delectus, et quibusdam ipsum dolores nobis repellat iusto corrupti ut non incidunt, sed adipisci dolorem mollitia cumque vero libero placeat est quasi iste.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam aperiam alias vitae repellat nisi repudiandae eius voluptate, iusto debitis necessitatibus ducimus velit commodi est sapiente. Eaque repellendus delectus, et quibusdam ipsum dolores nobis repellat iusto corrupti ut non incidunt, sed adipisci dolorem mollitia cumque vero libero placeat est quasi iste.",
      customer: {
        name: "Arun Raj",
        title: "Founder of Weby Adroid",
        img: "https://muawiyah.dev/_next/static/media/unknown.9a88b064.png",
      },
    },
    {
      title: "It was a great experience",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam aperiam alias vitae repellat nisi repudiandae eius voluptate, iusto debitis necessitatibus ducimus velit commodi est sapiente. Eaque repellendus delectus, et quibusdam ipsum dolores nobis repellat iusto corrupti ut non incidunt, sed adipisci dolorem mollitia cumque vero libero placeat est quasi iste.",
      customer: {
        name: "Ibraheem",
        title: "CEO of Google",
        img: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
      },
    },
    {
      title: "It was a great experience",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam aperiam alias vitae repellat nisi repudiandae eius voluptate, iusto debitis necessitatibus ducimus velit commodi est sapiente. Eaque repellendus delectus, et quibusdam ipsum dolores nobis repellat iusto corrupti ut non incidunt, sed adipisci dolorem mollitia cumque vero libero placeat est quasi iste.",
      customer: {
        name: "Omar",
        title: "CEO of Microsoft",
        img: "https://cdn-icons-png.flaticon.com/512/4140/4140057.png",
      },
    },
  ];

  const [selectedItem, setSelectedItem] = useState<number>(0);

  return (
    <section className="lg:py-40 py-20 bg-gray-50">
      <div className="container">
        <h1 className="lg:text-5xl font-bold lg:mb-24 mb-12 text-3xl sm:text-4xl">
          What Our Customer Say
        </h1>

        <div className="flex flex-col lg:flex-row lg:gap-24 gap-10">
          <div className="space-y-1 lg:w-1/3">
            {testimonials.map((item, index: number) => (
              <User
                key={index}
                name={item.customer.name}
                title={item.customer.title}
                img={item.customer.img}
                onClick={() => {
                  setSelectedItem(index);
                }}
                className={index === selectedItem ? "bg-white" : "transparent"}
              />
            ))}
          </div>

          <div className="lg:w-2/3">
            <div className="bg-white p-5 lg:p-0 lg:bg-transparent rounded-xl">
              <h2 className="text-3xl font-bold mb-4">
                {testimonials[selectedItem].title}
              </h2>

              <Stars starSize={20} />

              <p className="mt-8 leading-[28px] text-gray-600">
                {testimonials[selectedItem].description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
