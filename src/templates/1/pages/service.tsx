"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BreadcrumbLink } from "@/link";
import { Badge } from "@/components/ui/badge";
import ServiceCard from "../components/cards/service";
import Image from "next/image";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
// import required modules
import { Pagination, Navigation } from "swiper/modules";
import Stars from "../components/Stars";
import ServiceSidebar from "../components/shared/service-sidebar";
import { Button } from "../components/ui/button";
import { ServicePageProps } from "@/types";
import { uploadsUrl } from "@/config";
import getSymbolFromCurrency from "currency-symbol-map";

const Service = ({ data, services }: ServicePageProps) => {
  return (
    <div className="py-5">
      <div className="container">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{data.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Images */}
      <div className="my-10">
        <Swiper
          slidesPerView={1}
          spaceBetween={0}
          pagination={{
            type: "progressbar",
          }}
          breakpoints={{
            425: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1440: {
              slidesPerView: 4,
            },
          }}
          modules={[Pagination, Navigation]}
          className="mySwiper"
        >
          <SwiperSlide>
            <Image
              src={uploadsUrl + "/" + data?.image}
              alt=""
              width={900}
              height={300}
              className="max-h-[500px] w-full object-cover"
            />
          </SwiperSlide>

          {data?.additionalImages.map((image, index: number) => (
            <SwiperSlide key={index}>
              <Image
                src={uploadsUrl + "/" + image.image}
                alt=""
                width={900}
                height={300}
                className="max-h-[500px] w-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="container">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-[calc(100%_-_375px)] space-y-10">
            {/* heading */}
            <div className="bg-gray-50 w-full rounded-xl p-4 flex items-center justify-between">
              <div>
                {data.category && (
                  <Badge variant="default">{data.category.name}</Badge>
                )}

                <h1 className="text-3xl font-bold mt-2">{data.name}</h1>

                <div className="flex items-center gap-2 mt-3">
                  <span className="font-bold">4.0</span>
                  <Stars />
                  <span className="text-gray-500">(5 Reviews)</span>
                </div>
              </div>

              <div>
                <Button>Write a Review</Button>
              </div>
            </div>

            {data.description && (
              <div>
                <h3 className="text-2xl font-bold border-b pb-5 mb-5">
                  Description
                </h3>
                <p className="text-gray-600">{data.description}</p>
              </div>
            )}

            {/* Latest services */}
            <div>
              <h3 className="text-2xl font-bold border-b pb-5 mb-5">
                Latest Services
              </h3>
              <div className="grid lg:grid-cols-3 grid-cols-1 sm:grid-cols-2 gap-5">
                {services?.map((item, index: number) => {
                  const siteSettings =
                    item.user.siteSettings && item.user.siteSettings[0];

                  return (
                    <ServiceCard
                      key={index}
                      name={item.name}
                      slug={item.slug}
                      img={uploadsUrl + "/" + item.image}
                      location=""
                      price={{
                        price: parseInt(item.amount),
                        mrp: item.previousAmount
                          ? parseInt(item.previousAmount)
                          : undefined,
                      }}
                      currency={
                        getSymbolFromCurrency(
                          siteSettings?.currency as string
                        ) as string
                      }
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:w-[375px]">
            <ServiceSidebar service={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Service;
