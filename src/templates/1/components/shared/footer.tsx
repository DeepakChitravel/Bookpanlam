"use client";

import Link from "@/link";
import NextLink from "next/link";
import { Button } from "../ui/button";
import { ChevronRight, Mail, MapPin, Phone } from "lucide-react";
import { FooterProps } from "@/types";
import Logo from "@/components/logo";
import { uploadsUrl } from "@/config";
import { formatPhoneNumber } from "react-phone-number-input";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getFooterData, SiteSettings } from "@/lib/api/footer";

interface SocialLink {
  platform: string;
  url: string | null;
  icon: string;
}

interface QuickLink {
  label: string;
  href: string;
}

const Footer = ({ user, categories }: FooterProps) => {
  const params = useParams();
  const slug = params.site as string;

  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>("");
  const [copyright, setCopyright] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      if (!slug) return;
      
      try {
        const response = await getFooterData(slug);
        if (response.success && response.data) {
          setSiteSettings(response.data.siteSettings);
          setSocialLinks(response.data.socialLinks);
          setQuickLinks(response.data.quickLinks);
          setDisclaimer(response.data.disclaimer);
          setCopyright(response.data.copyright);
        }
      } catch (error) {
        console.error("Failed to fetch footer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, [slug]);

  // Fallback to props if API fails
  const displaySettings = siteSettings || user?.siteSettings?.[0] || {};

  return (
    <footer className="bg-white py-20">
      <div className="container">
        <div className="flex flex-wrap gap-16 justify-between">
          {/* LOGO + ABOUT */}
          <div className="max-w-[400px]">
            <Link href={`/${slug}`}>
              <Logo
                imgUrl={
                  displaySettings?.logo
                    ? `${uploadsUrl}/${displaySettings.logo}`
                    : ""
                }
                name={user?.siteName || ""}
              />
            </Link>

            <p className="font-medium mt-5">{displaySettings?.address}</p>

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
              {displaySettings?.address && (
                <li className="flex gap-2 text-gray-500">
                  <MapPin />
                  {displaySettings.address}
                </li>
              )}

              {displaySettings?.phone && (
                <li className="flex gap-2 text-gray-500">
                  <Phone />
                  {formatPhoneNumber(displaySettings.phone)}
                </li>
              )}

              {displaySettings?.email && (
                <li className="flex gap-2 text-gray-500">
                  <Mail />
                  {displaySettings.email}
                </li>
              )}
            </ul>

            {/* Social Links - FIXED: Moved ul outside and properly structured */}
            {socialLinks.filter((item) => item.url).length > 0 && (
              <ul className="flex items-center gap-6 mt-10">
                {socialLinks
                  .filter((item) => item.url)
                  .map((item, index) => (
                    <li key={index}>
                      <NextLink
                        href={item.url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src={item.icon}
                          alt={item.platform}
                          width={24}
                          height={24}
                          className="hover:opacity-80 transition-opacity"
                        />
                      </NextLink>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>

        {/* Disclaimer and Copyright */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-gray-500 mb-4">{disclaimer}</p>
            <p className="text-sm text-gray-400">{copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;