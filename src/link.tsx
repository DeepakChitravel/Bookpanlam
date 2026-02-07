"use client";
import NextLink from "next/link";
import { LinkProps } from "./types";
import { useParams } from "next/navigation";

import { BreadcrumbLink as BreadcrumbLinkComponent } from "@/components/ui/breadcrumb";

const Link = ({ children, href, target, className }: LinkProps) => {
  const { site } = useParams();

  return (
    <NextLink href={`/${site + href}`} target={target} className={className}>
      {children}
    </NextLink>
  );
};
export default Link;

export const BreadcrumbLink = ({ children, href }: LinkProps) => {
  const { site } = useParams();

  return (
    <BreadcrumbLinkComponent href={`/${site + href}`}>
      {children}
    </BreadcrumbLinkComponent>
  );
};
