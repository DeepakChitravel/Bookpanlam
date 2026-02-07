import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BreadcrumbLink } from "@/link";
import ServicesSidebar from "../components/shared/services-sidebar";
import Service from "../components/cards/service";
import ServicesMobileFilter from "../components/shared/services-mobile-filter";
import { ServicesProps } from "@/types";
import { uploadsUrl } from "@/config";
import getSymbolFromCurrency from "currency-symbol-map";
import Pagination from "../components/Pagination";

const Services = ({ data, categories }: ServicesProps) => {
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
              <BreadcrumbPage>Services</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="fixed top-[40%] left-0">
          <ServicesMobileFilter categories={categories} />
        </div>

        <div className="lg:flex gap-10 mt-10">
          <div className="lg:block hidden w-[290px]">
            <ServicesSidebar categories={categories} />
          </div>

          <div className="lg:w-[calc(100%_-_290px)]">
            <div className="grid lg:grid-cols-3 grid-cols-1 sm:grid-cols-2 gap-5">
              {data.records?.map((service, index: number) => {
                const siteSettings =
                  service.user.siteSettings && service.user.siteSettings[0];
                return (
                  <div key={index}>
                    <Service
                      name={service.name}
                      slug={service.slug}
                      img={uploadsUrl + "/" + service.image}
                      location=""
                      price={{
                        price: parseInt(service.amount),
                        mrp: service.previousAmount
                          ? parseInt(service.previousAmount)
                          : undefined,
                      }}
                      currency={
                        getSymbolFromCurrency(
                          siteSettings?.currency as string
                        ) as string
                      }
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-10">
              <Pagination
                totalPages={data.totalPages}
                totalRecords={data.totalRecords}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
