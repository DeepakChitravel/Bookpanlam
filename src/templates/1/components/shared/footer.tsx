"use client";

import Link from "@/link";
import NextLink from "next/link";
import { Button } from "../ui/button";
import { ChevronRight, Mail, MapPin, Phone, FileText } from "lucide-react";
import { FooterProps } from "@/types";
import Logo from "@/components/logo";
import { uploadsUrl } from "@/config";
import { formatPhoneNumber } from "react-phone-number-input";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getFooterData, SiteSettings } from "@/lib/api/footer";
import { getWebsitePages } from "@/lib/api/website-pages";

interface SocialLink {
  platform: string;
  url: string | null;
  icon: string;
}

interface QuickLink {
  label: string;
  href: string;
}

interface Page {
  id: number;
  pageId: string;
  name: string;
  slug: string;
  content: string;
}

const Footer = ({ user, categories }: FooterProps) => {
  const params = useParams();
  const slug = params.site as string;

  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>("");
  const [copyright, setCopyright] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      if (!slug) return;
      
      try {
        // Fetch both footer data and pages
        const [footerResponse, pagesResponse] = await Promise.all([
          getFooterData(slug),
          getWebsitePages(slug)
        ]);
        
        if (footerResponse.success && footerResponse.data) {
          setSiteSettings(footerResponse.data.siteSettings);
          setSocialLinks(footerResponse.data.socialLinks);
          setQuickLinks(footerResponse.data.quickLinks);
          setDisclaimer(footerResponse.data.disclaimer);
          setCopyright(footerResponse.data.copyright);
        }

        // Set pages if available
        if (pagesResponse.success && pagesResponse.data && pagesResponse.data.length > 0) {
          setPages(pagesResponse.data);
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

  // Combine quick links and pages
  const allQuickLinks = [...quickLinks];
  
  // Add pages to quick links if they exist
  if (pages.length > 0) {
    pages.forEach(page => {
      // Check if page with similar name doesn't already exist in quickLinks
      const exists = allQuickLinks.some(link => 
        link.label.toLowerCase() === page.name.toLowerCase() || 
        link.href === `/${slug}/${page.slug}`
      );
      
      if (!exists) {
        allQuickLinks.push({
          label: page.name,
          href: `/${slug}/${page.slug}`
        });
      }
    });
  }

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
              {allQuickLinks.map((item, index) => (
                <li key={index}>
                  <NextLink
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="hover:underline text-gray-500 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-gray-400" />
                    {item.label}
                  </NextLink>
                </li>
              ))}

              {/* Show message if no links */}
              {allQuickLinks.length === 0 && (
                <li className="text-gray-400 text-sm">No quick links available</li>
              )}
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

            {/* Social Links */}
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