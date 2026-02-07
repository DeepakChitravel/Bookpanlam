"use client";
import {HeroSectionProps } from "@/types";
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
    <section className="min-h-[300px] bg-gray-100 animate-pulse rounded-lg my-10" />
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
      <div className="relative container py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          
          {/* LEFT CONTENT */}
          <div className="lg:w-1/2 w-full">
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
              {settings.hero_title || "Discover Amazing Services"}
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl">
              {settings.hero_description || "Book professional services with confidence. Quality guaranteed, satisfaction assured."}
            </p>

            {/* Stats - Simple & Clean */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                  <span className="text-2xl font-bold text-gray-900">4.9</span>
                </div>
                <p className="text-sm text-gray-500">Rating</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  <span className="text-2xl font-bold text-gray-900">500+</span>
                </div>
                <p className="text-sm text-gray-500">Experts</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-gray-900">100%</span>
                </div>
                <p className="text-sm text-gray-500">Secure</p>
              </div>
            </div>

            {/* Search Box */}
            <div className="mb-8">
              <Search />
            </div>

            {/* CTA Button */}
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-lg bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <span className="flex items-center gap-2">
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
          <div className="lg:w-1/2 w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <div className="aspect-square lg:aspect-[4/5] relative">
                <Image
                  src={heroImage}
                  alt="Hero"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
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
          <div className="mt-16 lg:mt-20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Featured Services</h2>
                <p className="text-gray-600 mt-1">Explore our top offerings</p>
              </div>
              
              {/* Simple Navigation */}
              {banners.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevSlide}
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Slider Container */}
            <div className="relative">
              {/* Slider Track */}
              <div className="overflow-hidden rounded-xl">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {banners.map((b: any, i: number) => (
                    <div key={i} className="w-full flex-shrink-0">
                      <div className="relative h-[300px] md:h-[350px] lg:h-[400px] rounded-xl overflow-hidden">
                        <Image
                          src={`${uploadsUrl}/${normalizeBannerPath(b.path)}`}
                          alt={`Featured Service ${i + 1}`}
                          fill
                          sizes="100vw"
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
                <div className="flex justify-center mt-6">
                  <div className="flex items-center gap-2">
                    {banners.map((_: unknown, i: number) => (
                      <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        className="focus:outline-none"
                      >
                        <div className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                          i === currentSlide 
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
              <div className="text-center mt-4">
                <span className="text-sm text-gray-500">
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