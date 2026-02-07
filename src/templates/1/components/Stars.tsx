import { StarsProps } from "@/types";
import { Star } from "lucide-react";

const Stars = ({ starSize }: StarsProps) => {
  let size = 19;
  if (starSize) size = starSize;

  return (
    <div className="flex items-center gap-1">
      <Star
        className="text-[#fbc418] fill-[#fbc418]"
        width={size}
        height={size}
      />
      <Star
        className="text-[#fbc418] fill-[#fbc418]"
        width={size}
        height={size}
      />
      <Star
        className="text-[#fbc418] fill-[#fbc418]"
        width={size}
        height={size}
      />
      <Star
        className="text-[#fbc418] fill-[#fbc418]"
        width={size}
        height={size}
      />
      <Star
        className="text-gray-300 fill-gray-300"
        width={size}
        height={size}
      />
    </div>
  );
};

export default Stars;
