import { Mail, Clock, MapPin } from "lucide-react";
import Image from "next/image";

const TOPBAR_INFORMATIONS = [
  {
    icon: <Mail />,
    label: "abcrepair@email.com",
    href: "mailto:abcrepair@email.com",
  },
  {
    icon: <Clock />,
    label: "8:00am - 10:00pm",
  },
  {
    icon: <MapPin />,
    label: "17110 116th Ave SE Unit Arenton, WA 98058-5055",
  },
];

const SOCIAL_ICONS = [
  {
    icon: (
      <Image src="/social-icons/facebook.png" alt="" width={24} height={24} />
    ),
    href: "https://facebook.com",
  },
  {
    icon: (
      <Image src="/social-icons/twitter.png" alt="" width={24} height={24} />
    ),
    href: "https://twitter.com",
  },
  {
    icon: (
      <Image src="/social-icons/instagram.png" alt="" width={24} height={24} />
    ),
    href: "https://instagram.com",
  },
  {
    icon: (
      <Image src="/social-icons/whatsapp.png" alt="" width={24} height={24} />
    ),
    href: "https://whatsapp.com",
  },
];

const NAV_LINKS = (slug: string) => [
  {
    label: "Home",
    href: `/${slug}`,
  },
  {
    label: "Categories",
    href: `/${slug}/categories`,
  },
  {
    label: "Services",
    href: `/${slug}/services`,
  },
  {
    label: "Testimonials",
    href: `/${slug}/testimonials`,
  },
  {
    label: "Blog",
    href: `/${slug}/blog`,
  },
];


const QUICK_LINKS = (slug: string) => [
  {
    label: "Login",
    href: `/${slug}/login`,
  },
  {
    label: "Register",
    href: `/${slug}/register`,
  },
  {
    label: "My Account",
    href: `/${slug}/my-account`,
  },
  {
    label: "Bookings",
    href: `/${slug}/bookings`,
  },
];


const PROFILE_SIDEBAR_LINKS = [
  {
    label: "Profile",
    href: "/profile",
  },
  {
    label: "Appointments History",
    href: "/appointments",
  },
];

export {
  TOPBAR_INFORMATIONS,
  SOCIAL_ICONS,
  NAV_LINKS,
  QUICK_LINKS,
  PROFILE_SIDEBAR_LINKS,
};
