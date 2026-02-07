import getSymbolFromCurrency from "currency-symbol-map";
import { Service as ServiceProps } from "@/types";
import Service from "../cards/service";
import { uploadsUrl } from "@/config";

type ServicesProps = {
  services: ServiceProps[];
  onBook?: (service: ServiceProps) => void; // ✅ optional
};

const Services = ({ services, onBook }: ServicesProps) => {
  return (
    <section className="lg:py-20 py-8 bg-[url('/templates/1/services-bg.jpg')] bg-no-repeat bg-cover bg-center">
      <div className="container">
        <h1 className="lg:text-5xl text-3xl sm:text-4xl font-bold text-center mb-12 lg:mb-20">
          See Our Services
        </h1>

        <div className="grid lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {services?.map((service, index: number) => {
            const siteSettings =
              service.user.siteSettings && service.user.siteSettings[0];

            return (
              <div key={index} className="relative">
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

                {/* ✅ BOOK BUTTON (only if onBook exists) */}
                {onBook && (
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => onBook(service)}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-white text-sm font-medium hover:opacity-90"
                    >
                      Book Now
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
