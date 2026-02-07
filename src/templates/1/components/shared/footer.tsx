"use client";

import Link from "@/link";
import NextLink from "next/link";
import { Button } from "../ui/button";
import { ChevronRight, Mail, MapPin, Phone } from "lucide-react";
import { QUICK_LINKS } from "@/constants";
import { FooterProps } from "@/types";
import Logo from "@/components/logo";
import { uploadsUrl } from "@/config";
import { formatPhoneNumber } from "react-phone-number-input";
import Image from "next/image";
import { useParams } from "next/navigation";

const Footer = ({ user, categories }: FooterProps) => {
  const params = useParams();
  const slug = params.site as string; // ✅ slug from /[site]

  const siteSettings = user?.siteSettings?.[0] || {};

  // ✅ CALL QUICK_LINKS WITH SLUG
  const quickLinks = QUICK_LINKS(slug);

  const socialIcons = [
    { icon: "/social-icons/facebook.png", href: siteSettings?.facebook },
    { icon: "/social-icons/twitter.png", href: siteSettings?.twitter },
    { icon: "/social-icons/instagram.png", href: siteSettings?.instagram },
    { icon: "/social-icons/linkedin.png", href: siteSettings?.linkedin },
    { icon: "/social-icons/youtube.png", href: siteSettings?.youtube },
    {
      icon: "/social-icons/whatsapp.png",
      href: siteSettings?.whatsapp
        ? `https://wa.me/${siteSettings.whatsapp}`
        : null,
    },
  ];

  return (
    <footer className="bg-white py-20">
      <div className="container">
        <div className="flex flex-wrap gap-16 justify-between">
          {/* LOGO + ABOUT */}
          <div className="max-w-[400px]">
            <Link href={`/${slug}`}>
              <Logo
                imgUrl={
                  siteSettings?.logo
                    ? `${uploadsUrl}/${siteSettings.logo}`
                    : ""
                }
                name={user?.siteName || ""}
              />

            </Link>

            <p className="font-medium mt-5">{siteSettings?.address}</p>

            <Link href={`/${slug}`} className="block mt-8">
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full pr-1 text-white gap-4"
              >
                Book an Appointment
                <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <ChevronRight />
                </span>
              </Button>
            </Link>
          </div>

          {/* CATEGORIES */}
          <div className="max-w-[300px]">
            <h3 className="font-bold text-2xl mb-5">Our Categories</h3>
            <ul className="space-y-4">
              {categories?.map((item, index) => (
                <li key={index}>
                  <Link
                    href={`/${slug}/categories`}
                    className="hover:underline text-gray-500"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* QUICK LINKS */}
          <div className="max-w-[300px]">
            <h3 className="font-bold text-2xl mb-5">Quick Links</h3>
            <ul className="space-y-4">
              {quickLinks.map((item, index) => (
                <li key={index}>
                  <NextLink
                    href={item.href}
                    className="hover:underline text-gray-500"
                  >
                    {item.label}
                  </NextLink>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div className="max-w-[300px]">
            <h3 className="font-bold text-2xl mb-5">Contact</h3>
            <ul className="space-y-5">
              {siteSettings?.address && (
                <li className="flex gap-2 text-gray-500">
                  <MapPin />
                  {siteSettings.address}
                </li>
              )}

              {siteSettings?.phone && (
                <li className="flex gap-2 text-gray-500">
                  <Phone />
                  {formatPhoneNumber(siteSettings.phone)}
                </li>
              )}

              {siteSettings?.email && (
                <li className="flex gap-2 text-gray-500">
                  <Mail />
                  {siteSettings.email}
                </li>
              )}
            </ul>

            <ul className="flex items-center gap-6 mt-10">
              {socialIcons.map(
                (item, index) =>
                  item.href && (
                    <li key={index}>
                      <NextLink href={item.href} target="_blank">
                        <Image
                          src={item.icon}
                          alt=""
                          width={24}
                          height={24}
                        />
                      </NextLink>
                    </li>
                  )
              )}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
