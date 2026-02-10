"use client";
import { HeroSectionProps } from "@/types";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { getWebsiteSettings } from "@/lib/api/website-settings";
import { uploadsUrl } from "@/config";
import Search from "../forms/search";
import Link from "@/link";
import { Button } from "../ui/button";
import { ChevronRight, Star, Award, Shield, Clock, ArrowRight, ArrowLeft } from "lucide-react";

/* ✅ FIX banner path mismatch */
const normalizeBannerPath = (path: string) => {
  if (!path) return "";
  if (path.startsWith("seller/")) {
    return path.replace("seller/", "sellers/");
  }
  return path;
};

export default function HeroSection({ user }: HeroSectionProps) {
  const [settings, setSettings] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<NodeJS.Timeout | null>(null);
  const banners = settings?.banners ? (Array.isArray(settings.banners) ? settings.banners : []) : [];

  useEffect(() => {
    if (!user?.userId) return;

    getWebsiteSettings(user.userId).then((res) => {
      if (res?.success) {
        setSettings(res.data);
      }
    });
  }, [user?.userId]);

  // Auto-slide functionality
  useEffect(() => {
    if (banners.length <= 1) return;

    if (sliderRef.current) {
      clearInterval(sliderRef.current);
    }

    sliderRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => {
      if (sliderRef.current) {
        clearInterval(sliderRef.current);
      }
    };
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    resetTimer();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    resetTimer();
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    resetTimer();
  };

  const resetTimer = () => {
    if (sliderRef.current) {
      clearInterval(sliderRef.current);
    }
    sliderRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
  };

  // ⭐ If settings loaded AND hero has no content → hide whole section
  if (settings) {
    const heroEmpty =
      (!settings.hero_title || settings.hero_title.trim() === "") &&
      (!settings.hero_description || settings.hero_description.trim() === "") &&
      (!settings.hero_image || settings.hero_image.trim() === "") &&
      (!settings.banners || settings.banners.length === 0);

    if (heroEmpty) return null;
  }

  // ⭐ Show skeleton ONLY when loading settings (settings is null)
  if (!settings) {
    return (
      <section className="min-h-[200px] sm:min-h-[250px] md:min-h-[300px] bg-gray-100 animate-pulse rounded-lg my-6 md:my-8 lg:my-10" />
    );
  }

  const heroImage = `${uploadsUrl}/${settings.hero_image}`;

  return (
    <section className="relative overflow-hidden">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white to-transparent"></div>
      </div>

      {/* Main Hero Section */}
      <div className="relative container px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 lg:gap-12 xl:gap-16">

          {/* LEFT CONTENT */}
          <div className="lg:w-1/2 w-full">
            {/* Main Heading */}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-gray-900 tracking-tight mb-4 sm:mb-5 lg:mb-6">
              {settings.hero_title || "Discover Amazing Services"}
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-7 lg:mb-8 max-w-2xl">
              {settings.hero_description || "Book professional services with confidence. Quality guaranteed, satisfaction assured."}
            </p>

            {/* Stats - Simple & Clean */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-7 lg:mb-8">
              <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" fill="currentColor" />
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">4.9</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">Rating</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">500+</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">Experts</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">100%</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">Secure</p>
              </div>
            </div>

            {/* Search Box */}
            <div className="mb-6 sm:mb-7 lg:mb-8">
              <Search />
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Link href="/">
                <Button
                  size="lg"
                  className="h-11 sm:h-12 px-6 sm:px-8 rounded-lg bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
                >
                  <span className="flex items-center justify-center gap-2">
                    Book an Appointment
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </Link>

              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Clock className="w-4 h-4" />
                <span>Available 24/7</span>
              </div>
            </div>
          </div>

          {/* RIGHT HERO IMAGE */}
          <div className="lg:w-1/2 w-full mt-6 sm:mt-8 lg:mt-0">
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl">
              <div className="aspect-square sm:aspect-[4/5] lg:aspect-[4/5] relative">
                <Image
                  src={heroImage}
                  alt="Hero"
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  className="object-cover"
                />
                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>

        {/* SIMPLE BANNER SLIDER */}
        {banners.length > 0 && (
          <div className="mt-10 sm:mt-12 lg:mt-16 xl:mt-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-5 lg:mb-6 gap-3 sm:gap-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Featured Services</h2>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Explore our top offerings</p>
              </div>

              {/* Simple Navigation */}
              {banners.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevSlide}
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Slider Container */}
            <div className="relative">
              {/* Slider Track */}
              <div className="overflow-hidden rounded-lg sm:rounded-xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {banners.map((b: any, i: number) => (
                    <div key={i} className="w-full flex-shrink-0">
                      <div className="relative h-[200px] xs:h-[220px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] rounded-lg sm:rounded-xl overflow-hidden">
                        <Image
                          src={`${uploadsUrl}/${normalizeBannerPath(b.path)}`}
                          alt={`Featured Service ${i + 1}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                          className="object-cover"
                          priority={i === 0}
                        />
                        {/* Clean Overlay for better text visibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simple Dots Navigation */}
              {banners.length > 1 && (
                <div className="flex justify-center mt-4 sm:mt-5 lg:mt-6">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {banners.map((_: unknown, i: number) => (
                      <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        className="focus:outline-none"
                      >
                        <div className={`w-6 h-1.5 sm:w-8 sm:h-1.5 rounded-full transition-all duration-300 ${i === currentSlide
                            ? 'bg-primary'
                            : 'bg-gray-300 hover:bg-gray-400'
                          }`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Simple Slide Counter */}
            {banners.length > 1 && (
              <div className="text-center mt-3 sm:mt-4">
                <span className="text-xs sm:text-sm text-gray-500">
                  Slide {currentSlide + 1} of {banners.length}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}