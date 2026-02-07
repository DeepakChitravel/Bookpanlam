import { LogoProps } from "@/types";
import Image from "next/image";

const Logo = ({ imgUrl, name }: LogoProps) => {
  return (
    <div className="flex items-center gap-3.5">
      <Image
        src={imgUrl}
        alt=""
        width={44}
        height={44}
        className="max-w-[44px] h-auto"
      />

      <span className="text-lg font-bold">{name}</span>
    </div>
  );
};

export default Logo;
